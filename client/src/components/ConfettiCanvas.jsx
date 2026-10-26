/**
 * ConfettiCanvas.jsx
 * Pure CSS/React confetti — no external library.
 * Generates 80 pieces with random colors, sizes, positions, and timing.
 */
import { useMemo } from 'react';

const COLORS = [
  '#7c3aed', '#6366f1', '#a78bfa',
  '#06b6d4', '#38bdf8',
  '#f43f5e', '#fb923c',
  '#f59e0b', '#facc15',
  '#10b981', '#34d399',
  '#ec4899', '#f472b6',
];

export default function ConfettiCanvas() {
  const pieces = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => {
      const isCircle = Math.random() > 0.4;
      const size = 6 + Math.random() * 10;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: `${(Math.random() * 4).toFixed(2)}s`,
        duration: `${(2.5 + Math.random() * 3).toFixed(2)}s`,
        width: `${size}px`,
        height: isCircle ? `${size}px` : `${size * 0.5}px`,
        borderRadius: isCircle ? '50%' : '2px',
        initialRotation: `${Math.floor(Math.random() * 360)}deg`,
        opacity: 0.8 + Math.random() * 0.2,
      };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-30px',
            left: p.left,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
            opacity: p.opacity,
            transform: `rotate(${p.initialRotation})`,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
