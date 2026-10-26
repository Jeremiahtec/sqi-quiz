/**
 * Controller.jsx — Player Game Controller
 * Full-viewport tactile answer buttons with solid SQI color pads.
 * Players look at the projector; the phone is purely a responsive tactile input device.
 *
 * Layout: 2×2 grid for Multiple Choice (solid Red, Blue, Amber, Green)
 *         1×2 stack for True/False (solid Green True, Red False)
 *         Card input for Open-Ended
 */
import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Send, Zap, Clock, Tv } from 'lucide-react';
import ReactionToolbar from '../../components/ReactionToolbar';

// ── Answer option config with solid colors and bold white icons ──
const MC_OPTIONS = [
  {
    bg: 'var(--opt-red)',
    shape: (
      <svg viewBox="0 0 40 36" width="52" height="46" fill="currentColor" aria-hidden="true">
        <polygon points="20,2 38,34 2,34" />
      </svg>
    ),
    label: 'A',
  },
  {
    bg: 'var(--opt-blue)',
    shape: (
      <svg viewBox="0 0 36 36" width="46" height="46" fill="currentColor" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="4" />
      </svg>
    ),
    label: 'B',
  },
  {
    bg: 'var(--opt-yellow)',
    shape: (
      <svg viewBox="0 0 36 36" width="46" height="46" fill="currentColor" aria-hidden="true">
        <circle cx="18" cy="18" r="16" />
      </svg>
    ),
    label: 'C',
  },
  {
    bg: 'var(--opt-green)',
    shape: (
      <svg viewBox="0 0 40 46" width="46" height="52" fill="currentColor" aria-hidden="true">
        <polygon points="20,1 39,11.5 39,34.5 20,45 1,34.5 1,11.5" />
      </svg>
    ),
    label: 'D',
  },
];

