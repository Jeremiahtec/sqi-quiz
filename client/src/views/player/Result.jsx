/**
 * Result.jsx — Player Result & Post-Game Analytics Screen
 * Shows:
 * 1. QuestionResult: Per-question feedback (points, streak, rank, correct answer).
 * 2. GameOver: Full tournament analytics (final rank, total points, accuracy %,
 *    best streak, question-by-question breakdown, top leaderboard, and play again).
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
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--sqi-navy)',
      }}
    >
      <div
        className="animate-scale-in"
        style={{ position: 'relative', zIndex: 1, maxWidth: '360px', width: '100%' }}
      >
        {/* Big Animated Icon */}
        <div style={{ marginBottom: '14px', animation: 'scale-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
          {correct ? (
            <div style={{
              display: 'inline-flex', padding: '16px', borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
            }}>
              <CheckCircle2 size={72} style={{ color: 'var(--opt-green)' }} />
            </div>
          ) : (
            <div style={{
              display: 'inline-flex', padding: '16px', borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid rgba(244, 63, 94, 0.4)',
              boxShadow: '0 0 30px rgba(244, 63, 94, 0.3)',
            }}>
              <XCircle size={72} style={{ color: 'var(--opt-red)' }} />
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
            {streakBonus > 0 && <span style={{ opacity: 0.85 }}>(+{streakBonus} bonus)</span>}
          </div>
        )}

        {/* Correct / Incorrect Header */}
        <h1
          className="font-display"
          style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            margin: '0 0 6px',
            color: correct ? 'var(--opt-green)' : 'var(--opt-red)',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {correct ? 'Correct!' : 'Incorrect!'}
        </h1>

        {/* Show correct answer if wrong */}
        {!correct && correctAnswerText && (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            padding: '10px 16px',
            margin: '0 auto 16px',
            maxWidth: '320px',
          }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Correct answer:</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              {correctAnswerText}
            </p>
          </div>
        )}

        {/* Score & Rank Card */}
        <div
          className="sqi-card-dark"
          style={{
            padding: '20px 24px',
            marginBottom: '18px',
            background: 'rgba(10, 17, 40, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {correct && (
            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px', fontWeight: 700 }}>
                Points Earned
              </p>
              <p className="font-display" style={{ fontSize: '2.6rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>
                +{(scoreGain || 0).toLocaleString()}
              </p>
            </div>
          )}

          <div style={{
            borderTop: correct ? '1px solid rgba(255,255,255,0.1)' : 'none',
            paddingTop: correct ? '14px' : 0,
            display: 'flex',
            justifyContent: 'space-around',
          }}>
            <div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px', fontWeight: 700 }}>
                Total Score
              </p>
              <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {(totalScore || 0).toLocaleString()}
              </p>
            </div>

            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: '20px' }}>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px', fontWeight: 700 }}>
                Current Rank
              </p>
              <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: rank === 1 ? '#fbbf24' : '#ffffff', margin: 0 }}>
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

  const medalEmoji = isWinner ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : '🎖️';
  const rankTitle = isWinner
    ? 'Tournament Champion!'
    : isSecond
    ? '2nd Place Finish!'
    : isThird
    ? '3rd Place Finish!'
    : `Rank #${myRank} of ${leaderboard.length}`;

  const rankColor = isWinner ? '#fbbf24' : isSecond ? '#94a3b8' : isThird ? '#cd7f32' : 'var(--sqi-accent)';

  return (
    <div
      className="layout-navy"
      style={{
        minHeight: '100dvh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 20px',
        textAlign: 'center',
        position: 'relative',
        overflowY: 'auto',
        backgroundColor: 'var(--sqi-navy)',
      }}
    >
      <div
        className="animate-scale-in"
        style={{ position: 'relative', zIndex: 1, maxWidth: '420px', width: '100%', paddingBottom: '32px' }}
      >
        {/* Hero Medal Badge */}
        <div style={{
          fontSize: '4.5rem',
          lineHeight: 1,
          marginBottom: '12px',
          animation: 'bounce-in 0.6s cubic-bezier(0.175,0.885,0.32,1.275)',
          filter: isWinner ? 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))' : 'none',
        }}>
          {medalEmoji}
        </div>

        {/* Title & Nickname */}
        <h1
          className="font-display"
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            margin: '0 0 4px',
            color: rankColor,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {rankTitle}
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 600, margin: '0 0 22px' }}>
          Well played, <span style={{ color: '#ffffff', fontWeight: 800 }}>{myEntry?.nickname || nickname}</span>!
        </p>

        {/* ── Main Performance Score Card ──────────────────── */}
        <div
          className="sqi-card-dark"
          style={{
            padding: '24px 20px',
            borderRadius: '20px',
            marginBottom: '20px',
            background: isWinner
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(10, 17, 40, 0.95) 100%)'
              : 'rgba(10, 17, 40, 0.9)',
            border: isWinner ? '2px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
          }}
        >
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px', fontWeight: 700 }}>
            Final Total Score
          </p>
          <p
            className="font-display"
            style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              color: isWinner ? '#fbbf24' : '#38bdf8',
              margin: '0 0 16px',
              lineHeight: 1,
            }}
          >
            {finalScore.toLocaleString()}
            <span style={{ fontSize: '1.1rem', fontWeight: 700, marginLeft: '6px', color: 'rgba(255,255,255,0.4)' }}>pts</span>
          </p>

          {/* 3 Metric Analytics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            {/* Accuracy */}
            <div style={{ padding: '8px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <Target size={12} />
                <span>Accuracy</span>
              </div>
              <p className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: accuracy >= 70 ? 'var(--opt-green)' : accuracy >= 40 ? 'var(--opt-yellow)' : 'var(--opt-red)', margin: '4px 0 0' }}>
                {accuracy}%
              </p>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                {correctCount}/{totalQuestions}
              </span>
            </div>

            {/* Streak */}
            <div style={{ padding: '8px 4px', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <Flame size={12} />
                <span>Best Streak</span>
              </div>
              <p className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0 0' }}>
                {maxStreak}🔥
              </p>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>in a row</span>
            </div>

            {/* Final Position */}
            <div style={{ padding: '8px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <Award size={12} />
                <span>Place</span>
              </div>
              <p className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: rankColor, margin: '4px 0 0' }}>
                #{myRank}
              </p>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>of {leaderboard.length}</span>
            </div>
          </div>
        </div>

        {/* ── Question-by-Question Performance Breakdown ───── */}
        {questionStats.length > 0 && (
          <div
            className="sqi-card-dark"
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              marginBottom: '20px',
              textAlign: 'left',
              background: 'rgba(10, 17, 40, 0.75)',
            }}
          >
            <div
              onClick={() => setShowQuestionReview(!showQuestionReview)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--sqi-accent)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  Question Performance ({correctCount}/{totalQuestions})
                </span>
              </div>
              {showQuestionReview ? <ChevronUp size={18} style={{ color: 'rgba(255,255,255,0.5)' }} /> : <ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />}
            </div>

            {showQuestionReview && (
              <div className="animate-slide-up" style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {questionStats.map((q, idx) => {
                  const ans = myAnswers[idx];
                  const isCorrect = ans?.correct;
                  const pts = ans?.scoreGain || 0;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: isCorrect ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <span style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          color: isCorrect ? 'var(--opt-green)' : 'var(--opt-red)',
                          fontWeight: 800, fontSize: '0.75rem',
                          flexShrink: 0,
                        }}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Q{idx + 1}: {q.questionText}
                          </p>
                          {!isCorrect && q.correctAnswer && (
                            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--opt-green)', fontWeight: 600 }}>
                              Answer: {q.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.85rem', fontWeight: 800,
                        color: isCorrect ? '#38bdf8' : 'rgba(255,255,255,0.3)',
                        fontFamily: "'Outfit', sans-serif",
                        flexShrink: 0,
                      }}>
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
              marginBottom: '24px',
              textAlign: 'left',
              background: 'rgba(10, 17, 40, 0.75)',
            }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
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
                      background: isMe ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: isMe ? '1px solid rgba(37, 99, 235, 0.45)' : '1px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.9rem', width: '22px', textAlign: 'center' }}>
                        {medal}
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>{p.avatar || '🎓'}</span>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: isMe ? 800 : 600,
                        color: isMe ? '#60a5fa' : '#ffffff',
                      }}>
                        {p.nickname} {isMe && '(You)'}
                      </span>
                    </div>

                    <span style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: i === 0 ? '#fbbf24' : '#ffffff',
                    }}>
                      {p.score.toLocaleString()} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reaction Dock */}
        <div style={{ marginBottom: '20px' }}>
          <ReactionToolbar onReact={onReact} />
        </div>

        {/* Play Again Button */}
        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'var(--sqi-accent)',
              boxShadow: '0 4px 18px rgba(37, 99, 235, 0.35)',
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
