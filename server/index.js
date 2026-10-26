/**
 * server/index.js
 * SQI Quiz — Socket.io Game Server
 * Acts as a lightweight real-time router + scoring engine.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {
  createRoom,
  getRoom,
  deleteRoom,
  getAllRooms,
  addPlayer,
  kickPlayer,
  submitAnswer,
  revealAndScore,
  getQuestionStats,
} = require('./roomManager');

const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Static files & SPA fallback in production ─────────────
const distPath = path.join(__dirname, '../client/dist');
const hasDist = fs.existsSync(distPath);

if (hasDist) {
  app.use(express.static(distPath));
  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', service: 'SQI Quiz Server' })
  );
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) =>
    res.json({ status: 'ok', service: 'SQI Quiz Server' })
  );
}

// ─── Socket.io ──────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] ${socket.id} connected`);

  // ──────────────────────────────────────────────────────────
  // HOST: Create a new game room
  // ──────────────────────────────────────────────────────────
  socket.on('host:create-room', ({ quiz }) => {
    if (!quiz || !quiz.questions?.length) {
      socket.emit('host:error', { message: 'Invalid quiz data.' });
      return;
    }

    const pin = createRoom(socket.id, quiz);
    socket.join(pin);
    socket.data.isHost = true;
    socket.data.pin = pin;

    socket.emit('host:room-created', { pin });
    console.log(`[host] Room ${pin} created by ${socket.id}`);
  });

  // ──────────────────────────────────────────────────────────
  // PLAYER: Join a room
  // ──────────────────────────────────────────────────────────
  socket.on('player:join', ({ pin, nickname, avatar }) => {
    if (!pin || !nickname?.trim()) {
      socket.emit('player:join-error', { message: 'PIN and nickname are required.' });
      return;
    }

    const result = addPlayer(pin, nickname.trim(), socket.id, avatar);

    if (!result.success) {
      socket.emit('player:join-error', { message: result.error });
      return;
    }

    socket.join(pin);
    socket.data.isHost = false;
    socket.data.pin = pin;
    socket.data.nickname = nickname.trim();

    // Ack to joining player
    socket.emit('player:joined', { nickname: nickname.trim(), avatar: avatar || '🎓', reconnected: result.reconnected });

    // Notify host with updated player list (with avatars)
    const room = getRoom(pin);
    const playerList = [...room.players.entries()].map(([name, p]) => ({
      nickname: name,
      avatar: p.avatar || '🎓',
    }));
    io.to(room.hostSocketId).emit('host:player-joined', { players: playerList });

    // Catch up reconnected player if a question is currently live
    if (result.reconnected && room.phase === 'question') {
      const currentQ = room.quiz.questions[room.currentQuestionIndex];
      if (currentQ) {
        const elapsed = (Date.now() - (room.questionStartTime || Date.now())) / 1000;
        const remaining = Math.max(0, currentQ.timeLimit - elapsed);
        socket.emit('game:question', {
          index: room.currentQuestionIndex,
          type: currentQ.type,
          timeLimit: Math.round(remaining),
          optionCount: _getOptionCount(currentQ),
        });
      }
    }

    console.log(`[player] ${nickname} joined room ${pin} (${playerList.length} players)`);
  });

  // ──────────────────────────────────────────────────────────
  // PLAYER: Live emoji reaction
  // ──────────────────────────────────────────────────────────
  socket.on('player:reaction', ({ pin, emoji, nickname }) => {
    const rawPin = pin || socket.data?.pin;
    if (!rawPin || !emoji) return;
    const sender = String(nickname || socket.data?.nickname || '').trim();
    io.to(String(rawPin)).emit('game:reaction', {
      emoji,
      nickname: sender,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
  });

  // ──────────────────────────────────────────────────────────
  // HOST: Kick a player from lobby
  // ──────────────────────────────────────────────────────────
  socket.on('host:kick-player', ({ pin, nickname }) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return;

    const kickedSocketId = kickPlayer(pin, nickname);
    if (kickedSocketId) {
      io.to(kickedSocketId).emit('player:kicked', {
        message: 'You have been removed from the lobby by the host.',
      });
    }

    const playerList = [...room.players.entries()].map(([name, p]) => ({
      nickname: name,
      avatar: p.avatar || '🎓',
    }));
    io.to(room.hostSocketId).emit('host:player-joined', { players: playerList });
    console.log(`[host] Kicked ${nickname} from ${pin}`);
  });

  // ──────────────────────────────────────────────────────────
  // HOST: Start the game → 5s countdown → sends Q1
  // ──────────────────────────────────────────────────────────
  socket.on('host:start-game', ({ pin }) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return;

    room.phase = 'countdown';

    // Broadcast countdown start to everyone in room
    io.to(pin).emit('game:starting', {
      duration: 5,
      totalQuestions: room.quiz.questions?.length || 1,
    });

    console.log(`[host] 5s countdown started in room ${pin}`);

    let remaining = 5;
    const interval = setInterval(() => {
      remaining--;
      if (!getRoom(pin) || room.phase !== 'countdown') {
        clearInterval(interval);
        return;
      }

      if (remaining > 0) {
        io.to(pin).emit('game:countdown-tick', { count: remaining });
      } else {
        clearInterval(interval);
        _launchQuestionZero(pin, room);
      }
    }, 1000);
  });

  // ──────────────────────────────────────────────────────────
  // HOST: Advance to next question
  // ──────────────────────────────────────────────────────────
  socket.on('host:next-question', ({ pin, questionIndex }) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return;

    room.phase = 'question';
    room.currentQuestionIndex = questionIndex;
    room.answerBuffer = new Map();
    room.questionStartTime = Date.now();

    const question = room.quiz.questions[questionIndex];
    const optionCount = _getOptionCount(question);
    const isDoublePoints = Boolean(question.doublePoints || question.pointsMultiplier === 2);
    const isLast = (questionIndex + 1) === room.quiz.questions.length;

    socket.to(pin).emit('game:question', {
      index: questionIndex,
      type: question.type,
      timeLimit: question.timeLimit,
      optionCount,
      question: question.question,
      doublePoints: isDoublePoints,
      isLastQuestion: isLast,
      totalQuestions: room.quiz.questions.length,
    });

    socket.emit('game:question-host', _buildHostQuestion(question, questionIndex, room.quiz.questions.length));

    // Send initial 0-answer count with active connected total
    const activeTotal = _getActiveConnectedPlayers(room).length;
    socket.emit('host:answer-count', { count: 0, total: activeTotal });

    console.log(`[host] Q${questionIndex} sent to ${pin} (${activeTotal} active players)`);
  });

  // ──────────────────────────────────────────────────────────
  // PLAYER: Submit answer
  // ──────────────────────────────────────────────────────────
  socket.on('player:answer', (data = {}) => {
    // 1. Resolve room from payload, socket session, or active rooms scan
    let pin = String(data.pin || socket.data?.pin || '').trim();
    let room = pin ? getRoom(pin) : null;

    if (!room) {
      for (const [p, r] of getAllRooms()) {
        for (const [, pData] of r.players) {
          if (pData.socketId === socket.id) {
            room = r;
            pin = p;
            break;
          }
        }
        if (room) break;
      }
    }

    if (!room) {
      console.warn(`[player:answer] Room not found for socket ${socket.id} (pin attempted: "${pin}")`);
      return;
    }

    // 2. Resolve player nickname
    let nickname = String(data.nickname || socket.data?.nickname || '').trim();
    if (!nickname || !room.players.has(nickname)) {
      for (const [nick, pData] of room.players) {
        if (pData.socketId === socket.id || nick.toLowerCase() === nickname.toLowerCase()) {
          nickname = nick;
          break;
        }
      }
    }

    if (!nickname || !room.players.has(nickname)) {
      console.warn(`[player:answer] Player "${nickname}" not found in room ${pin} for socket ${socket.id}`);
      return;
    }

    if (room.phase !== 'question') {
      console.warn(`[player:answer] Room ${pin} is in phase "${room.phase}" (not "question"), ignoring answer from ${nickname}`);
      return;
    }

    const timeLeft = typeof data.timeLeft === 'number' ? data.timeLeft : 0;
    const answer = (data.answerIndex !== undefined && data.answerIndex !== null)
      ? { index: data.answerIndex }
      : { text: data.answerText };

    submitAnswer(room, nickname, answer, timeLeft);

    console.log(`[player:answer] Recorded answer for "${nickname}" in room ${pin} (timeLeft: ${timeLeft}s)`);

    _checkAndTriggerReveal(pin, room);
  });

  // ──────────────────────────────────────────────────────────
  // HOST: Reveal answers & score
  // ──────────────────────────────────────────────────────────
  socket.on('host:reveal', ({ pin }) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return;

    _executeReveal(pin, room);
  });

  // ──────────────────────────────────────────────────────────
  // HOST: Show standings (intermediate leaderboard)
  // ──────────────────────────────────────────────────────────
  socket.on('host:show-standings', ({ pin }) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return;

    room.phase = 'standings';

    // The host needs the leaderboard to display it
    const leaderboard = [...room.players.entries()]
      .map(([nickname, d]) => ({ nickname, avatar: d.avatar || '🎓', score: d.score }))
      .sort((a, b) => b.score - a.score);

    socket.emit('game:standings', { leaderboard });
    console.log(`[host] Show standings in ${pin}`);
  });

  // ──────────────────────────────────────────────────────────
  // HOST: End game
  // ──────────────────────────────────────────────────────────
  socket.on('host:end-game', ({ pin }) => {
    const room = getRoom(pin);
    if (!room || room.hostSocketId !== socket.id) return;

    room.phase = 'ended';

    const questionStats = getQuestionStats(room);
    const leaderboard = [...room.players.entries()]
      .map(([nickname, d]) => ({
        nickname,
        avatar: d.avatar || '🎓',
        score: d.score,
        streak: d.streak || 0,
        answers: d.answers,
      }))
      .sort((a, b) => b.score - a.score);

    io.to(pin).emit('game:ended', { leaderboard, questionStats });

    deleteRoom(pin);
    console.log(`[host] Game ended in ${pin}`);
  });

  // ──────────────────────────────────────────────────────────
  // Disconnect handler
  // ──────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`[-] ${socket.id} disconnected (${reason})`);

    // Host disconnected -> end room
    if (socket.data.isHost && socket.data.pin) {
      const pin = socket.data.pin;
      io.to(pin).emit('game:host-disconnected', {});
      deleteRoom(pin);
      console.log(`[host] Host disconnected, room ${pin} deleted`);
      return;
    }

    // Player disconnected
    if (socket.data.pin && socket.data.nickname) {
      const { pin, nickname } = socket.data;
      const room = getRoom(pin);
      if (room) {
        console.log(`[player] ${nickname} disconnected from room ${pin} (phase: ${room.phase})`);

        if (room.phase === 'lobby') {
          // Remove from lobby cleanly
          room.players.delete(nickname);
          room.answerBuffer.delete(nickname);

          const playerList = [...room.players.entries()].map(([name, p]) => ({
            nickname: name,
            avatar: p.avatar || '🎓',
          }));
          io.to(room.hostSocketId).emit('host:player-joined', { players: playerList });
        } else if (room.phase === 'question') {
          // Check if all remaining connected players have answered
          _checkAndTriggerReveal(pin, room);
        }
      }
    }
  });
});

// ─── Private helpers ───────────────────────────────────────

/**
 * Returns list of players who are either actively connected via socket
 * OR have already submitted an answer for this question.
 */
