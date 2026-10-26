import { playLockIn } from '../utils/soundEffects';

const EMOJIS = ['🔥', '👏', '💡', '❤️', '😮', '🎓'];

export default function ReactionToolbar({ onReact, style = {} }) {
  const handleClick = (emoji) => {
    playLockIn();
    onReact?.(emoji);
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid var(--sqi-gray-border)',
        borderRadius: '999px',
        boxShadow: '0 4px 16px rgba(10, 17, 40, 0.08)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        ...style,
      }}
    >
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--sqi-text-light)', marginRight: '2px' }}>
        React
      </span>
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleClick(emoji)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.35rem',
            lineHeight: 1,
            padding: '4px',
            borderRadius: '50%',
            transition: 'transform 0.15s ease',
            outline: 'none',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(1.35)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
