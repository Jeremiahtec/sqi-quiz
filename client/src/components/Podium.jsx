/**
 * Podium.jsx
 * Top-3 podium display for the post-game screen.
 * Animated platform bars with trophy icons.
 */
import { Trophy, Medal } from 'lucide-react';

const PODIUM_CONFIGS = [
  // 2nd place — left
  { rank: 2, height: 100, color: '#94a3b8', bgColor: 'rgba(148,163,184,0.1)', borderColor: 'rgba(148,163,184,0.25)', delay: '0.2s', icon: <Medal size={22} /> },
  // 1st place — center (tallest)
  { rank: 1, height: 150, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)',  delay: '0s',   icon: <Trophy size={26} /> },
  // 3rd place — right
  { rank: 3, height: 70,  color: '#cd7f32', bgColor: 'rgba(205,127,50,0.1)', borderColor: 'rgba(205,127,50,0.2)', delay: '0.35s', icon: <Medal size={20} /> },
];

export default function Podium({ leaderboard = [] }) {
  // Build display slots mapping the sorted leaderboard to the visual podium positions
  const slots = [
    { config: PODIUM_CONFIGS[0], player: leaderboard[1] || null }, // Left (2nd place)
    { config: PODIUM_CONFIGS[1], player: leaderboard[0] || null }, // Center (1st place)
    { config: PODIUM_CONFIGS[2], player: leaderboard[2] || null }, // Right (3rd place)
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '12px',
      padding: '0 20px',
      maxWidth: '500px',
      margin: '0 auto',
    }}>
      {slots.map(({ config, player }) => (
        <div
          key={config.rank}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          {/* Avatar & name */}
          {player && (
            <div
              className="animate-bounce-in"
              style={{ animationDelay: config.delay, textAlign: 'center', width: '100%' }}
            >
              {/* Avatar circle */}
              <div style={{
                width: config.rank === 1 ? '68px' : '56px',
                height: config.rank === 1 ? '68px' : '56px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${config.color}33, ${config.color}11)`,
                border: `2px solid ${config.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 6px',
                fontSize: config.rank === 1 ? '2rem' : '1.6rem',
                color: config.color,
                boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
                position: 'relative',
              }}>
                <span>{player.avatar || '🎓'}</span>
                <span style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  background: config.color,
                  color: '#000',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}>
                  {config.rank}
                </span>
              </div>

              {/* Nickname */}
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: config.rank === 1 ? '1rem' : '0.875rem',
                color: '#fff',
                marginBottom: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '90px',
              }}>
                {player.nickname}
              </p>

              {/* Score */}
              <p style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: config.color,
              }}>
                {player.score.toLocaleString()}
              </p>
            </div>
          )}

          {/* Platform bar */}
          <div
            className="animate-slide-up"
            style={{
              width: '100%',
              height: `${config.height}px`,
              background: config.bgColor,
              border: `1px solid ${config.borderColor}`,
              borderBottom: 'none',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animationDelay: config.delay,
              boxShadow: `0 -4px 12px rgba(0,0,0,0.1)`,
            }}
          >
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: config.rank === 1 ? '3rem' : '2.2rem',
              color: config.color,
              opacity: 0.6,
            }}>
              {config.rank}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