const TF_OPTIONS = [
  {
    bg: 'var(--opt-green)',
    label: 'TRUE',
    symbol: (
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    value: 0,
  },
  {
    bg: 'var(--opt-red)',
    label: 'FALSE',
    symbol: (
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    value: 1,
  },
];

export default function Controller({ questionData, hasAnswered, selectedAnswer, onAnswer, onReact }) {
  const [timeLeft, setTimeLeft]     = useState(null);
  const [openText, setOpenText]     = useState('');
  const startTimeRef                = useRef(null);
  const timerRef                    = useRef(null);

  // Reset and start countdown when a new question arrives
  useEffect(() => {
    if (!questionData) return;
    setOpenText('');
    startTimeRef.current = Date.now();
    setTimeLeft(questionData.timeLimit);

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, questionData.timeLimit - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timerRef.current);
    }, 200);

    return () => clearInterval(timerRef.current);
  }, [questionData]);

  // Stop countdown as soon as the player locks in their answer
  useEffect(() => {
    if (hasAnswered && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [hasAnswered]);

  if (!questionData) return null;

  const { type, optionCount } = questionData;
  const isTimedOut = timeLeft !== null && timeLeft <= 0;

  const potentialPoints = timeLeft !== null && questionData.timeLimit > 0
    ? Math.max(100, Math.round(1000 * (timeLeft / questionData.timeLimit)))
    : 1000;

  // ── Handlers ─────────────────────────────────────────────
  const handleMCAnswer = (idx) => {
    if (hasAnswered || isTimedOut) return;
    const tl = Math.max(0, timeLeft ?? 0);
    onAnswer(idx, tl);
  };

  const handleOpenSubmit = () => {
    if (hasAnswered || isTimedOut || !openText.trim()) return;
    const tl = Math.max(0, timeLeft ?? 0);
    onAnswer(openText.trim(), tl);
  };

  // ── Timer calculations ───────────────────────────────────
  const timerPct = timeLeft !== null && questionData.timeLimit > 0
    ? Math.max(0, Math.min(100, (timeLeft / questionData.timeLimit) * 100))
    : 100;
  const timerColor = timerPct > 50 ? 'var(--opt-green)' : timerPct > 25 ? 'var(--opt-yellow)' : 'var(--opt-red)';

  return (
    <div className="layout-navy" style={{
      height: '100dvh', width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--sqi-navy)',
    }}>
      {/* ── Measuring progress bar at very top ─────────────── */}
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: hasAnswered ? '100%' : `${timerPct}%`,
          background: hasAnswered ? 'var(--opt-green)' : timerColor,
          boxShadow: `0 0 10px ${hasAnswered ? 'var(--opt-green)' : timerColor}`,
          transition: 'width 0.2s linear, background 0.4s ease',
        }} />
      </div>

      {/* ── Top Header bar ─────────────────────────────────── */}
      <div style={{
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        background: 'rgba(10, 17, 40, 0.75)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(8px)',
      }}>
        {/* Question pill */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '999px',
          padding: '4px 12px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '0.04em',
        }}>
          QUESTION {questionData.index + 1}
        </div>

        {/* Potential points badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          padding: '4px 12px',
          borderRadius: '999px',
          color: '#fbbf24',
          fontSize: '0.82rem',
          fontWeight: 700,
        }}>
          <Zap size={14} fill="#fbbf24" color="#fbbf24" />
          <span>{potentialPoints} pts</span>
        </div>

        {/* Countdown capsule */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: `1px solid ${hasAnswered ? 'var(--opt-green)' : timerColor}66`,
          padding: '4px 12px',
          borderRadius: '999px',
          minWidth: '58px',
          justifyContent: 'center',
        }}>
          <Clock size={13} style={{ color: hasAnswered ? 'var(--opt-green)' : timerColor }} />
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            color: hasAnswered ? 'var(--opt-green)' : timerColor,
            fontFamily: "'Outfit', sans-serif",
          }}>
            {hasAnswered ? 'LOCKED' : (timeLeft !== null ? `${Math.ceil(timeLeft)}s` : '—')}
          </span>
        </div>
      </div>

      {/* ── Multiple Choice: 2×2 Solid Color Pad Grid ────────── */}
      {type === 'multiple-choice' && (
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '12px',
          padding: '12px',
        }}>
          {MC_OPTIONS.slice(0, optionCount || 4).map((opt, idx) => {
            const isSelected = hasAnswered && selectedAnswer === idx;
            const isDimmed   = hasAnswered && selectedAnswer !== idx;
            return (
              <button
                key={idx}
                id={`answer-${idx}`}
                className="tactile-pad"
                onClick={() => handleMCAnswer(idx)}
                disabled={hasAnswered || isTimedOut}
                style={{
                  background: opt.bg,
                  color: '#ffffff',
                  opacity: isDimmed ? 0.22 : 1,
                  transform: isSelected ? 'scale(1.02)' : isDimmed ? 'scale(0.96)' : 'scale(1)',
                  boxShadow: isSelected
                    ? '0 0 0 4px #ffffff, 0 12px 32px rgba(0,0,0,0.5)'
                    : '0 8px 24px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.35)',
                  filter: isDimmed ? 'grayscale(45%)' : 'none',
                  transition: 'transform 0.15s ease, opacity 0.3s ease, filter 0.3s ease, box-shadow 0.25s ease',
                  padding: '16px',
                  position: 'relative',
                }}
              >
                {/* Shape Icon */}
                <div style={{
                  color: '#ffffff',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
                }}>
                  {opt.shape}
                </div>

                {/* Bold Letter Pill */}
                <span className="font-display" style={{
                  fontWeight: 900,
                  fontSize: '1.6rem',
                  color: '#ffffff',
                  lineHeight: 1,
                  letterSpacing: '0.04em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}>
                  {opt.label}
                </span>

                {/* Selected Pill Badge */}
                {isSelected && (
                  <div className="animate-scale-in" style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ffffff',
                    color: 'var(--sqi-navy)',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}>
                    <CheckCircle2 size={12} style={{ color: 'var(--opt-green)' }} />
                    <span>LOCKED</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── True/False: 1×2 Solid Color Pad Stack ────────────── */}
      {type === 'true-false' && (
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
          gap: '14px',
          padding: '14px',
        }}>
          {TF_OPTIONS.map((opt) => {
            const isSelected = hasAnswered && selectedAnswer === opt.value;
            const isDimmed   = hasAnswered && selectedAnswer !== opt.value;
            return (
              <button
                key={opt.value}
                id={`tf-answer-${opt.value}`}
                className="tactile-pad"
                onClick={() => handleMCAnswer(opt.value)}
                disabled={hasAnswered || isTimedOut}
                style={{
                  background: opt.bg,
                  color: '#ffffff',
                  opacity: isDimmed ? 0.22 : 1,
                  transform: isSelected ? 'scale(1.02)' : isDimmed ? 'scale(0.97)' : 'scale(1)',
                  boxShadow: isSelected
                    ? '0 0 0 4px #ffffff, 0 12px 32px rgba(0,0,0,0.5)'
                    : '0 8px 24px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.35)',
                  filter: isDimmed ? 'grayscale(45%)' : 'none',
                  transition: 'transform 0.15s ease, opacity 0.3s ease, filter 0.3s ease, box-shadow 0.25s ease',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '18px',
                  position: 'relative',
                }}
              >
                <div style={{
                  color: '#ffffff',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
                }}>
                  {opt.symbol}
                </div>
                <span className="font-display" style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  textShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}>
                  {opt.label}
                </span>

                {/* Selected Pill Badge */}
                {isSelected && (
                  <div className="animate-scale-in" style={{
                    position: 'absolute',
                    top: '12px',
                    right: '14px',
                    background: '#ffffff',
                    color: 'var(--sqi-navy)',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--opt-green)' }} />
                    <span>LOCKED</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Open-Ended: Dark card input ──────────────────────── */}
      {type === 'open-ended' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '20px',
        }}>
          <div className="sqi-card-dark" style={{
            padding: '24px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}>
              <Tv size={18} style={{ color: 'var(--sqi-accent)' }} />
              <span>Read the question on the projector screen</span>
            </div>

            <textarea
              className="input-dark"
              rows={3}
              placeholder="Type your answer here…"
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              disabled={hasAnswered || isTimedOut}
              style={{
                resize: 'none',
                fontSize: '1.1rem',
                textAlign: 'center',
                fontWeight: 600,
              }}
            />

            <button
              id="oe-submit"
              className="btn-primary"
              onClick={handleOpenSubmit}
              disabled={hasAnswered || isTimedOut || !openText.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                padding: '14px 20px',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'var(--sqi-accent)',
              }}
            >
              <Send size={18} />
              Submit Answer
            </button>
          </div>

          {isTimedOut && !hasAnswered && (
            <p style={{ color: 'var(--opt-red)', fontWeight: 700, fontSize: '0.95rem' }}>
              ⏰ Time's up!
            </p>
          )}
        </div>
      )}

      {/* ── Floating Answer Locked In status banner ───────────── */}
      {hasAnswered && (
        <div className="animate-slide-up" style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          zIndex: 20,
          background: 'rgba(10, 17, 40, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '16px',
          backdropFilter: 'blur(16px)',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--opt-green)' }} />
            <span className="font-display" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Answer Locked In!
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
            Waiting for other players & host…
          </p>
          {/* Reaction toolbar so players can tap emojis while waiting */}
          <div style={{ marginTop: '2px' }}>
            <ReactionToolbar onReact={onReact} />
          </div>
        </div>
      )}
    </div>
  );
}
