/**
 * Result.jsx — Player Result & Post-Game Analytics Screen
 * Shows:
 * 1. QuestionResult: Per-question feedback (points, streak, rank, correct answer).
 * 2. GameOver: Full tournament analytics terminal (final rank, total points,
 *    accuracy %, best streak, question-by-question breakdown, top leaderboard,
 *    reaction toolbar, and play again button).
 *
 * Designed with zero unwanted scrollbars, rich glassmorphism, and responsive bounds.
 */
import { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Target,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Medal,
} from 'lucide-react';
import ReactionToolbar from '../../components/ReactionToolbar';

// ── Per-Question Result ─────────────────────────────────────
function QuestionResult({ resultData, onReact }) {
  const {
    correct,
    scoreGain = 0,
    streakBonus = 0,
    streak = 0,
    totalScore = 0,
    rank = 1,
    correctAnswerText,
  } = resultData || {};

  return (
    <div
      className="layout-navy"
      style={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        textAlign: 'center',
        position: 'relative',
        overflowX: 'hidden',
        backgroundColor: '#070D1E',
      }}
    >
      <div
        className="animate-scale-in"
        style={{ position: 'relative', zIndex: 1, maxWidth: '380px', width: '100%' }}
      >
        {/* Big Animated Icon with radial glow */}
        <div style={{ marginBottom: '14px', position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: '50%',
              background: correct
                ? 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {correct ? (
            <div
              style={{
                display: 'inline-flex',
                padding: '16px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid rgba(16, 185, 129, 0.45)',
                boxShadow: '0 0 32px rgba(16, 185, 129, 0.35)',
              }}
            >
              <CheckCircle2 size={68} style={{ color: '#34d399' }} />
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                padding: '16px',
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '2px solid rgba(244, 63, 94, 0.45)',
                boxShadow: '0 0 32px rgba(244, 63, 94, 0.35)',
              }}
            >
              <XCircle size={68} style={{ color: '#f43f5e' }} />
            </div>
          )}
        </div>

        {/* Streak badge */}
        {correct && streak >= 2 && (
          <div
            className="animate-slide-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#fbbf24',
              borderRadius: '999px',
              padding: '5px 14px',
              fontSize: '0.85rem',
              fontWeight: 800,
              marginBottom: '10px',
            }}
          >
            <Flame size={15} fill="#fbbf24" color="#fbbf24" />
            <span>{streak} in a row!</span>
            {streakBonus > 0 && (
              <span style={{ opacity: 0.8, fontSize: '0.78rem' }}>(+{streakBonus} streak bonus)</span>
            )}
          </div>
        )}

        {/* Title */}
        <h2
          className="font-display"
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            margin: '0 0 4px',
            color: correct ? '#34d399' : '#f43f5e',
          }}
        >
          {correct ? 'Brilliant!' : 'Not Quite!'}
        </h2>

        {/* Correct answer display if missed */}
        {!correct && correctAnswerText && (
          <div
            style={{
              margin: '10px auto 16px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.86rem',
              fontWeight: 600,
              maxWidth: '320px',
            }}
          >
            <span style={{ opacity: 0.75, display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
              Correct Answer
            </span>
            {correctAnswerText}
          </div>
        )}

        {/* Score & Rank Card */}
        <div
          className="sqi-card-dark"
          style={{
            padding: '20px 24px',
            margin: '16px 0 20px',
            borderRadius: '18px',
            background: 'rgba(16, 27, 59, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {correct && (
            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px', fontWeight: 700 }}>
                Points Earned
              </p>
              <p className="font-display" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>
                +{(scoreGain || 0).toLocaleString()}
              </p>
            </div>
          )}

          <div
            style={{
              borderTop: correct ? '1px solid rgba(255,255,255,0.1)' : 'none',
              paddingTop: correct ? '14px' : 0,
              display: 'flex',
              justifyContent: 'space-around',
            }}
          >
            <div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px', fontWeight: 700 }}>
                Total Score
              </p>
              <p className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {(totalScore || 0).toLocaleString()}
              </p>
            </div>

            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: '20px' }}>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px', fontWeight: 700 }}>
                Current Rank
              </p>
              <p className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: rank === 1 ? '#fbbf24' : '#ffffff', margin: 0 }}>
                #{rank || '—'}
              </p>
            </div>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 16px' }}>
          <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
          Look up at the screen for standings…
        </p>

        {/* Reaction toolbar */}
        <ReactionToolbar onReact={onReact} />
      </div>
    </div>
  );
}

