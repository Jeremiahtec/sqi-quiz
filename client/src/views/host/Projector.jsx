/**
 * Projector.jsx — Live Game Projector View
 * High-production classroom TV/projector display with Kahoot-style question preview.
 *
 * Flow:
 * 1. Question Intro Phase (3.5s):
 *    - Highlights Question Text prominently with Special Kind badge:
 *      (✨ Multiple Choice, ⚖️ True / False, ✍️ Open-Ended, 🔥 2X Double Points, 🏁 Final Question)
 *    - Options stay hidden with mystery frosted preview cards while players read.
 * 2. Active Question Phase:
 *    - Options pop in with audio chime!
 *    - Main countdown timer ticks down with synchronized measuring meter.
 *    - Real-time live answer counter.
 * 3. Reveal Phase:
 *    - Highlights correct answer and per-option answer distribution.
 *    - For the FINAL QUESTION: The next button is "🏆 View Final Podium",
 *      bypassing intermediate standings and jumping straight to the suspenseful podium!
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import SoundToggle from '../../components/SoundToggle';
import FullscreenToggle from '../../components/FullscreenToggle';
import FloatingReactions from '../../components/FloatingReactions';
import { playTick, playReveal, playQuestionIntro, playOptionsPop } from '../../utils/soundEffects';
import { Users, ChevronRight, Flag, CheckCircle, Code, Clock, Sparkles, Flame, HelpCircle, Layers } from 'lucide-react';

const INTRO_SECONDS = 3.5;

// ── Answer option visual config ───────────────────────────────
const MC_OPTIONS = [
  {
    bg: 'var(--opt-red)',
    shape: (
      <svg viewBox="0 0 40 36" width="48" height="44" fill="currentColor" aria-hidden="true">
        <polygon points="20,2 38,34 2,34" />
      </svg>
    ),
    label: 'A',
  },
  {
    bg: 'var(--opt-blue)',
    shape: (
      <svg viewBox="0 0 36 36" width="44" height="44" fill="currentColor" aria-hidden="true">
        <rect x="2" y="2" width="32" height="32" rx="4" />
      </svg>
    ),
    label: 'B',
  },
  {
    bg: 'var(--opt-yellow)',
    shape: (
      <svg viewBox="0 0 36 36" width="44" height="44" fill="currentColor" aria-hidden="true">
        <circle cx="18" cy="18" r="16" />
      </svg>
    ),
    label: 'C',
  },
  {
    bg: 'var(--opt-green)',
    shape: (
      <svg viewBox="0 0 40 46" width="44" height="50" fill="currentColor" aria-hidden="true">
        <polygon points="20,1 39,11.5 39,34.5 20,45 1,34.5 1,11.5" />
      </svg>
    ),
    label: 'D',
  },
];

const TF_OPTIONS = [
  { bg: 'var(--opt-green)', label: '✓ True' },
  { bg: 'var(--opt-red)', label: '✗ False' },
];

export default function Projector({
  question, questionIndex, totalQuestions,
  phase, answerCount, totalPlayers,
  revealData, leaderboard,
  onReveal, onShowStandings,
  socket,
}) {
  const [introActive, setIntroActive]       = useState(true);
  const [introRemaining, setIntroRemaining] = useState(INTRO_SECONDS);
  const [timeExpired, setTimeExpired]       = useState(false);
  const [remaining, setRemaining]           = useState(question?.timeLimit || 20);
  const [timerPct, setTimerPct]             = useState(100);
  const [countKey, setCountKey]             = useState(0);

  const prevCount         = useRef(0);
  const startTimeRef      = useRef(null);
  const lastTickSecRef    = useRef(null);
  const introTimerRef     = useRef(null);
  const mainTimerRef      = useRef(null);

  const {
    type, options = [], correctAnswer, timeLimit = 20,
    code, imageUrl, doublePoints, isLastQuestion: qIsLast
  } = question || {};

  const isReveal = phase === 'reveal';
  const isLastQuestion = Boolean(qIsLast || (questionIndex + 1 >= totalQuestions));
  const isDoublePoints = Boolean(doublePoints);

  const handleTimerExpire = useCallback(() => {
    setTimeExpired(true);
    if (!isReveal) onReveal();
  }, [isReveal, onReveal]);

  // Skip intro immediately to options
  const skipIntro = useCallback(() => {
    if (introTimerRef.current) clearInterval(introTimerRef.current);
    setIntroActive(false);
    playOptionsPop();
  }, []);

  // ── 1. Question Intro Timer (Kahoot-style read phase) ──────
  useEffect(() => {
    if (isReveal) {
      setIntroActive(false);
      return;
    }

    setIntroActive(true);
    setIntroRemaining(INTRO_SECONDS);
    playQuestionIntro();

    const introStart = Date.now();
    introTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - introStart) / 1000;
      const left = Math.max(0, INTRO_SECONDS - elapsed);
      setIntroRemaining(left);

      if (left <= 0) {
        clearInterval(introTimerRef.current);
        setIntroActive(false);
        playOptionsPop();
      }
    }, 50);

    return () => {
      if (introTimerRef.current) clearInterval(introTimerRef.current);
    };
  }, [questionIndex, isReveal]);

  // ── 2. Main Question Countdown (starts after intro) ────────
  useEffect(() => {
    if (isReveal) {
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
      setRemaining(0);
      setTimerPct(0);
      return;
    }

    if (introActive) {
      // Don't run main timer yet while reading intro
      setRemaining(timeLimit);
      setTimerPct(100);
      return;
    }

    setTimeExpired(false);
    setRemaining(timeLimit);
    setTimerPct(100);
    startTimeRef.current = Date.now();
    lastTickSecRef.current = null;

    mainTimerRef.current = setInterval(() => {
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
        clearInterval(mainTimerRef.current);
        handleTimerExpire();
      }
    }, 100);

    return () => {
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
    };
  }, [introActive, isReveal, timeLimit, handleTimerExpire]);

  // Play reveal chime when answers are revealed
  useEffect(() => {
    if (isReveal) {
      playReveal();
    }
  }, [isReveal]);

  // Keyboard shortcut listener: Space or Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (introActive) {
          skipIntro();
        } else if (!isReveal) {
          onReveal();
        } else {
          onShowStandings();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [introActive, isReveal, skipIntro, onReveal, onShowStandings]);

  // Animate count badge when answerCount increments
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

  const displayOptions = type === 'true-false'
    ? TF_OPTIONS
    : type === 'open-ended'
    ? []
    : MC_OPTIONS.slice(0, options.length || 4);

  return (
    <div
      className="layout-navy"
      style={{
        height: '100vh',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#070D1E',
      }}
    >
      {/* Floating reactions overlay */}
      <FloatingReactions socket={socket} />

      {/* ── Top Bar ───────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 28px',
          background: 'rgba(10, 17, 40, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Left: Question counter & subtle special kind badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Question
            </span>
            <span className="font-display" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff' }}>
              {questionIndex + 1}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.95rem' }}>/ {totalQuestions}</span>
          </div>

          {/* Special Kind Badge (Kahoot style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {type === 'multiple-choice' && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(99, 102, 241, 0.18)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                }}
              >
                ✨ Multiple Choice
              </span>
            )}

            {type === 'true-false' && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
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

            {type === 'open-ended' && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
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

            {/* Double points indicator */}
            {isDoublePoints && (
              <span
                className="animate-pulse-glow"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
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

            {/* Final question indicator */}
            {isLastQuestion && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(251, 191, 36, 0.15)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                }}
              >
                🏁 Final Question
              </span>
            )}
          </div>
        </div>

        {/* Center: Live countdown and answer counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Answer counter capsule */}
          <div
            key={countKey}
            className="animate-scale-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <Users size={14} style={{ color: 'var(--sqi-accent)' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
              {answerCount}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)' }}>/ {totalPlayers}</span>
          </div>

          {/* Timer capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${timerColor}66`,
            }}
          >
            <Clock size={14} style={{ color: timerColor }} />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.2rem',
                fontWeight: 800,
                color: timerColor,
                minWidth: '36px',
                textAlign: 'right',
              }}
            >
              {introActive
                ? `${Math.ceil(introRemaining)}s`
                : !isReveal
                ? `${Math.ceil(remaining)}s`
                : '—'}
            </span>
          </div>
        </div>

        {/* Right: Controls & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FullscreenToggle />
          <SoundToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
            <span className="font-display" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)' }}>
              SQI Quiz
            </span>
          </div>
        </div>
      </div>

      {/* ── Measuring Countdown Bar across Projector ──────── */}
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: introActive
              ? `${(introRemaining / INTRO_SECONDS) * 100}%`
              : isReveal
              ? '0%'
              : `${timerPct}%`,
            background: introActive ? '#60a5fa' : timerColor,
            boxShadow: !isReveal ? `0 0 12px ${timerColor}99` : 'none',
            transition: 'width 0.1s linear, background 0.3s ease',
          }}
        />
      </div>

      {/* ── Question Text & Media Showcase ────────────────── */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 36px 12px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div
          className="sqi-card-dark animate-slide-up"
          style={{
            borderRadius: '20px',
            padding: '22px 32px',
            maxWidth: '960px',
            width: '100%',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(16, 27, 59, 0.8) 0%, rgba(10, 17, 40, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Optional Image */}
          {imageUrl && (
            <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={imageUrl}
                alt="Question Diagram"
                style={{
                  maxHeight: '150px',
                  maxWidth: '100%',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          {/* Question Text */}
          <p
            className="font-display"
            style={{
              fontSize: 'clamp(1.3rem, 2.6vw, 1.95rem)',
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.35,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            {question.question}
          </p>

          {/* Optional Code Snippet */}
          {code && (
            <div
              style={{
                marginTop: '14px',
                textAlign: 'left',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                padding: '12px 18px',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.88rem',
                color: '#7dd3fc',
                overflowX: 'auto',
                maxHeight: '140px',
                whiteSpace: 'pre',
              }}
            >
              <code>{code}</code>
            </div>
          )}

          {/* Educational Takeaway on Reveal */}
          {question.explanation && isReveal && (
            <div
              className="animate-slide-up"
              style={{
                marginTop: '14px',
                padding: '10px 18px',
                background: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(37, 99, 235, 0.4)',
                borderRadius: '10px',
                color: '#93c5fd',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '1.15rem' }}>💡</span>
              <span><strong>Key Takeaway:</strong> {question.explanation}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Area: Kahoot Intro Mode vs Options Grid ────── */}
      {introActive && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 32px 16px',
            position: 'relative',
            zIndex: 5,
            textAlign: 'center',
          }}
        >
          {/* Anticipation Banner */}
          <div
            className="sqi-card-dark animate-scale-in"
            style={{
              padding: '24px 36px',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(16, 27, 59, 0.75)',
              border: '1.5px solid rgba(96, 165, 250, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(37, 99, 235, 0.25)',
                  color: '#60a5fa',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  fontSize: '1.4rem',
                  border: '1px solid rgba(96, 165, 250, 0.4)',
                }}
              >
                {Math.ceil(introRemaining)}
              </span>
              <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Options revealing soon…
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              Read the question above carefully. Prepare to lock in your answer on mobile!
            </p>

            <button
              onClick={skipIntro}
              type="button"
              className="btn-ghost"
              style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '999px', marginTop: '4px' }}
            >
              Skip Intro ➜
            </button>
          </div>
        </div>
      )}

      {/* ── Active Options Grid (Revealed after intro) ─────── */}
      {!introActive && type !== 'open-ended' && (
        <div
          className="animate-slide-up"
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: type === 'true-false' ? '1fr 1fr' : '1fr 1fr',
            gridTemplateRows: type === 'true-false' ? '1fr' : '1fr 1fr',
            gap: '12px',
            padding: '8px 32px 16px',
            position: 'relative',
            zIndex: 5,
          }}
        >
          {displayOptions.map((opt, idx) => {
            const actualText = type === 'true-false' ? opt.label : (options[idx] || `Option ${idx + 1}`);
            const isCorrect = isReveal && (idx === correctAnswer);
            const isDimmed = isReveal && (idx !== correctAnswer);
            const answerCnt = revealData?.optionCounts?.[idx] || 0;

            return (
              <div
                key={idx}
                id={`option-${idx}`}
                style={{
                  background: isDimmed ? 'rgba(255,255,255,0.05)' : opt.bg,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  padding: '16px 24px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background 0.4s, opacity 0.4s, transform 0.4s',
                  opacity: isDimmed ? 0.35 : 1,
                  transform: isCorrect ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isCorrect ? '0 0 24px rgba(16,185,129,0.35)' : 'none',
                  border: isCorrect
                    ? '2px solid rgba(255,255,255,0.85)'
                    : isDimmed
                    ? '1px solid rgba(255,255,255,0.08)'
                    : 'none',
                }}
              >
                {/* Shape / icon */}
                <div
                  style={{
                    color: isDimmed ? 'rgba(255,255,255,0.4)' : '#fff',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {opt.shape}
                </div>

                {/* Answer text */}
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                    color: isDimmed ? 'rgba(255,255,255,0.4)' : '#fff',
                    flex: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {actualText}
                </span>

                {/* Reveal: answer count + checkmark */}
                {isReveal && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexShrink: 0 }}>
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        color: isDimmed ? 'rgba(255,255,255,0.3)' : '#fff',
                        background: 'rgba(0,0,0,0.25)',
                        padding: '4px 12px',
                        borderRadius: '8px',
                      }}
                    >
                      {answerCnt}
                    </span>

                    {isCorrect && (
                      <div
                        className="animate-scale-in"
                        style={{
                          background: '#fff',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--opt-green)',
                        }}
                      >
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

      {/* ── Open-Ended Typing Instructions Notice ─────────── */}
      {!introActive && type === 'open-ended' && !isReveal && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div
            className="sqi-card-dark animate-scale-in"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '32px 40px',
              textAlign: 'center',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.08)',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '2px solid rgba(245, 158, 11, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
              }}
            >
              ⌨️
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
                Type Your Answer on Your Phone
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.75)', margin: 0, lineHeight: 1.5 }}>
                Players: open your mobile controller, type the exact answer, and tap <strong>Submit</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Open-Ended Reveal Breakdown ───────────────────── */}
      {type === 'open-ended' && isReveal && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div
            className="sqi-card-dark animate-scale-in"
            style={{
              maxWidth: '640px',
              width: '100%',
              padding: '32px',
              textAlign: 'center',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                padding: '12px 24px',
                borderRadius: '16px',
              }}
            >
              <CheckCircle size={24} style={{ color: 'var(--opt-green)' }} />
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', fontFamily: "'Outfit', sans-serif" }}>
                Accepted Answer: "{question.correctAnswer}"
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '380px', justifyContent: 'center' }}>
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '0.74rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
                  Correct
                </p>
                <span className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399' }}>
                  {revealData?.optionCounts?.correct || 0}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
                  Incorrect
                </p>
                <span className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f43f5e' }}>
                  {revealData?.optionCounts?.wrong || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Control Bar ───────────────────────────────────── */}
      <div
        style={{
          padding: '14px 28px',
          background: 'rgba(10, 17, 40, 0.85)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {!isReveal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span>
              {introActive
                ? 'Intro mode · Players reading question'
                : `Live Competition · ${answerCount} of ${totalPlayers} answered`}
            </span>
          </div>
        )}
        {isReveal && <div />} {/* Spacer */}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          {!isReveal && (
            <button
              id="reveal-btn"
              className="btn-ghost"
              onClick={onReveal}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.9rem' }}
            >
              <Flag size={15} />
              <span>Reveal Answers</span>
            </button>
          )}

          {isReveal && (
            <button
              id="next-question-btn"
              className="btn-primary"
              onClick={onShowStandings}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                padding: '12px 30px',
                borderRadius: '12px',
                fontWeight: 800,
                background: isLastQuestion
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: isLastQuestion
                  ? '0 0 28px rgba(245, 158, 11, 0.5)'
                  : '0 4px 16px rgba(37, 99, 235, 0.4)',
              }}
            >
              <span>{isLastQuestion ? '🏆 View Final Podium' : 'Show Standings'}</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
