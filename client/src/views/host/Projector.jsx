/**
 * Projector.jsx — Live Game Projector View
 * Designed for classroom TV/projector display.
 * Shows: question text, optional code snippet / diagram image,
 * 4 coloured answer blocks, shrinking timer bar, audio countdown ticks,
 * live answer counter, and animated reveal states.
 */
import { useEffect, useRef, useState } from 'react';
import SoundToggle from '../../components/SoundToggle';
import FullscreenToggle from '../../components/FullscreenToggle';
import FloatingReactions from '../../components/FloatingReactions';
import { playTick, playReveal } from '../../utils/soundEffects';
import { Users, ChevronRight, Flag, CheckCircle, Code, Clock, Keyboard } from 'lucide-react';

// ── Answer option visual config ───────────────────────────────
const MC_OPTIONS = [
  {
    bg: 'var(--opt-red)',
    shape: (
      <svg viewBox="0 0 40 36" width="48" height="44" fill="currentColor" aria-hidden="true">
        <polygon points="20,2 38,34 2,34" />
      </svg>
    ),
  },
  {
    bg: 'var(--opt-blue)',
    shape: (
      <svg viewBox="0 0 36 36" width="44" height="44" fill="currentColor" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="4" />
      </svg>
    ),
  },
  {
    bg: 'var(--opt-yellow)',
    shape: (
      <svg viewBox="0 0 36 36" width="44" height="44" fill="currentColor" aria-hidden="true">
        <circle cx="18" cy="18" r="16" />
      </svg>
    ),
  },
  {
    bg: 'var(--opt-green)',
    shape: (
      <svg viewBox="0 0 40 46" width="44" height="50" fill="currentColor" aria-hidden="true">
        <polygon points="20,1 39,11.5 39,34.5 20,45 1,34.5 1,11.5" />
      </svg>
    ),
  },
];

const TF_OPTIONS = [
  { bg: 'var(--opt-green)', label: '✓ True' },
  { bg: 'var(--opt-red)', label: '✗ False' },
];

const TYPE_BADGE = {
  'multiple-choice': { label: 'Multiple Choice', color: '#6366f1' },
  'true-false':      { label: 'True / False',    color: '#06b6d4' },
  'open-ended':      { label: 'Open Ended',       color: '#f59e0b' },
};

