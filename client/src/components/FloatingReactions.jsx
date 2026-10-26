import { useEffect, useState } from 'react';

/**
 * FloatingReactions.jsx
 * Listens for 'game:reaction' socket events and floats emojis up smoothly.
 */
export default function FloatingReactions({ socket }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleReaction = ({ emoji, id }) => {
      const left = 10 + Math.random() * 80; // 10% to 90% across width
      const size = 36 + Math.floor(Math.random() * 24); // 36px to 60px
      const particleId = id || `${Date.now()}-${Math.random()}`;

      setParticles((prev) => [
        ...prev.slice(-40),
        { id: particleId, emoji, left, size },
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
            fontSize: `${p.size}px`,
            lineHeight: 1,
            userSelect: 'none',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
