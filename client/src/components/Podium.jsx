/**
 * Podium.jsx — Suspenseful Animated Podium Reveal
 * Reveals 3rd Place -> 2nd Place -> 1st Place Champion in a theatrical sequence
 * with drumrolls, rising platforms, spotlights, and victory celebrations.
 */
import { useState, useEffect, useRef } from 'react';
import { Trophy, Medal, Crown, Sparkles, FastForward } from 'lucide-react';
import { playDrumroll, playPodiumSpotlight, playFanfare } from '../utils/soundEffects';

const PODIUM_CONFIGS = [
  // 2nd place — left
  {
    rank: 2,
    height: 140,
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    bgColor: 'linear-gradient(180deg, rgba(148,163,184,0.25) 0%, rgba(148,163,184,0.05) 100%)',
    borderColor: 'rgba(148,163,184,0.4)',
    label: '2nd Place',
    icon: <Medal size={24} />,
  },
  // 1st place — center (tallest)
  {
    rank: 1,
    height: 200,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    bgColor: 'linear-gradient(180deg, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.08) 100%)',
    borderColor: 'rgba(245,158,11,0.6)',
    label: '1st Place Champion',
    icon: <Trophy size={30} />,
  },
  // 3rd place — right
  {
    rank: 3,
    height: 100,
    color: '#cd7f32',
    glowColor: 'rgba(205, 127, 50, 0.4)',
    bgColor: 'linear-gradient(180deg, rgba(205,127,50,0.2) 0%, rgba(205,127,50,0.05) 100%)',
    borderColor: 'rgba(205,127,50,0.4)',
    label: '3rd Place',
    icon: <Medal size={22} />,
  },
];

