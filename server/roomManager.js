/**
 * roomManager.js
 * In-memory store for all active quiz game rooms.
 * The server acts as a lightweight router — scoring + state live here.
 */

const rooms = new Map();

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─────────────────────────────────────────────────────────────
// Room CRUD
// ─────────────────────────────────────────────────────────────

function createRoom(hostSocketId, quiz) {
  let pin;
  do {
    pin = generatePin();
  } while (rooms.has(pin));

  rooms.set(pin, {
    pin,
    hostSocketId,
    quiz,
    players: new Map(),        // nickname → { score, answers[], socketId }
    currentQuestionIndex: -1,
    phase: 'lobby',            // 'lobby' | 'question' | 'reveal' | 'ended'
    answerBuffer: new Map(),   // nickname → { answer: {index?} | {text?}, timeLeft }
    questionStartTime: null,
  });

  return pin;
}

function getRoom(pin) {
  if (!pin) return null;
  return rooms.get(String(pin).trim());
}

function deleteRoom(pin) {
  if (!pin) return;
  rooms.delete(String(pin).trim());
}

function getAllRooms() {
  return rooms;
}

// ─────────────────────────────────────────────────────────────
// Player Management
// ─────────────────────────────────────────────────────────────

/**
 * Adds a player to the room.
 * Returns { success, error }
 */
function addPlayer(pin, nickname, socketId, avatar = '🎓') {
  const room = getRoom(pin);
  if (!room) return { success: false, error: 'Room not found.' };

  const cleanNick = String(nickname || '').trim();

  // Allow reconnection if player already exists
  if (room.players.has(cleanNick)) {
    const player = room.players.get(cleanNick);
    player.socketId = socketId;
    if (avatar) player.avatar = avatar;
    return { success: true, reconnected: true };
  }

  if (room.phase !== 'lobby') return { success: false, error: 'Game already started.' };

  room.players.set(cleanNick, {
    score: 0,
    streak: 0,
    avatar: avatar || '🎓',
    answers: [],
    socketId,
  });

  return { success: true, reconnected: false };
}

/**
 * Removes a player from the room (kick by host).
 * Returns the socketId of the kicked player, or null.
 */
function kickPlayer(pin, nickname) {
  const room = getRoom(pin);
  if (!room) return null;
  const cleanNick = String(nickname || '').trim();
  if (!room.players.has(cleanNick)) return null;
  const player = room.players.get(cleanNick);
  room.players.delete(cleanNick);
  room.answerBuffer.delete(cleanNick);
  return player.socketId;
}

// ─────────────────────────────────────────────────────────────
// Game Flow
// ─────────────────────────────────────────────────────────────

/**
 * Records a player's answer (no-op if already answered).
 */
function submitAnswer(room, nickname, answer, timeLeft) {
  if (!room) return;
  let targetNick = String(nickname || '').trim();
  if (!room.players.has(targetNick)) {
    for (const [name] of room.players) {
      if (name.toLowerCase() === targetNick.toLowerCase()) {
        targetNick = name;
        break;
      }
    }
  }
  if (!targetNick || room.answerBuffer.has(targetNick)) return;
  room.answerBuffer.set(targetNick, { answer, timeLeft: Math.max(0, timeLeft || 0) });
}

/**
 * Calculates scores after the host reveals the answer.
 * Mutates room.players[].score and room.players[].answers.
 * Returns { correctIndex, correctAnswerText, optionCounts, leaderboard }
 */
function revealAndScore(room) {
  const qIdx = room.currentQuestionIndex;
  const question = room.quiz.questions[qIdx];
  const timeLimit = question.timeLimit || 20;

  // Determine correctIndex (for display)
  const correctIndex = question.type !== 'open-ended' ? question.correctAnswer : -1;

  // Init option counts
  const optionCounts = {};
  if (question.type === 'multiple-choice') {
    (question.options || []).forEach((_, i) => { optionCounts[i] = 0; });
  } else if (question.type === 'true-false') {
    optionCounts[0] = 0;
    optionCounts[1] = 0;
  } else {
    optionCounts.correct = 0;
    optionCounts.wrong = 0;
  }

  // Score players who answered
  for (const [nickname, { answer, timeLeft }] of room.answerBuffer) {
    const playerData = room.players.get(nickname);
    if (!playerData) continue;

    let isCorrect = false;

    if (question.type === 'open-ended') {
      const submitted = (answer.text || '').toLowerCase().trim();
      const expected = (question.correctAnswer || '').toLowerCase().trim();
      isCorrect = submitted === expected;
    } else {
      isCorrect = answer.index === question.correctAnswer;
    }

    let scoreGain = 0;
    let streakBonus = 0;
    if (isCorrect) {
      playerData.streak = (playerData.streak || 0) + 1;
      // Score: 1000 pts max, scaled by time remaining. Min 100 pts.
      const baseScore = Math.max(100, Math.round(1000 * (timeLeft / timeLimit)));
      // Streak bonus: +50 pts per step beyond 1 (capped at +250)
      streakBonus = Math.min(250, Math.max(0, (playerData.streak - 1) * 50));
      scoreGain = baseScore + streakBonus;
      playerData.score += scoreGain;
    } else {
      playerData.streak = 0;
    }

    playerData.answers[qIdx] = {
      correct: isCorrect,
      scoreGain,
      streakBonus,
      streak: playerData.streak,
    };

    // Update option counts
    if (question.type === 'open-ended') {
      if (isCorrect) optionCounts.correct++;
      else optionCounts.wrong++;
    } else if (answer.index !== undefined && answer.index !== null) {
      optionCounts[answer.index] = (optionCounts[answer.index] || 0) + 1;
    }
  }

  // Players who did NOT answer — still record in their answers array
  for (const [nickname, playerData] of room.players) {
    if (!room.answerBuffer.has(nickname)) {
      playerData.streak = 0;
      playerData.answers[qIdx] = { correct: false, scoreGain: 0, streakBonus: 0, streak: 0 };
    }
  }

  // Build sorted leaderboard
  const leaderboard = [...room.players.entries()]
    .map(([nickname, d]) => ({
      nickname,
      avatar: d.avatar || '🎓',
      score: d.score,
      streak: d.streak || 0,
      answers: d.answers,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    correctIndex,
    correctAnswerText: question.type === 'open-ended' ? question.correctAnswer : null,
    optionCounts,
    leaderboard,
  };
}

/**
 * Returns per-question class accuracy stats for the post-game report.
 */
function getQuestionStats(room) {
  return room.quiz.questions.map((q, i) => {
    const totalPlayers = room.players.size;
    const answeredCount = [...room.players.values()].filter(p => p.answers[i] !== undefined).length;
    const correctCount = [...room.players.values()].filter(p => p.answers[i]?.correct).length;

    let displayCorrect = q.correctAnswer;
    if (q.type === 'multiple-choice' && Array.isArray(q.options)) {
      displayCorrect = q.options[q.correctAnswer] || `Option ${q.correctAnswer + 1}`;
    } else if (q.type === 'true-false') {
      displayCorrect = q.correctAnswer === 0 ? 'True' : 'False';
    }

    return {
      questionIndex: i,
      questionText: q.question,
      type: q.type,
      correctAnswer: displayCorrect,
      accuracy: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
      correctCount,
      answeredCount,
      totalPlayers,
    };
  });
}

module.exports = {
  createRoom,
  getRoom,
  deleteRoom,
  getAllRooms,
  addPlayer,
  kickPlayer,
  submitAnswer,
  revealAndScore,
  getQuestionStats,
};
