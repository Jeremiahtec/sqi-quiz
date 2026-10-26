/**
 * Standings.jsx — Intermediate Leaderboard View (Kahoot-Style)
 * Displays dynamic ranked player cards with:
 * - Physical rolling count-up from previous score to current score
 * - Live position swapping when players overtake each other
 * - Gain badges (+850 pts) and flame streak badges
 * - Fullscreen toggle, Sound toggle, and live floating reactions
 */
import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowUp, ArrowDown, Flame, Crown, Trophy, Sparkles } from 'lucide-react';
import FullscreenToggle from '../../components/FullscreenToggle';
import SoundToggle from '../../components/SoundToggle';
import FloatingReactions from '../../components/FloatingReactions';
import { playScoreTick } from '../../utils/soundEffects';

export default function Standings({ leaderboard = [], questionIndex = 0, totalQuestions = 1, onNext, socket }) {
  // Precompute previous scores and previous ranks
  const computedData = useRef(null);

  if (!computedData.current) {
    const playersWithPrev = leaderboard.map((p) => {
      const lastAnswer = p.answers?.[questionIndex];
      const gain = lastAnswer?.scoreGain || 0;
      const prev = Math.max(0, (p.score || 0) - gain);
      return {
        ...p,
        scoreGain: gain,
        prevScore: prev,
        finalScore: p.score || 0,
      };
    });

    // Previous rank sorted by prevScore
    const prevSorted = [...playersWithPrev].sort((a, b) => b.prevScore - a.prevScore);
    const prevRanks = new Map();
    prevSorted.forEach((p, idx) => prevRanks.set(p.nickname, idx + 1));

    // Final rank sorted by finalScore
    const finalSorted = [...playersWithPrev].sort((a, b) => b.finalScore - a.finalScore);

    computedData.current = {
      playersWithPrev,
      prevSorted,
      finalSorted,
      prevRanks,
    };
  }

  const { prevSorted, finalSorted, prevRanks } = computedData.current;

  // Animation state
  // Phase 1: show initial order (prevSorted) with prevScores (0 to 600ms)
  // Phase 2: numbers roll up and cards re-order (600ms to 2000ms)
  const [displayPlayers, setDisplayPlayers] = useState(() =>
    prevSorted.map((p) => ({ ...p, currentDisplayScore: p.prevScore, rank: prevRanks.get(p.nickname) }))
  );
  const [isSwapped, setIsSwapped] = useState(false);
  const [hasFinishedCounting, setHasFinishedCounting] = useState(false);

  useEffect(() => {
    let animId;
    const startTime = Date.now();
    const delayMs = 600;      // Pause before counting
    const durationMs = 1500;  // Count-up duration
    let tickThrottle = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < delayMs) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(1, (elapsed - delayMs) / durationMs);
      // Ease out quad
      const eased = 1 - Math.pow(1 - progress, 3);

      // Trigger position swap halfway through counting
      if (progress >= 0.45 && !isSwapped) {
        setIsSwapped(true);
      }

      // Update scores
      tickThrottle++;
      if (tickThrottle % 4 === 0 && progress < 0.95) {
        playScoreTick();
      }

      setDisplayPlayers((prev) => {
        // Source depends on whether swap has triggered
        const sourceList = progress >= 0.45 ? finalSorted : prevSorted;
        return sourceList.map((p, idx) => {
          const scoreDelta = p.finalScore - p.prevScore;
          const currentDisplay = Math.round(p.prevScore + scoreDelta * eased);
          const currentRank = idx + 1;
          const oldRank = prevRanks.get(p.nickname) || currentRank;
          return {
            ...p,
            currentDisplayScore: currentDisplay,
            rank: currentRank,
            rankDiff: oldRank - currentRank, // positive = climbed, negative = dropped
          };
        });
      });

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setHasFinishedCounting(true);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const maxScore = Math.max(...leaderboard.map((p) => p.score || 0), 100);
  const isFinalQuestion = questionIndex + 1 >= totalQuestions;

  return (
    <div className="layout-navy" style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Floating reactions overlay */}
      <FloatingReactions socket={socket} />

      {/* ── Top Bar ──────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        <span style={{
          fontSize: '0.8rem', fontWeight: 800,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          Scoreboard · Question {questionIndex + 1} of {totalQuestions}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FullscreenToggle />
          <SoundToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
            <span className="font-display" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
              SQI Quiz
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '36px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 10,
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }} className="animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
            <Trophy size={28} style={{ color: '#f59e0b' }} />
            <h2 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              Current Standings
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            {isSwapped ? 'Scores updated!' : 'Calculating scores…'}
          </p>
        </div>

        {/* ── Leaderboard Cards List ──────────────────────── */}
        {displayPlayers.length > 0 ? (
          <div style={{
            width: '100%', maxWidth: '780px',
            display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            {displayPlayers.map((player) => {
              const isFirst = player.rank === 1;
              const isSecond = player.rank === 2;
              const isThird = player.rank === 3;

              const rankColor = isFirst ? '#f59e0b' : isSecond ? '#94a3b8' : isThird ? '#cd7f32' : 'rgba(255,255,255,0.4)';
              const scorePct = Math.max(5, Math.min(100, (player.currentDisplayScore / maxScore) * 100));

              return (
                <div
                  key={player.nickname}
                  className="animate-slide-up"
                  style={{
                    position: 'relative',
                    background: isFirst
                      ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isFirst ? '2px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '18px',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: isFirst ? '0 8px 28px rgba(245, 158, 11, 0.15)' : '0 4px 16px rgba(0,0,0,0.2)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Subtle background score progress bar */}
                  <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0,
                    width: `${scorePct}%`,
                    background: isFirst ? 'rgba(245, 158, 11, 0.07)' : 'rgba(37, 99, 235, 0.06)',
                    transition: 'width 0.2s linear',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }} />

                  {/* Left: Rank & Avatar & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                    {/* Rank pill */}
                    <div style={{
                      width: '38px', height: '38px',
                      borderRadius: '50%',
                      background: `${rankColor}22`,
                      border: `2px solid ${rankColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 900, fontSize: '1.1rem',
                      color: rankColor,
                      flexShrink: 0,
                    }}>
                      {isFirst ? <Crown size={18} fill="#f59e0b" color="#f59e0b" /> : player.rank}
                    </div>

                    {/* Avatar circle */}
                    <div style={{
                      width: '48px', height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.7rem',
                      flexShrink: 0,
                    }}>
                      {player.avatar || '🎓'}
                    </div>

                    {/* Nickname & Streak */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                          {player.nickname}
                        </span>
                        {isFirst && (
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                          }}>
                            LEADER
                          </span>
                        )}
                      </div>

                      {/* Rank diff or streak */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                        {player.streak >= 2 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Flame size={13} fill="#f59e0b" color="#f59e0b" />
                            <span>{player.streak} streak</span>
                          </div>
                        )}
                        {player.rankDiff > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--opt-green)', fontSize: '0.8rem', fontWeight: 800 }}>
                            <ArrowUp size={13} />
                            <span>+{player.rankDiff} climbed</span>
                          </div>
                        )}
                        {player.rankDiff < 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--opt-red)', fontSize: '0.8rem', fontWeight: 800 }}>
                            <ArrowDown size={13} />
                            <span>{player.rankDiff}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Score points gained & Physical Rolling Total Score */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
                    {/* Points Gain Pill */}
                    {player.scoreGain > 0 && (
                      <div
                        className="animate-scale-in"
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          color: '#34d399',
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        +{player.scoreGain}
                      </div>
                    )}

                    {/* Physical rolling score number */}
                    <div style={{ textAlign: 'right', minWidth: '90px' }}>
                      <span
                        className="font-display"
                        style={{
                          fontSize: '1.8rem',
                          fontWeight: 900,
                          color: isFirst ? '#fbbf24' : '#ffffff',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {player.currentDisplayScore.toLocaleString()}
                      </span>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                        pts
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', marginTop: '40px' }}>
            No player scores available yet.
          </p>
        )}
      </div>

      {/* ── Control Bar ──────────────────────────────────── */}
      <div style={{
        padding: '16px 32px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        <button
          onClick={onNext}
          className="btn-primary"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 28px', fontSize: '1.05rem', fontWeight: 800,
            borderRadius: '12px',
            background: 'var(--sqi-accent)',
            boxShadow: '0 4px 18px rgba(37, 99, 235, 0.35)',
          }}
        >
          <span>{isFinalQuestion ? 'Final Results' : 'Next Question'}</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
