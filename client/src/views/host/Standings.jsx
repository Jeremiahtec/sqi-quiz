/**
 * Standings.jsx — Dynamic Intermediate Leaderboard (Kahoot-Style)
 * Displays physical vertical card sliding where overtaking players
 * physically glide UP and overtaken players physically glide DOWN
 * right in the players' faces, with live rolling count-up scores!
 */
import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowUp, ArrowDown, Flame, Crown, Trophy, Sparkles } from 'lucide-react';
import FullscreenToggle from '../../components/FullscreenToggle';
import SoundToggle from '../../components/SoundToggle';
import FloatingReactions from '../../components/FloatingReactions';
import { playScoreTick, playOvertake } from '../../utils/soundEffects';

const CARD_HEIGHT = 84;
const CARD_GAP = 14;
const SLOT_SIZE = CARD_HEIGHT + CARD_GAP; // 98px per card slot

export default function Standings({ leaderboard = [], questionIndex = 0, totalQuestions = 1, onNext, socket }) {
  // Precompute initial and final slots + scores once
  const computedData = useRef(null);

  if (!computedData.current) {
    const players = leaderboard.map((p) => {
      const lastAnswer = p.answers?.[questionIndex];
      const gain = lastAnswer?.scoreGain || 0;
      const prev = Math.max(0, (p.score || 0) - gain);
      return {
        nickname: p.nickname,
        avatar: p.avatar || '🎓',
        streak: p.streak || 0,
        scoreGain: gain,
        prevScore: prev,
        finalScore: p.score || 0,
      };
    });

    // 1. Initial sorting by previous score
    const prevSorted = [...players].sort((a, b) => b.prevScore - a.prevScore);
    const prevSlots = new Map();
    prevSorted.forEach((p, idx) => prevSlots.set(p.nickname, idx));

    // 2. Final sorting by final score
    const finalSorted = [...players].sort((a, b) => b.finalScore - a.finalScore);
    const finalSlots = new Map();
    finalSorted.forEach((p, idx) => finalSlots.set(p.nickname, idx));

    // Check if any rank changed
    let hasRankChange = false;
    let topClimber = null;
    let maxClimb = 0;

    players.forEach((p) => {
      const prevSlot = prevSlots.get(p.nickname) ?? 0;
      const finalSlot = finalSlots.get(p.nickname) ?? 0;
      const climb = prevSlot - finalSlot;
      if (climb > 0) {
        hasRankChange = true;
        if (climb > maxClimb) {
          maxClimb = climb;
          topClimber = p.nickname;
        }
      }
    });

    const enrichedPlayers = players.map((p) => ({
      ...p,
      prevSlot: prevSlots.get(p.nickname) ?? 0,
      finalSlot: finalSlots.get(p.nickname) ?? 0,
      rankDiff: (prevSlots.get(p.nickname) ?? 0) - (finalSlots.get(p.nickname) ?? 0),
    }));

    computedData.current = {
      enrichedPlayers,
      hasRankChange,
      topClimber,
      prevSorted,
      finalSorted,
    };
  }

  const { enrichedPlayers, hasRankChange, topClimber, finalSorted } = computedData.current;

  // Animation states
  const [isSwapped, setIsSwapped] = useState(false);
  const [displayScores, setDisplayScores] = useState(() => {
    const scores = {};
    enrichedPlayers.forEach((p) => {
      scores[p.nickname] = p.prevScore;
    });
    return scores;
  });
  const [showRanksAfterSwap, setShowRanksAfterSwap] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Calculating scores…');

  const maxScore = Math.max(...leaderboard.map((p) => p.score || 0), 100);
  const isFinalQuestion = questionIndex + 1 >= totalQuestions;

  useEffect(() => {
    let animId;
    const startTime = Date.now();
    const countStartMs = 700;   // Start count-up after 700ms
    const countDurationMs = 1400; // Count-up takes 1.4s
    const swapTimeMs = countStartMs + countDurationMs + 200; // Trigger physical swap right as scores finish
    let tickThrottle = 0;
    let swapTriggered = false;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      // ── Phase 1: Rolling score numbers ───────────────────
      if (elapsed >= countStartMs) {
        const countProgress = Math.min(1, (elapsed - countStartMs) / countDurationMs);
        const eased = 1 - Math.pow(1 - countProgress, 3); // ease-out cubic

        tickThrottle++;
        if (tickThrottle % 4 === 0 && countProgress < 0.98) {
          playScoreTick();
        }

        const currentScores = {};
        enrichedPlayers.forEach((p) => {
          const delta = p.finalScore - p.prevScore;
          currentScores[p.nickname] = Math.round(p.prevScore + delta * eased);
        });
        setDisplayScores(currentScores);

        if (countProgress < 1) {
          setStatusMessage('Scores rolling up…');
        }
      }

      // ── Phase 2: The Physical Overtake Slide ──────────────
      if (elapsed >= swapTimeMs && !swapTriggered) {
        swapTriggered = true;
        if (hasRankChange) {
          playOvertake();
          setIsSwapped(true);
          setStatusMessage(
            topClimber
              ? `🔥 ${topClimber} surged up the leaderboard!`
              : 'Positions updated!'
          );

          // Update rank numbers halfway through the slide
          setTimeout(() => {
            setShowRanksAfterSwap(true);
          }, 400);
        } else {
          setShowRanksAfterSwap(true);
          setStatusMessage('Standings confirmed!');
        }
      }

      if (elapsed < swapTimeMs + 1000) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const totalHeight = Math.max(1, enrichedPlayers.length) * SLOT_SIZE;

  return (
    <div className="layout-navy" style={{
      minHeight: '100vh', width: '100%', maxWidth: '100%',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflowX: 'hidden',
    }}>
      {/* Floating reactions overlay */}
      <FloatingReactions socket={socket} />

      {/* ── Top Bar ──────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0, position: 'relative', zIndex: 20,
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

      {/* ── Main Content Area ────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '36px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 10,
      }}>
        {/* Title & Status Message */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }} className="animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '6px' }}>
            <Trophy size={28} style={{ color: '#f59e0b' }} />
            <h2 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              Current Standings
            </h2>
          </div>
          <p style={{
            margin: 0, fontSize: '0.95rem',
            color: hasRankChange && isSwapped ? '#fbbf24' : 'rgba(255,255,255,0.6)',
            fontWeight: 700,
            transition: 'color 0.4s ease',
          }}>
            {statusMessage}
          </p>
        </div>

        {/* ── Leaderboard with Physical Sliding Slots ──────── */}
        {enrichedPlayers.length > 0 ? (
          <div style={{
            width: '100%', maxWidth: '780px',
            position: 'relative',
            height: `${totalHeight}px`,
          }}>
            {enrichedPlayers.map((player) => {
              // Current active slot: shifts from prevSlot to finalSlot during swap
              const activeSlot = isSwapped ? player.finalSlot : player.prevSlot;
              const displayRank = (showRanksAfterSwap ? player.finalSlot : player.prevSlot) + 1;
              const isFirst = displayRank === 1;
              const isSecond = displayRank === 2;
              const isThird = displayRank === 3;

              const rankColor = isFirst ? '#f59e0b' : isSecond ? '#94a3b8' : isThird ? '#cd7f32' : 'rgba(255,255,255,0.4)';
              const currentScore = displayScores[player.nickname] ?? player.prevScore;
              const scorePct = Math.max(6, Math.min(100, (currentScore / maxScore) * 100));

              // When a player climbs, lift them with higher z-index so they visibly glide over
              const isClimbing = player.rankDiff > 0;
              const isDropping = player.rankDiff < 0;
              const zIndex = isClimbing ? (isSwapped ? 15 : 12) : isDropping ? 2 : 5;

              return (
                <div
                  key={player.nickname}
                  style={{
                    position: 'absolute',
                    left: 0, right: 0,
                    height: `${CARD_HEIGHT}px`,
                    top: `${activeSlot * SLOT_SIZE}px`,
                    zIndex,
                    background: isFirst
                      ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.05) 100%)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isFirst
                      ? '2px solid rgba(245, 158, 11, 0.55)'
                      : isClimbing && isSwapped
                      ? '1.5px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '18px',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: isFirst
                      ? '0 10px 32px rgba(245, 158, 11, 0.2)'
                      : isClimbing && isSwapped
                      ? '0 10px 30px rgba(16, 185, 129, 0.25)'
                      : '0 4px 16px rgba(0,0,0,0.2)',
                    /* ── THE PHYSICAL SLIDING TRANSITION ── */
                    transition: 'top 0.85s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, border-color 0.4s ease',
                    overflow: 'hidden',
                  }}
                >
                  {/* Background progress fill bar */}
                  <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: 0,
                    width: `${scorePct}%`,
                    background: isFirst ? 'rgba(245, 158, 11, 0.08)' : 'rgba(37, 99, 235, 0.07)',
                    transition: 'width 0.2s linear',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }} />

                  {/* Left: Rank, Avatar, Nickname & Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                    {/* Rank pill */}
                    <div style={{
                      width: '40px', height: '40px',
                      borderRadius: '50%',
                      background: `${rankColor}22`,
                      border: `2px solid ${rankColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 900, fontSize: '1.15rem',
                      color: rankColor,
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                      boxShadow: isFirst ? '0 0 14px rgba(245, 158, 11, 0.4)' : 'none',
                    }}>
                      {isFirst ? <Crown size={20} fill="#f59e0b" color="#f59e0b" /> : displayRank}
                    </div>

                    {/* Avatar circle */}
                    <div style={{
                      width: '50px', height: '50px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.8rem',
                      flexShrink: 0,
                    }}>
                      {player.avatar}
                    </div>

                    {/* Nickname & Climb/Drop Tags */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                          {player.nickname}
                        </span>
                        {isFirst && showRanksAfterSwap && (
                          <span className="animate-scale-in" style={{
                            background: 'rgba(245, 158, 11, 0.22)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.45)',
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

                      {/* Rank delta tag & streaks */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                        {player.streak >= 2 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Flame size={13} fill="#f59e0b" color="#f59e0b" />
                            <span>{player.streak} streak</span>
                          </div>
                        )}
                        {/* Climb Badge */}
                        {isClimbing && isSwapped && (
                          <div className="animate-scale-in" style={{
                            display: 'flex', alignItems: 'center', gap: '3px',
                            color: 'var(--opt-green)',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '1px 8px', borderRadius: '999px',
                            fontSize: '0.76rem', fontWeight: 800,
                          }}>
                            <ArrowUp size={13} />
                            <span>+{player.rankDiff} OVERTAKE!</span>
                          </div>
                        )}
                        {/* Drop Badge */}
                        {isDropping && isSwapped && (
                          <div className="animate-scale-in" style={{
                            display: 'flex', alignItems: 'center', gap: '3px',
                            color: 'rgba(244, 63, 94, 0.85)',
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            padding: '1px 8px', borderRadius: '999px',
                            fontSize: '0.76rem', fontWeight: 700,
                          }}>
                            <ArrowDown size={13} />
                            <span>{player.rankDiff}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Points Gain Pop-up & Physical Rolling Score */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                    {/* Points Gain Pill */}
                    {player.scoreGain > 0 && (
                      <div
                        className="animate-scale-in"
                        style={{
                          background: 'rgba(16, 185, 129, 0.18)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: '#34d399',
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          fontFamily: "'Outfit', sans-serif",
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                        }}
                      >
                        +{player.scoreGain}
                      </div>
                    )}

                    {/* Rolling Score Display */}
                    <div style={{ textAlign: 'right', minWidth: '95px' }}>
                      <span
                        className="font-display"
                        style={{
                          fontSize: '1.9rem',
                          fontWeight: 900,
                          color: isFirst ? '#fbbf24' : '#ffffff',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {currentScore.toLocaleString()}
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
        flexShrink: 0, position: 'relative', zIndex: 20,
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
