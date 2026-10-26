/**
 * Waiting.jsx — Player Waiting Screen
 * Shown after joining while the host hasn't started yet.
 * Displays chosen avatar and live reaction buttons.
 */
import ReactionToolbar from '../../components/ReactionToolbar';

export default function Waiting({ nickname, avatar, onReact }) {
  return (
    <div className="layout-light" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <div className="animate-scale-in" style={{ position: 'relative', zIndex: 1, maxWidth: '340px', width: '100%' }}>
        {/* Avatar with float */}
        <div style={{
          fontSize: '4.5rem',
          marginBottom: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'var(--sqi-white)',
          border: '2px solid var(--sqi-gray-border)',
          boxShadow: '0 8px 24px rgba(10, 17, 40, 0.08)',
          animation: 'float 3s ease-in-out infinite',
        }}>
          {avatar || '🎓'}
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            margin: '0 0 6px',
            color: 'var(--sqi-navy)'
          }}
        >
          You're in!
        </h1>

        <p style={{ fontSize: '1rem', color: 'var(--sqi-text-light)', margin: '0 0 24px' }}>
          Playing as{' '}
          <span style={{
            fontWeight: 700,
            color: 'var(--sqi-accent)',
            fontFamily: "'Outfit', sans-serif",
          }}>
            {nickname}
          </span>
        </p>

        {/* Pulsing dots */}
        <div
          className="sqi-card"
          style={{ padding: '20px 24px', marginBottom: '20px' }}
        >
          <p style={{ color: 'var(--sqi-text-light)', fontSize: '0.9rem', margin: '0 0 14px', fontWeight: 500 }}>
            Look at the projector screen
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--sqi-text-light)', marginRight: '6px', fontWeight: 600 }}>
              Waiting for host
            </span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--sqi-navy)',
                  animation: `pulse-ring 1.2s ${i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Live Reaction toolbar */}
        <div style={{ marginBottom: '16px' }}>
          <ReactionToolbar onReact={onReact} />
        </div>

        <div className="sqi-card" style={{ padding: '14px 18px', background: 'transparent' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--sqi-text-light)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
            📺 Questions appear on the big screen<br />
            📱 Answers appear on your phone
          </p>
        </div>
      </div>
    </div>
  );
}