function _getActiveConnectedPlayers(room) {
  if (!room) return [];
  const active = [];
  for (const [nickname, playerData] of room.players) {
    const playerSocket = io.sockets.sockets.get(playerData.socketId);
    const isConnected = !!(playerSocket && playerSocket.connected);
    const hasAnswered = room.answerBuffer.has(nickname);
    if (isConnected || hasAnswered) {
      active.push({ nickname, playerData });
    }
  }
  return active;
}

/**
 * Checks if all active players in the room have answered.
 * If yes, cuts the countdown immediately and triggers reveal.
 */
function _checkAndTriggerReveal(pin, room) {
  if (!room || room.phase !== 'question') return;

  const activePlayers = _getActiveConnectedPlayers(room);
  const totalActive = activePlayers.length;
  const answeredCount = room.answerBuffer.size;

  // Live count for host screen
  io.to(room.hostSocketId).emit('host:answer-count', {
    count: answeredCount,
    total: totalActive,
  });

  console.log(`[room ${pin}] Answer progress: ${answeredCount}/${totalActive} active players answered`);

  // CUT TIMER & REVEAL IMMEDIATELY when all active players have answered
  if (totalActive > 0 && answeredCount >= totalActive) {
    console.log(`[room ${pin}] All active players (${answeredCount}/${totalActive}) have answered! Cutting timer and revealing now.`);
    _executeReveal(pin, room);
  }
}

