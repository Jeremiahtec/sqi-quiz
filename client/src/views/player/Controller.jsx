/**
 * Controller.jsx — Player Game Controller
 * High-production mobile input console with Kahoot-style question intro preview.
 *
 * Flow:
 * 1. Question Intro Phase (3.5s):
 *    - Highlights Question Number, Special Kind badge (Double Points, Open-Ended, True/False, Multiple Choice),
 *      and Question Text on the mobile screen.
 *    - Countdown ring: "Options unlock in 3... 2... 1..."
 *    - Tactile pads are locked in anticipation so players don't misclick.
 * 2. Active Phase:
 *    - Pads activate with a pop!
 *    - Measuring timer counts down from timeLimit to 0.
 *    - Player taps tactile colored pad to lock in answer.
 */
import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Send, Zap, Clock, Tv, Sparkles, Flame, Lock } from 'lucide-react';
import ReactionToolbar from '../../components/ReactionToolbar';

const INTRO_SECONDS = 3.5;

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
  const [introActive, setIntroActive]       = useState(true);
  const [introRemaining, setIntroRemaining] = useState(INTRO_SECONDS);
  const [timeLeft, setTimeLeft]             = useState(null);
  const [openText, setOpenText]             = useState('');

  const startTimeRef    = useRef(null);
  const timerRef        = useRef(null);
  const introTimerRef   = useRef(null);

  // ── 1. Intro Countdown Phase ─────────────────────────────
  useEffect(() => {
    if (!questionData) return;
    setOpenText('');
    setIntroActive(true);
    setIntroRemaining(INTRO_SECONDS);
    setTimeLeft(questionData.timeLimit);

    const introStart = Date.now();
    introTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - introStart) / 1000;
      const left = Math.max(0, INTRO_SECONDS - elapsed);
      setIntroRemaining(left);

      if (left <= 0) {
        clearInterval(introTimerRef.current);
        setIntroActive(false);
      }
    }, 50);

    return () => {
      if (introTimerRef.current) clearInterval(introTimerRef.current);
    };
  }, [questionData]);

  // ── 2. Active Question Countdown (starts after intro) ────
  useEffect(() => {
    if (!questionData || introActive) return;

    startTimeRef.current = Date.now();
    setTimeLeft(questionData.timeLimit);

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, questionData.timeLimit - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timerRef.current);
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questionData, introActive]);

  // Stop countdown as soon as the player locks in their answer
  useEffect(() => {
    if (hasAnswered && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [hasAnswered]);

  if (!questionData) return null;

  const { type, optionCount, doublePoints, isLastQuestion, question: qText, totalQuestions } = questionData;
  const isTimedOut = timeLeft !== null && timeLeft <= 0;
  const isDoublePoints = Boolean(doublePoints);

  const potentialPoints = timeLeft !== null && questionData.timeLimit > 0
    ? Math.max(100, Math.round(1000 * (timeLeft / questionData.timeLimit))) * (isDoublePoints ? 2 : 1)
    : (isDoublePoints ? 2000 : 1000);

  // ── Handlers ─────────────────────────────────────────────
  const handleMCAnswer = (idx) => {
    if (introActive || hasAnswered || isTimedOut) return;
    const tl = Math.max(0, timeLeft ?? 0);
    onAnswer(idx, tl);
  };

  const handleOpenSubmit = () => {
    if (introActive || hasAnswered || isTimedOut || !openText.trim()) return;
    const tl = Math.max(0, timeLeft ?? 0);
    onAnswer(openText.trim(), tl);
  };

  // ── Timer calculations ───────────────────────────────────
  const timerPct = timeLeft !== null && questionData.timeLimit > 0
    ? Math.max(0, Math.min(100, (timeLeft / questionData.timeLimit) * 100))
    : 100;
  const timerColor = timerPct > 50 ? 'var(--opt-green)' : timerPct > 25 ? 'var(--opt-yellow)' : 'var(--opt-red)';

  return (
    <div
      className="layout-navy"
      style={{
        height: '100dvh',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#070D1E',
      }}
    >
      {/* ── Measuring progress bar at very top ─────────────── */}
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div
          style={{
            height: '100%',
            width: introActive
              ? `${(introRemaining / INTRO_SECONDS) * 100}%`
              : hasAnswered
              ? '100%'
              : `${timerPct}%`,
            background: introActive ? '#60a5fa' : hasAnswered ? 'var(--opt-green)' : timerColor,
            boxShadow: `0 0 10px ${introActive ? '#60a5fa' : hasAnswered ? 'var(--opt-green)' : timerColor}`,
            transition: 'width 0.1s linear, background 0.4s ease',
          }}
        />
      </div>

      {/* ── Top Header Bar ─────────────────────────────────── */}
      <div
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          background: 'rgba(10, 17, 40, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          gap: '8px',
        }}
      >
        {/* Left: Question pill & Special Kind badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.04em',
            }}
          >
            Q{questionData.index + 1}{totalQuestions ? ` / ${totalQuestions}` : ''}
          </div>

          {/* Double Points / Special Pill */}
          {isDoublePoints && (
            <span
              className="animate-pulse-glow"
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(245, 158, 11, 0.3))',
                color: '#fde047',
                border: '1px solid rgba(245, 158, 11, 0.5)',
              }}
            >
              🔥 2X Points
            </span>
          )}

          {type === 'true-false' && !isDoublePoints && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(6, 182, 212, 0.18)',
                color: '#67e8f9',
                border: '1px solid rgba(6, 182, 212, 0.35)',
              }}
            >
              ⚖️ True / False
            </span>
          )}

          {type === 'open-ended' && !isDoublePoints && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.4)',
              }}
            >
              ✍️ Open Ended
            </span>
          )}
        </div>

        {/* Right: Potential points & Timer capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              padding: '4px 10px',
              borderRadius: '999px',
              color: '#fbbf24',
              fontSize: '0.8rem',
              fontWeight: 800,
            }}
          >
            <Zap size={13} fill="#fbbf24" color="#fbbf24" />
            <span>{potentialPoints} pts</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${introActive ? '#60a5fa' : hasAnswered ? 'var(--opt-green)' : timerColor}66`,
              padding: '4px 10px',
              borderRadius: '999px',
              minWidth: '54px',
              justifyContent: 'center',
            }}
          >
            <Clock size={12} style={{ color: introActive ? '#60a5fa' : hasAnswered ? 'var(--opt-green)' : timerColor }} />
            <span
              style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                color: introActive ? '#60a5fa' : hasAnswered ? 'var(--opt-green)' : timerColor,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {introActive
                ? `${Math.ceil(introRemaining)}s`
                : hasAnswered
                ? 'LOCKED'
                : timeLeft !== null
                ? `${Math.ceil(timeLeft)}s`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Intro Question Preview Banner (Kahoot Style) ──── */}
      {introActive && (
        <div
          className="animate-slide-up"
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(180deg, rgba(16, 27, 59, 0.9) 0%, rgba(10, 17, 40, 0.95) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Sparkles size={14} style={{ color: '#60a5fa' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Options unlocking in {Math.ceil(introRemaining)}s
            </span>
          </div>

          {qText ? (
            <p
              className="font-display"
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {qText}
            </p>
          ) : (
            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
              Look at the big screen · Options reveal in {Math.ceil(introRemaining)}s!
            </p>
          )}
        </div>
      )}

      {/* ── Multiple Choice: 2×2 Solid Color Pad Grid ────────── */}
      {type === 'multiple-choice' && (
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '12px',
            padding: '12px',
          }}
        >
          {MC_OPTIONS.slice(0, optionCount || 4).map((opt, idx) => {
            const isSelected = hasAnswered && selectedAnswer === idx;
            const isDimmed   = hasAnswered && selectedAnswer !== idx;
            const isLocked   = introActive;

            return (
              <button
                key={idx}
                id={`answer-${idx}`}
                className="tactile-pad"
                onClick={() => handleMCAnswer(idx)}
                disabled={isLocked || hasAnswered || isTimedOut}
                style={{
                  background: opt.bg,
                  color: '#ffffff',
                  opacity: isLocked ? 0.45 : isDimmed ? 0.22 : 1,
                  transform: isSelected ? 'scale(1.02)' : isDimmed ? 'scale(0.96)' : 'scale(1)',
                  boxShadow: isSelected
                    ? '0 0 0 4px #ffffff, 0 12px 32px rgba(0,0,0,0.5)'
                    : '0 8px 24px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.35)',
                  filter: isDimmed ? 'grayscale(45%)' : 'none',
                  transition: 'transform 0.15s ease, opacity 0.3s ease, filter 0.3s ease, box-shadow 0.25s ease',
                  padding: '16px',
                  position: 'relative',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                }}
              >
                {/* Shape Icon */}
                <div
                  style={{
                    color: '#ffffff',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
                  }}
                >
                  {opt.shape}
                </div>

                {/* Bold Letter Pill */}
                <span
                  className="font-display"
                  style={{
                    fontWeight: 900,
                    fontSize: '1.6rem',
                    color: '#ffffff',
                    lineHeight: 1,
                    letterSpacing: '0.04em',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {isLocked ? '…' : opt.label}
                </span>

                {/* Locked In Pill Badge */}
                {isSelected && (
                  <div
                    className="animate-scale-in"
                    style={{
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
                    }}
                  >
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
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateRows: '1fr 1fr',
            gap: '14px',
            padding: '14px',
          }}
        >
          {TF_OPTIONS.map((opt) => {
            const isSelected = hasAnswered && selectedAnswer === opt.value;
            const isDimmed   = hasAnswered && selectedAnswer !== opt.value;
            const isLocked   = introActive;

            return (
              <button
                key={opt.value}
                id={`tf-answer-${opt.value}`}
                className="tactile-pad"
                onClick={() => handleMCAnswer(opt.value)}
                disabled={isLocked || hasAnswered || isTimedOut}
                style={{
                  background: opt.bg,
                  color: '#ffffff',
                  opacity: isLocked ? 0.45 : isDimmed ? 0.22 : 1,
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
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                }}
              >
                <div style={{ color: '#ffffff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}>
                  {opt.symbol}
                </div>
                <span
                  className="font-display"
                  style={{
                    fontSize: '2.4rem',
                    fontWeight: 900,
                    letterSpacing: '0.06em',
                    textShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  {isLocked ? '…' : opt.label}
                </span>

                {/* Selected Pill Badge */}
                {isSelected && (
                  <div
                    className="animate-scale-in"
                    style={{
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
                    }}
                  >
                    <CheckCircle2 size={13} style={{ color: 'var(--opt-green)' }} />
                    <span>LOCKED</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Open-Ended: Dark Card Input ──────────────────────── */}
      {type === 'open-ended' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '20px',
          }}
        >
          <div
            className="sqi-card-dark"
            style={{
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem', fontWeight: 500 }}>
              <Tv size={18} style={{ color: 'var(--sqi-accent)' }} />
              <span>Read the question on the projector screen</span>
            </div>

            <textarea
              className="input-dark"
              rows={3}
              placeholder={introActive ? `Unlocking in ${Math.ceil(introRemaining)}s…` : 'Type your answer here…'}
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              disabled={introActive || hasAnswered || isTimedOut}
              style={{
                resize: 'none',
                fontSize: '1.1rem',
                textAlign: 'center',
                fontWeight: 600,
                opacity: introActive ? 0.5 : 1,
              }}
            />

            <button
              id="oe-submit"
              className="btn-primary"
              onClick={handleOpenSubmit}
              disabled={introActive || hasAnswered || isTimedOut || !openText.trim()}
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
              <span>Submit Answer</span>
            </button>
          </div>

          {isTimedOut && !hasAnswered && (
            <p style={{ color: 'var(--opt-red)', fontWeight: 700, fontSize: '0.95rem' }}>
              ⏰ Time's up!
            </p>
          )}
        </div>
      )}

      {/* ── Floating Answer Locked In Status Banner ───────────── */}
      {hasAnswered && (
        <div
          className="animate-slide-up"
          style={{
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--opt-green)' }} />
            <span className="font-display" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Answer Locked In!
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
            Waiting for other players & host…
          </p>
          <div style={{ marginTop: '2px' }}>
            <ReactionToolbar onReact={onReact} />
          </div>
        </div>
      )}
    </div>
  );
}