// ── Game Over Screen with Full Player Analytics ──────────────
function GameOver({ finalData, nickname, avatar, onReact, onPlayAgain }) {
  const [showQuestionReview, setShowQuestionReview] = useState(false);

  const leaderboard = finalData?.leaderboard || [];
  const questionStats = finalData?.questionStats || [];

  // Match player by nickname case-insensitively
  const cleanNick = String(nickname || '').trim().toLowerCase();
  const myEntry = leaderboard.find((p) => String(p.nickname || '').trim().toLowerCase() === cleanNick)
    || (leaderboard.length === 1 ? leaderboard[0] : null);

  const myRank = myEntry
    ? leaderboard.findIndex((p) => String(p.nickname || '').trim().toLowerCase() === String(myEntry.nickname || '').trim().toLowerCase()) + 1
    : 1;

  // Personal analytics calculations
  const myAnswers = myEntry?.answers || [];
  const totalQuestions = questionStats.length || myAnswers.length || 1;
  const correctCount = myAnswers.filter((a) => a?.correct).length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  const maxStreak = Math.max(0, ...myAnswers.map((a) => a?.streak || 0));
  const finalScore = myEntry?.score || 0;

  const isWinner = myRank === 1;
  const isSecond = myRank === 2;
  const isThird = myRank === 3;

  const medalIcon = isWinner ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : '🎖️';
  const rankTitle = isWinner
    ? 'Tournament Champion!'
    : isSecond
    ? '2nd Place Finish!'
    : isThird
    ? '3rd Place Finish!'
    : `Rank #${myRank} of ${leaderboard.length}`;

  const rankColor = isWinner ? '#fbbf24' : isSecond ? '#cbd5e1' : isThird ? '#f97316' : '#60a5fa';

  const auraGradient = isWinner
    ? 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
    : isSecond
    ? 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 0%, transparent 70%)'
    : isThird
    ? 'radial-gradient(circle, rgba(249, 115, 22, 0.25) 0%, transparent 70%)'
    : 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)';

  return (
    <div
      className="layout-navy"
      style={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '36px 20px 48px',
        textAlign: 'center',
        position: 'relative',
        overflowX: 'hidden',
        backgroundColor: '#070D1E',
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ── Top Hero Banner & Medal ───────────────────────── */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '180px',
              height: '180px',
              background: auraGradient,
              borderRadius: '50%',
              pointerEvents: 'none',
              filter: 'blur(10px)',
            }}
          />

          {/* Big Medal */}
          <div
            style={{
              fontSize: '4.2rem',
              lineHeight: 1,
              marginBottom: '10px',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
              animation: 'float 3.5s ease-in-out infinite',
            }}
          >
            {medalIcon}
          </div>

          <h2
            className="font-display"
            style={{
              fontSize: '2.1rem',
              fontWeight: 900,
              margin: '0 0 6px',
              color: rankColor,
              letterSpacing: '-0.01em',
            }}
          >
            {rankTitle}
          </h2>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '1.2rem' }}>{avatar || myEntry?.avatar || '🎓'}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              Well played, {myEntry?.nickname || nickname}!
            </span>
          </div>
        </div>

        {/* ── Final Score & Stats Terminal ─────────────────── */}
        <div
          className="sqi-card-dark"
          style={{
            padding: '24px',
            borderRadius: '20px',
            marginBottom: '18px',
            background: 'linear-gradient(180deg, rgba(16, 27, 59, 0.85) 0%, rgba(10, 17, 40, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: '0 0 6px',
            }}
          >
            Final Total Score
          </p>

          <div
            className="font-display"
            style={{
              fontSize: '3.4rem',
              fontWeight: 900,
              color: '#38bdf8',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '20px',
              textShadow: '0 0 24px rgba(56, 189, 248, 0.35)',
            }}
          >
            {finalScore.toLocaleString()}
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginLeft: '6px' }}>
              pts
            </span>
          </div>

          {/* 3-Stat Metric Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '16px',
            }}
          >
            {/* Accuracy */}
            <div
              style={{
                padding: '10px 8px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                <Target size={12} style={{ color: '#34d399' }} />
                <span>Accuracy</span>
              </div>
              <p className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#34d399' }}>
                {accuracy}%
              </p>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                {correctCount}/{totalQuestions}
              </span>
            </div>

            {/* Streak */}
            <div
              style={{
                padding: '10px 8px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                <Flame size={12} style={{ color: '#fbbf24' }} />
                <span>Streak</span>
              </div>
              <p className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#fbbf24' }}>
                {maxStreak}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                in a row
              </span>
            </div>

            {/* Place */}
            <div
              style={{
                padding: '10px 8px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                <Award size={12} style={{ color: '#60a5fa' }} />
                <span>Place</span>
              </div>
              <p className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: rankColor }}>
                #{myRank}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                of {leaderboard.length}
              </span>
            </div>
          </div>
        </div>

        {/* ── Question Performance Accordion ───────────────── */}
        {questionStats.length > 0 && (
          <div
            className="sqi-card-dark"
            style={{
              borderRadius: '16px',
              marginBottom: '18px',
              overflow: 'hidden',
              background: 'rgba(16, 27, 59, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => setShowQuestionReview(!showQuestionReview)}
              style={{
                width: '100%',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={15} style={{ color: '#60a5fa' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  Question Performance ({correctCount}/{totalQuestions})
                </span>
              </div>
              {showQuestionReview ? (
                <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              ) : (
                <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
              )}
            </button>

            {showQuestionReview && (
              <div
                className="animate-slide-up"
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {questionStats.map((q, idx) => {
                  const ans = myAnswers[idx];
                  const isCorrect = ans?.correct === true;
                  const pts = ans?.scoreGain || 0;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                        border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span style={{ color: 'rgba(255,255,255,0.45)', marginRight: '6px' }}>Q{idx + 1}</span>
                            {q.questionText}
                          </p>
                          {!isCorrect && q.correctAnswer && (
                            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                              Answer: {q.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: isCorrect ? '#38bdf8' : 'rgba(255, 255, 255, 0.3)',
                          fontFamily: "'Outfit', sans-serif",
                          flexShrink: 0,
                        }}
                      >
                        +{pts}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Top Leaderboard List ─────────────────────────── */}
        {leaderboard.length > 0 && (
          <div
            className="sqi-card-dark"
            style={{
              padding: '18px 20px',
              borderRadius: '16px',
              marginBottom: '20px',
              textAlign: 'left',
              background: 'rgba(16, 27, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <p
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: '0 0 12px',
              }}
            >
              Final Tournament Leaderboard
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.slice(0, 5).map((p, i) => {
                const isMe = String(p.nickname || '').trim().toLowerCase() === cleanNick;
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

                return (
                  <div
                    key={p.nickname}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: isMe ? 'rgba(37, 99, 235, 0.22)' : 'rgba(255, 255, 255, 0.03)',
                      border: isMe ? '1px solid rgba(37, 99, 235, 0.5)' : '1px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.9rem', width: '22px', textAlign: 'center' }}>
                        {medal}
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>{p.avatar || '🎓'}</span>
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: isMe ? 800 : 600,
                          color: isMe ? '#60a5fa' : '#ffffff',
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        {p.nickname} {isMe && <span style={{ fontSize: '0.74rem', opacity: 0.8 }}>(You)</span>}
                      </span>
                    </div>

                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        color: i === 0 ? '#fbbf24' : '#ffffff',
                      }}
                    >
                      {p.score.toLocaleString()} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Reaction Dock ───────────────────────────────── */}
        <div style={{ marginBottom: '18px' }}>
          <ReactionToolbar onReact={onReact} />
        </div>

        {/* ── Play Again Button ────────────────────────────── */}
        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '14px',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.45)',
            }}
          >
            <RotateCcw size={18} />
            <span>Play Again</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Exports ──────────────────────────────────────────────────
export default function PlayerResult({ resultData, isGameOver, finalData, nickname, avatar, onReact, onPlayAgain }) {
  if (isGameOver) {
    return (
      <GameOver
        finalData={finalData}
        nickname={nickname}
        avatar={avatar}
        onReact={onReact}
        onPlayAgain={onPlayAgain}
      />
    );
  }
  return <QuestionResult resultData={resultData} onReact={onReact} />;
}