export default function Podium({ leaderboard = [], onChampionRevealed }) {
  const playerCount = leaderboard.length;

  // Staged suspense state: which ranks have been officially unveiled
  // 3 -> 2 -> 1
  const [revealedRanks, setRevealedRanks] = useState(new Set());
  const [currentSuspenseText, setCurrentSuspenseText] = useState('');
  const [isChampionAnnounced, setIsChampionAnnounced] = useState(false);
  const sequenceRunning = useRef(false);

  const unveilRank = (rank) => {
    setRevealedRanks((prev) => new Set([...prev, rank]));
    playPodiumSpotlight(rank);
  };

  const skipToEnd = () => {
    setRevealedRanks(new Set([1, 2, 3]));
    setIsChampionAnnounced(true);
    setCurrentSuspenseText('👑 TOURNAMENT CHAMPION 👑');
    onChampionRevealed?.();
  };

  // Run the suspense reveal timeline
  useEffect(() => {
    if (sequenceRunning.current || playerCount === 0) return;
    sequenceRunning.current = true;

    const timers = [];

    if (playerCount >= 3) {
      // 3+ players: reveal 3rd -> 2nd -> 1st
      setCurrentSuspenseText('🥉 Revealing 3rd Place…');
      playDrumroll(1.6);

      timers.push(setTimeout(() => {
        unveilRank(3);
        setCurrentSuspenseText('🥈 In 2nd Place…');
        playDrumroll(1.8);
      }, 1800));

      timers.push(setTimeout(() => {
        unveilRank(2);
        setCurrentSuspenseText('🥇 And the CHAMPION is…');
        playDrumroll(2.2);
      }, 3800));

      timers.push(setTimeout(() => {
        unveilRank(1);
        setIsChampionAnnounced(true);
        setCurrentSuspenseText('👑 TOURNAMENT CHAMPION 👑');
        onChampionRevealed?.();
      }, 6200));

    } else if (playerCount === 2) {
      // 2 players: reveal 2nd -> 1st
      setCurrentSuspenseText('🥈 In 2nd Place…');
      playDrumroll(1.8);

      timers.push(setTimeout(() => {
        unveilRank(2);
        setCurrentSuspenseText('🥇 And the CHAMPION is…');
        playDrumroll(2.2);
      }, 2000));

      timers.push(setTimeout(() => {
        unveilRank(1);
        setIsChampionAnnounced(true);
        setCurrentSuspenseText('👑 TOURNAMENT CHAMPION 👑');
        onChampionRevealed?.();
      }, 4400));

    } else {
      // 1 player: reveal champion with suspense
      setCurrentSuspenseText('🥇 And the CHAMPION is…');
      playDrumroll(1.6);

      timers.push(setTimeout(() => {
        unveilRank(1);
        setIsChampionAnnounced(true);
        setCurrentSuspenseText('👑 TOURNAMENT CHAMPION 👑');
        onChampionRevealed?.();
      }, 1800));
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [playerCount]);

  // Visual slots mapping: Left (2nd), Center (1st), Right (3rd)
  const slots = [
    { config: PODIUM_CONFIGS[0], player: leaderboard[1] || null },
    { config: PODIUM_CONFIGS[1], player: leaderboard[0] || null },
    { config: PODIUM_CONFIGS[2], player: leaderboard[2] || null },
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: '640px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* ── Suspense Banner ──────────────────────────────── */}
      <div style={{
        marginBottom: '28px',
        textAlign: 'center',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div
          key={currentSuspenseText}
          className="animate-scale-in"
          style={{
            padding: '8px 24px',
            borderRadius: '999px',
            background: isChampionAnnounced
              ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)'
              : 'rgba(255, 255, 255, 0.06)',
            border: isChampionAnnounced
              ? '1.5px solid rgba(245, 158, 11, 0.6)'
              : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isChampionAnnounced
              ? '0 0 24px rgba(245, 158, 11, 0.35)'
              : 'none',
            color: isChampionAnnounced ? '#fbbf24' : '#ffffff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: isChampionAnnounced ? '1.3rem' : '1.1rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isChampionAnnounced && <Sparkles size={18} />}
          <span>{currentSuspenseText}</span>
          {isChampionAnnounced && <Sparkles size={18} />}
        </div>
      </div>

      {/* ── 3D Podium Stands ─────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '16px',
        width: '100%',
        minHeight: '340px',
        padding: '0 10px',
      }}>
        {slots.map(({ config, player }) => {
          const isRevealed = revealedRanks.has(config.rank);
          const hasPlayer = !!player;

          return (
            <div
              key={config.rank}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
              }}
            >
              {/* Player Avatar & Info (Reveals when unveiled) */}
              {hasPlayer && isRevealed ? (
                <div
                  className="animate-scale-in"
                  style={{
                    textAlign: 'center',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Floating Gold Crown for 1st Place */}
                  {config.rank === 1 && (
                    <div className="animate-slide-up" style={{
                      position: 'absolute',
                      top: '-32px',
                      color: '#fbbf24',
                      filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.8))',
                      animation: 'float 3s ease-in-out infinite',
                    }}>
                      <Crown size={34} fill="#fbbf24" color="#fbbf24" />
                    </div>
                  )}

                  {/* Avatar circle with glow */}
                  <div style={{
                    width: config.rank === 1 ? '76px' : '62px',
                    height: config.rank === 1 ? '76px' : '62px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${config.color}44, ${config.color}11)`,
                    border: `2.5px solid ${config.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: config.rank === 1 ? '2.4rem' : '1.8rem',
                    boxShadow: `0 0 24px ${config.glowColor}, 0 6px 16px rgba(0,0,0,0.4)`,
                    position: 'relative',
                    marginBottom: '8px',
                  }}>
                    <span>{player.avatar || '🎓'}</span>
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      background: config.color,
                      color: '#000000',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    }}>
                      {config.rank}
                    </span>
                  </div>

                  {/* Nickname */}
                  <p className="font-display" style={{
                    fontWeight: 800,
                    fontSize: config.rank === 1 ? '1.2rem' : '1rem',
                    color: '#ffffff',
                    margin: '0 0 2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '120px',
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  }}>
                    {player.nickname}
                  </p>

                  {/* Score */}
                  <p style={{
                    margin: 0,
                    fontSize: config.rank === 1 ? '1rem' : '0.85rem',
                    fontWeight: 800,
                    color: config.color,
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {player.score.toLocaleString()} pts
                  </p>
                </div>
              ) : (
                <div style={{ height: config.rank === 1 ? '140px' : '120px', width: '100%' }} />
              )}

              {/* Platform stand bar */}
              <div
                style={{
                  width: '100%',
                  height: hasPlayer && isRevealed ? `${config.height}px` : '40px',
                  background: hasPlayer && isRevealed ? config.bgColor : 'rgba(255, 255, 255, 0.03)',
                  border: `1.5px solid ${hasPlayer && isRevealed ? config.borderColor : 'rgba(255, 255, 255, 0.07)'}`,
                  borderBottom: 'none',
                  borderRadius: '16px 16px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.4s ease, border-color 0.4s ease',
                  boxShadow: hasPlayer && isRevealed ? `0 0 20px ${config.glowColor}` : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  fontSize: config.rank === 1 ? '3.5rem' : '2.5rem',
                  color: config.color,
                  opacity: hasPlayer && isRevealed ? 0.85 : 0.2,
                  transition: 'opacity 0.4s ease',
                }}>
                  {config.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip button for the host */}
      {!isChampionAnnounced && (
        <button
          onClick={skipToEnd}
          className="btn-ghost"
          style={{
            marginTop: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 16px',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.6)',
            borderRadius: '999px',
          }}
        >
          <FastForward size={14} />
          <span>Skip Animation</span>
        </button>
      )}
    </div>
  );
}