export default function Projector({
  question, questionIndex, totalQuestions,
  phase, answerCount, totalPlayers,
  revealData, leaderboard,
  onReveal, onShowStandings,
  socket,
}) {
  const [timeExpired, setTimeExpired] = useState(false);
  const [remaining, setRemaining]     = useState(question?.timeLimit || 20);
  const [timerPct, setTimerPct]       = useState(100);
  const [countKey, setCountKey]       = useState(0);
  const prevCount                     = useRef(0);
  const startTimeRef                  = useRef(null);
  const lastTickSecRef                = useRef(null);

  const { type, options = [], correctAnswer, timeLimit = 20, code, imageUrl } = question || {};
  const isReveal = phase === 'reveal';

  const handleTimerExpire = () => {
    setTimeExpired(true);
    if (!isReveal) onReveal();
  };

  // Synchronized countdown & smooth measuring meter
  useEffect(() => {
    if (isReveal) {
      setRemaining(0);
      setTimerPct(0);
      return;
    }

    setTimeExpired(false);
    setRemaining(timeLimit);
    setTimerPct(100);

    startTimeRef.current = Date.now();
    lastTickSecRef.current = null;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const left = Math.max(0, timeLimit - elapsed);
      setRemaining(left);

      const pct = Math.max(0, Math.min(100, (left / timeLimit) * 100));
      setTimerPct(pct);

      const ceilSec = Math.ceil(left);
      if (ceilSec <= 5 && ceilSec > 0 && ceilSec !== lastTickSecRef.current) {
        lastTickSecRef.current = ceilSec;
        playTick(ceilSec <= 2);
      }

      if (left <= 0) {
        clearInterval(interval);
        handleTimerExpire();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [questionIndex, isReveal, timeLimit]);

  // Play reveal chime when answers are revealed
  useEffect(() => {
    if (isReveal) {
      playReveal();
    }
  }, [isReveal]);

  // Animate count badge when count changes
  useEffect(() => {
    if (answerCount !== prevCount.current) {
      prevCount.current = answerCount;
      setCountKey((k) => k + 1);
    }
  }, [answerCount]);

  if (!question) return null;

  const timerColor = isReveal
    ? 'rgba(255,255,255,0.2)'
    : timerPct > 50
    ? 'var(--opt-green)'
    : timerPct > 25
    ? 'var(--opt-yellow)'
    : 'var(--opt-red)';

  // Choose display options
  const displayOptions = type === 'true-false'
    ? TF_OPTIONS
    : type === 'open-ended'
    ? []
    : MC_OPTIONS.slice(0, options.length || 4);

  const badge = TYPE_BADGE[type] || TYPE_BADGE['multiple-choice'];

  return (
    <div className="layout-navy" style={{
      height: '100vh', width: '100%', maxWidth: '100%',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Floating reactions overlay */}
      <FloatingReactions socket={socket} />

      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        {/* Question counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Question
          </span>
          <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>
            {questionIndex + 1}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem' }}>/ {totalQuestions}</span>

          <span
            className="badge"
            style={{
              marginLeft: '8px',
              background: `${badge.color}22`,
              color: badge.color,
              border: `1px solid ${badge.color}44`,
            }}
          >
            {badge.label}
          </span>
        </div>

        {/* Answer counter & measuring countdown display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span
              key={countKey}
              className="font-display animate-count-pop"
              style={{ fontSize: '1.5rem', fontWeight: 900, color: answerCount > 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}
            >
              {answerCount}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>/ {totalPlayers} answered</span>
          </div>

          {/* Measuring display pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1.5px solid ${timerColor}55`,
            padding: '5px 14px',
            borderRadius: '999px',
            boxShadow: remaining <= 5 && !isReveal ? `0 0 12px ${timerColor}66` : 'none',
            transition: 'all 0.3s ease',
          }}>
            <Clock
              size={17}
              style={{
                color: timerColor,
                animation: remaining <= 5 && !isReveal ? 'pulse 0.5s ease-in-out infinite' : 'none',
                transition: 'color 0.3s ease',
              }}
            />

            {/* Inner measuring progress track */}
            <div style={{
              width: '70px',
              height: '7px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: isReveal ? '0%' : `${timerPct}%`,
                background: timerColor,
                borderRadius: '999px',
                transition: 'width 0.1s linear, background 0.4s ease',
              }} />
            </div>

            {/* Countdown seconds */}
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 800,
              color: timerColor,
              minWidth: '38px',
              textAlign: 'right',
              transition: 'color 0.3s ease',
            }}>
              {!isReveal ? `${Math.ceil(remaining)}s` : '—'}
            </span>
          </div>
        </div>

        {/* Controls & SQI brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FullscreenToggle />
          <SoundToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
            <span className="font-display" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)' }}>SQI Quiz</span>
          </div>
        </div>
      </div>

      {/* ── Measuring Countdown Bar across Projector ──────── */}
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: isReveal ? '0%' : `${timerPct}%`,
          background: timerColor,
          boxShadow: !isReveal ? `0 0 14px ${timerColor}99` : 'none',
          transition: 'width 0.1s linear, background 0.4s ease',
        }} />
      </div>

      {/* ── Question text & optional code/image ───────────── */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 40px 14px',
        position: 'relative', zIndex: 5,
      }}>
        <div
          className="sqi-card-dark animate-slide-up"
          style={{
            borderRadius: '20px',
            padding: '24px 36px',
            maxWidth: '920px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Optional Image */}
          {imageUrl && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={imageUrl}
                alt="Question Diagram"
                style={{
                  maxHeight: '160px',
                  maxWidth: '100%',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          <p
            className="font-display"
            style={{
              fontSize: 'clamp(1.3rem, 2.8vw, 2rem)',
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.35,
              letterSpacing: '-0.02em',
              color: '#fff',
            }}
          >
            {question.question}
          </p>

          {/* Optional Code Snippet */}
          {code && (
            <div style={{
              marginTop: '16px',
              textAlign: 'left',
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '12px 18px',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.9rem',
              color: '#7dd3fc',
              overflowX: 'auto',
              maxHeight: '150px',
              whiteSpace: 'pre',
            }}>
              <code>{code}</code>
            </div>
          )}

          {/* Open-ended: show correct answer on reveal */}
          {type === 'open-ended' && isReveal && (
            <div style={{
              marginTop: '16px',
              padding: '12px 20px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: '12px',
              color: '#34d399',
              fontWeight: 700,
              fontSize: '1.1rem',
            }}>
              ✓ Correct answer: {question.correctAnswer}
            </div>
          )}

          {/* Educational Takeaway / Explanation */}
          {question.explanation && isReveal && (
            <div className="animate-slide-up" style={{
              marginTop: '14px',
              padding: '10px 18px',
              background: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(37, 99, 235, 0.4)',
              borderRadius: '10px',
              color: '#93c5fd',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '1.15rem' }}>💡</span>
              <span><strong>Key Takeaway:</strong> {question.explanation}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Answer options grid ───────────────────────────── */}
      {type !== 'open-ended' && (
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: type === 'true-false' ? '1fr 1fr' : '1fr 1fr',
          gridTemplateRows:    type === 'true-false' ? '1fr'     : '1fr 1fr',
          gap: '12px',
          padding: '10px 28px 20px',
          position: 'relative', zIndex: 5,
        }}>
          {displayOptions.map((opt, idx) => {
            const actualText  = type === 'true-false' ? opt.label : (options[idx] || `Option ${idx + 1}`);
            const isCorrect   = isReveal && (idx === correctAnswer);
            const isDimmed    = isReveal && (idx !== correctAnswer);
            const answerCnt   = revealData?.optionCounts?.[idx] || 0;

            return (
              <div
                key={idx}
                id={`option-${idx}`}
                style={{
                  background: isDimmed ? 'rgba(255,255,255,0.05)' : opt.bg,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '18px 24px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background 0.4s, opacity 0.4s, transform 0.4s',
                  opacity: isDimmed ? 0.35 : 1,
                  transform: isCorrect ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isCorrect ? '0 0 24px rgba(16,185,129,0.35)' : 'none',
                  border: isCorrect ? '2px solid rgba(255,255,255,0.8)' : isDimmed ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                {/* Shape / icon */}
                <div style={{
                  color: isDimmed ? 'rgba(255,255,255,0.4)' : '#fff',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {opt.shape}
                </div>

                {/* Answer text */}
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(1rem, 2vw, 1.45rem)',
                    color: isDimmed ? 'rgba(255,255,255,0.4)' : '#fff',
                    flex: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {actualText}
                </span>

                {/* Reveal: answer count + correct badge */}
                {isReveal && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    marginLeft: 'auto', flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      color: isDimmed ? 'rgba(255,255,255,0.3)' : '#fff',
                      background: 'rgba(0,0,0,0.25)',
                      padding: '4px 12px',
                      borderRadius: '8px',
                    }}>
                      {answerCnt}
                    </span>

                    {isCorrect && (
                      <div className="animate-scale-in" style={{
                        background: '#fff',
                        borderRadius: '50%',
                        width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--opt-green)',
                      }}>
                        <CheckCircle size={22} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Open-Ended Typing Instructions Notice ── */}
      {type === 'open-ended' && !isReveal && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 32px',
          position: 'relative',
          zIndex: 5,
        }}>
          <div
            className="sqi-card-dark animate-scale-in"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '36px 44px',
              textAlign: 'center',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.08)',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.18)',
              border: '2px solid rgba(245, 158, 11, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.4rem',
              animation: 'bounce-in 0.6s ease',
            }}>
              ⌨️
            </div>

            <div>
              <span style={{
                display: 'inline-block',
                background: 'rgba(245, 158, 11, 0.25)',
                color: '#f59e0b',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '5px 16px',
                borderRadius: '999px',
                marginBottom: '12px',
              }}>
                Type-In Question
              </span>
              <h3 className="font-display" style={{
                fontSize: '2rem',
                fontWeight: 800,
                margin: '0 0 10px',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}>
                Type Your Answer On Your Device
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.75)',
                margin: 0,
                maxWidth: '520px',
                lineHeight: 1.5,
              }}>
                Players: look at your phone, type your answer into the text box, and press <strong>Submit Answer</strong> before time runs out.
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '10px 22px',
              borderRadius: '999px',
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginTop: '6px',
            }}>
              <span>📱 Open your mobile screen to type</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Open-Ended Reveal Breakdown ── */}
      {type === 'open-ended' && isReveal && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 32px',
          position: 'relative',
          zIndex: 5,
        }}>
          <div
            className="sqi-card-dark animate-scale-in"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '36px 40px',
              textAlign: 'center',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              padding: '14px 28px',
              borderRadius: '16px',
            }}>
              <CheckCircle size={26} style={{ color: 'var(--opt-green)' }} />
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', fontFamily: "'Outfit', sans-serif" }}>
                Accepted Answer: "{question.correctAnswer}"
              </span>
            </div>

            <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '440px', justifyContent: 'center' }}>
              <div style={{
                flex: 1,
                padding: '18px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Correct</p>
                <span className="font-display" style={{ fontSize: '2.4rem', fontWeight: 900, color: '#34d399' }}>
                  {revealData?.optionCounts?.correct || 0}
                </span>
              </div>

              <div style={{
                flex: 1,
                padding: '18px',
                borderRadius: '16px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Incorrect</p>
                <span className="font-display" style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f43f5e' }}>
                  {revealData?.optionCounts?.wrong || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Control bar ──────────────────────────────────── */}
      <div style={{
        padding: '16px 28px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        {!isReveal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse-ring 1.5s ease-in-out infinite',
            }} />
            Live — {answerCount} of {totalPlayers} answered
          </div>
        )}
        {isReveal && <div />} {/* Spacer */}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          {!isReveal && (
            <button
              id="reveal-btn"
              className="btn-ghost"
              onClick={onReveal}
              style={{ display: 'flex', alignItems: 'center', gap: '7px' }}
            >
              <Flag size={16} />
              Reveal Answers
            </button>
          )}

          {isReveal && (
            <button
              id="next-question-btn"
              className="btn-primary"
              onClick={onShowStandings}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', padding: '12px 28px' }}
            >
              Show Standings
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