function _launchQuestionZero(pin, room) {
  if (!room) return;
  room.phase = 'question';
  room.currentQuestionIndex = 0;
  room.answerBuffer = new Map();
  room.questionStartTime = Date.now();

  const question = room.quiz.questions[0];
  const optionCount = _getOptionCount(question);

  // Broadcast "started" + first question to players
  const isFirstDouble = Boolean(question.doublePoints || question.pointsMultiplier === 2);
  const isFirstLast = 1 === room.quiz.questions.length;

  io.to(pin).emit('game:started', {});
  io.to(pin).emit('game:question', {
    index: 0,
    type: question.type,
    timeLimit: question.timeLimit,
    optionCount,
    question: question.question,
    doublePoints: isFirstDouble,
    isLastQuestion: isFirstLast,
    totalQuestions: room.quiz.questions.length,
  });

  // Send full question to host
  io.to(room.hostSocketId).emit('game:question-host', _buildHostQuestion(question, 0, room.quiz.questions.length));

  const activeTotal = _getActiveConnectedPlayers(room).length;
  io.to(room.hostSocketId).emit('host:answer-count', { count: 0, total: activeTotal });

  console.log(`[room ${pin}] Q0 live after 5s countdown (${activeTotal} active players)`);
}

function _executeReveal(pin, room) {
  if (room.phase !== 'question') return;
  room.phase = 'reveal';

  const result = revealAndScore(room);

  // Personal result for every player
  for (const [nickname, playerData] of room.players) {
    const playerSocket = io.sockets.sockets.get(playerData.socketId);
    if (!playerSocket) continue;

    const answerRecord = playerData.answers[room.currentQuestionIndex];
    const rank = result.leaderboard.findIndex(p => p.nickname === nickname) + 1;

    playerSocket.emit('game:my-result', {
      correct: answerRecord?.correct || false,
      scoreGain: answerRecord?.scoreGain || 0,
      streakBonus: answerRecord?.streakBonus || 0,
      streak: playerData.streak || 0,
      totalScore: playerData.score,
      correctIndex: result.correctIndex,
      correctAnswerText: result.correctAnswerText,
      rank,
    });
  }

  // Full data → host
  io.to(room.hostSocketId).emit('game:reveal-data', result);

  // Updated leaderboard → whole room
  io.to(pin).emit('game:scores', { leaderboard: result.leaderboard });

  console.log(`[server] Revealed Q${room.currentQuestionIndex} in ${pin}`);
}

function _getOptionCount(question) {
  if (question.type === 'multiple-choice') return question.options?.length || 4;
  if (question.type === 'true-false') return 2;
  return 0; // open-ended
}

function _buildHostQuestion(question, index, totalQuestions = 0) {
  const isDoublePoints = Boolean(question.doublePoints || question.pointsMultiplier === 2);
  const isLast = totalQuestions > 0 ? (index + 1) === totalQuestions : false;
  return {
    index,
    question: question.question,
    options:
      question.type === 'true-false'
        ? ['True', 'False']
        : question.options || [],
    type: question.type,
    correctAnswer: question.correctAnswer,
    timeLimit: question.timeLimit,
    code: question.code || null,
    codeLanguage: question.codeLanguage || 'javascript',
    imageUrl: question.imageUrl || null,
    explanation: question.explanation || null,
    doublePoints: isDoublePoints,
    isLastQuestion: isLast,
  };
}

// ─── Start ─────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🎓 SQI Quiz Server running → http://localhost:${PORT}\n`);
});
