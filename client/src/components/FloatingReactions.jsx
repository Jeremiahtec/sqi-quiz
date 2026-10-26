import { useEffect, useState } from 'react';

/**
 * FloatingReactions.jsx
 * Listens for 'game:reaction' socket events and floats emojis up smoothly.
 */
export default function FloatingReactions({ socket }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleReaction = ({ emoji, nickname, id }) => {
      const left = 10 + Math.random() * 80; // 10% to 90% across width
      const size = 36 + Math.floor(Math.random() * 24); // 36px to 60px
      const particleId = id || `${Date.now()}-${Math.random()}`;

      setParticles((prev) => [
        ...prev.slice(-40),
        { id: particleId, emoji, nickname, left, size },
      ]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 2200);
    };

    socket.on('game:reaction', handleReaction);
    return () => socket.off('game:reaction', handleReaction);
  }, [socket]);

  if (particles.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="animate-float-reaction"
          style={{
            position: 'absolute',
            bottom: '50px',
            left: `${p.left}%`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <span style={{
            fontSize: `${p.size}px`,
            lineHeight: 1,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
          }}>
            {p.emoji}
          </span>
          {p.nickname && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              color: 'rgba(255,255,255,0.95)',
              background: 'rgba(10, 17, 40, 0.78)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '999px',
              padding: '1px 8px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}>
              {p.nickname}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
