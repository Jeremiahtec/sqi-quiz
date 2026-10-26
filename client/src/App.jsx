/**
 * App.jsx — SQI Quiz
 * Root component. Detects role via ?role=host URL param.
 * Manages all socket events and app-level state machines for both Host and Player.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import { playLockIn } from './utils/soundEffects';

// Host views
import Dashboard from './views/host/Dashboard';
import QuizCreator from './views/host/QuizCreator';
import Lobby from './views/host/Lobby';
import Projector from './views/host/Projector';
import Standings from './views/host/Standings';
import PostGame from './views/host/PostGame';

// Player views
import Join from './views/player/Join';
import Waiting from './views/player/Waiting';
import Controller from './views/player/Controller';
import PlayerResult from './views/player/Result';

const isHost = new URLSearchParams(window.location.search).get('role') === 'host';

// ══════════════════════════════════════════════════════════════
// HOST APPLICATION
// ══════════════════════════════════════════════════════════════
function HostApp() {
  const { socketRef, connected } = useSocket();

  // View routing
  const [view, setView] = useState('dashboard');
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Game state
  const [activeQuiz, setActiveQuiz]           = useState(null);
  const [pin, setPin]                         = useState(null);
  const [players, setPlayers]                 = useState([]);
  const [activePlayerCount, setActivePlayerCount] = useState(null);
  const [questionIndex, setQuestionIndex]     = useState(-1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [phase, setPhase]                     = useState('waiting');
  const [answerCount, setAnswerCount]         = useState(0);
  const [revealData, setRevealData]           = useState(null);
  const [leaderboard, setLeaderboard]         = useState([]);
  const [finalData, setFinalData]             = useState(null);

  // Register socket events once on mount
  useEffect(() => {
    const interval = setInterval(() => {
      const socket = socketRef.current;
      if (!socket) return;
      clearInterval(interval);

      socket.on('host:room-created', ({ pin: newPin }) => {
        setPin(newPin);
        setPlayers([]);
        setActivePlayerCount(null);
        setQuestionIndex(-1);
        setCurrentQuestion(null);
        setPhase('waiting');
        setRevealData(null);
        setLeaderboard([]);
        setView('lobby');
      });

      socket.on('host:player-joined', ({ players: list }) => {
        setPlayers(list);
      });

      socket.on('host:answer-count', ({ count, total }) => {
        setAnswerCount(count);
        if (typeof total === 'number') {
          setActivePlayerCount(total);
        }
      });

      socket.on('game:question-host', (qData) => {
        setCurrentQuestion(qData);
        setQuestionIndex(qData.index);
        setPhase('question');
        setAnswerCount(0);
        setRevealData(null);
        setView('projector');
      });

      socket.on('game:reveal-data', (data) => {
        setRevealData(data);
        setLeaderboard(data.leaderboard);
        setPhase('reveal');
      });

      socket.on('game:standings', (data) => {
        setLeaderboard(data.leaderboard);
        setPhase('standings');
        setView('standings');
      });

      socket.on('game:ended', (data) => {
        setFinalData(data);
        setLeaderboard(data.leaderboard);
        setView('postgame');
      });
    }, 50);

    return () => clearInterval(interval);
  }, [socketRef]);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, [socketRef]);

  // ── Handlers ─────────────────────────────────────────────
  const handleHostGame = useCallback((quiz) => {
    setActiveQuiz(quiz);
    emit('host:create-room', { quiz });
  }, [emit]);

  const handleStartGame = useCallback(() => {
    emit('host:start-game', { pin });
  }, [emit, pin]);

  const handleReveal = useCallback(() => {
    emit('host:reveal', { pin });
  }, [emit, pin]);

  const handleShowStandings = useCallback(() => {
    emit('host:show-standings', { pin });
  }, [emit, pin]);

  const handleNextQuestion = useCallback(() => {
    const nextIdx = questionIndex + 1;
    if (activeQuiz && nextIdx >= activeQuiz.questions.length) {
      emit('host:end-game', { pin });
    } else {
      emit('host:next-question', { pin, questionIndex: nextIdx });
    }
  }, [emit, pin, questionIndex, activeQuiz]);

  // ── Render ────────────────────────────────────────────────
  switch (view) {
    case 'dashboard':
      return (
        <Dashboard
          connected={connected}
          onCreateNew={() => { setEditingQuiz(null); setView('creator'); }}
          onEdit={(quiz) => { setEditingQuiz(quiz); setView('creator'); }}
          onHost={handleHostGame}
        />
      );
    case 'creator':
      return (
        <QuizCreator
          initialQuiz={editingQuiz}
          onSave={() => setView('dashboard')}
          onCancel={() => setView('dashboard')}
        />
      );
    case 'lobby':
      return (
        <Lobby
          pin={pin}
          players={players}
          quiz={activeQuiz}
          connected={connected}
          onStart={handleStartGame}
          onKickPlayer={(nick) => socketRef.current?.emit('host:kick-player', { pin, nickname: nick })}
          socket={socketRef.current}
        />
      );
    case 'projector':
      return (
        <Projector
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={activeQuiz?.questions?.length || 0}
          phase={phase}
          answerCount={answerCount}
          totalPlayers={activePlayerCount !== null ? activePlayerCount : players.length}
          revealData={revealData}
          leaderboard={leaderboard}
          onReveal={handleReveal}
          onShowStandings={handleShowStandings}
          socket={socketRef.current}
        />
      );
    case 'standings':
      return (
        <Standings
          leaderboard={leaderboard}
          questionIndex={questionIndex}
          totalQuestions={activeQuiz?.questions?.length || 0}
          onNext={handleNextQuestion}
          socket={socketRef.current}
        />
      );
    case 'postgame':
      return (
        <PostGame
          finalData={finalData}
          onDone={() => setView('dashboard')}
          socket={socketRef.current}
        />
      );
    default:
      return null;
  }
}

// ══════════════════════════════════════════════════════════════
// PLAYER APPLICATION
// ══════════════════════════════════════════════════════════════
function PlayerApp() {
  const { socketRef } = useSocket();

  const [view, setView]                   = useState('join');
  const [joinError, setJoinError]         = useState('');
  const [isJoining, setIsJoining]         = useState(false);
  const [pin, setPin]                     = useState(() => {
    try { return sessionStorage.getItem('sqi_pin') || ''; } catch { return ''; }
  });
  const [nickname, setNickname]           = useState(() => {
    try { return sessionStorage.getItem('sqi_nickname') || ''; } catch { return ''; }
  });
  const [avatar, setAvatar]               = useState('🎓');
  const [questionData, setQuestionData]   = useState(null);
  const [hasAnswered, setHasAnswered]     = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [resultData, setResultData]       = useState(null);
  const [finalData, setFinalData]         = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const socket = socketRef.current;
      if (!socket) return;
      clearInterval(interval);

      socket.on('player:joined', ({ nickname: joinedNick, avatar: joinedAv }) => {
        setIsJoining(false);
        if (joinedAv) setAvatar(joinedAv);
        try {
          if (pin) sessionStorage.setItem('sqi_pin', pin);
          if (joinedNick || nickname) sessionStorage.setItem('sqi_nickname', joinedNick || nickname);
          if (joinedAv || avatar) sessionStorage.setItem('sqi_avatar', joinedAv || avatar);
        } catch {}
        setView('waiting');
      });

      socket.on('player:kicked', ({ message }) => {
        try {
          sessionStorage.removeItem('sqi_pin');
          sessionStorage.removeItem('sqi_nickname');
          sessionStorage.removeItem('sqi_avatar');
        } catch {}
        setIsJoining(false);
        setJoinError(message || 'You were removed from the lobby by the host.');
        setView('join');
      });

      socket.on('player:join-error', ({ message }) => {
        setIsJoining(false);
        setJoinError(message);
      });

      socket.on('game:started', () => {
        // Next event (game:question) will transition view
      });

      socket.on('game:question', (data) => {
        setQuestionData(data);
        setHasAnswered(false);
        setSelectedAnswer(null);
        setResultData(null);
        setView('controller');
      });

      socket.on('game:my-result', (data) => {
        setResultData(data);
        setView('result');
      });

      socket.on('game:ended', (data) => {
        try {
          sessionStorage.removeItem('sqi_pin');
          sessionStorage.removeItem('sqi_nickname');
          sessionStorage.removeItem('sqi_avatar');
        } catch {}
        setFinalData(data);
        setView('gameover');
      });

      socket.on('game:host-disconnected', () => {
        try {
          sessionStorage.removeItem('sqi_pin');
          sessionStorage.removeItem('sqi_nickname');
          sessionStorage.removeItem('sqi_avatar');
        } catch {}
        setJoinError('The host disconnected. The game has ended.');
        setView('join');
      });

      // Session recovery: check if player already had an active game
      try {
        const savedPin = sessionStorage.getItem('sqi_pin');
        const savedNick = sessionStorage.getItem('sqi_nickname');
        const savedAv = sessionStorage.getItem('sqi_avatar') || '🎓';
        if (savedPin && savedNick) {
          setPin(savedPin);
          setNickname(savedNick);
          setAvatar(savedAv);
          socket.emit('player:join', { pin: savedPin, nickname: savedNick, avatar: savedAv });
        }
      } catch {}
    }, 50);

    return () => clearInterval(interval);
  }, [socketRef, pin, nickname, avatar]);

  const handleJoin = useCallback((pinInput, nicknameInput, avatarInput) => {
    setPin(pinInput);
    setNickname(nicknameInput);
    const av = avatarInput || '🎓';
    setAvatar(av);
    setJoinError('');
    setIsJoining(true);
    socketRef.current?.emit('player:join', { pin: pinInput, nickname: nicknameInput, avatar: av });
  }, [socketRef]);

  const handleReaction = useCallback((emoji) => {
    socketRef.current?.emit('player:reaction', { pin, emoji });
  }, [pin, socketRef]);

  const handleAnswer = useCallback((answer, timeLeft) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedAnswer(answer);
    playLockIn();

    let targetPin = String(pin || '').trim();
    let targetNick = String(nickname || '').trim();
    try {
      if (!targetPin) targetPin = sessionStorage.getItem('sqi_pin') || '';
      if (!targetNick) targetNick = sessionStorage.getItem('sqi_nickname') || '';
    } catch {}

    const payload = { pin: targetPin, nickname: targetNick, timeLeft };
    if (typeof answer === 'string') {
      payload.answerText = answer;
    } else {
      payload.answerIndex = answer;
    }
    console.log('[player:answer] Emitting:', payload);
    socketRef.current?.emit('player:answer', payload);
  }, [hasAnswered, pin, nickname, socketRef]);

  switch (view) {
    case 'join':
      return <Join onJoin={handleJoin} error={joinError} isJoining={isJoining} />;
    case 'waiting':
      return <Waiting nickname={nickname} avatar={avatar} onReact={handleReaction} />;
    case 'controller':
      return (
        <Controller
          questionData={questionData}
          hasAnswered={hasAnswered}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          onReact={handleReaction}
        />
      );
    case 'result':
      return <PlayerResult resultData={resultData} onReact={handleReaction} />;
    case 'gameover':
      return <PlayerResult resultData={null} finalData={finalData} nickname={nickname} isGameOver onReact={handleReaction} />;
    default:
      return null;
  }
}

// ══════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════
export default function App() {
  return isHost ? <HostApp /> : <PlayerApp />;
}
