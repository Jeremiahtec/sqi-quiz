/**
 * Waiting.jsx — Player Waiting Screen
 * Shown after joining while waiting for the host to launch.
 * Features: Floating avatar aura, player chip, live status pulse,
 * instructions card, and instant reaction toolbar.
 */
import { Radio } from 'lucide-react';
import ReactionToolbar from '../../components/ReactionToolbar';

export default function Waiting({ nickname, avatar, onReact }) {
  return (
    <div
      className="layout-navy"
      style={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        textAlign: 'center',
        position: 'relative',
        overflowX: 'hidden',
        backgroundColor: '#070D1E',
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />

      <div
        className="animate-scale-in"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '360px',
          width: '100%',
        }}
      >
        {/* Floating Avatar with glowing aura */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '4.2rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(124, 58, 237, 0.2) 100%)',
              border: '2px solid rgba(96, 165, 250, 0.4)',
              boxShadow: '0 8px 30px rgba(37, 99, 235, 0.35)',
              animation: 'float 3.5s ease-in-out infinite',
            }}
          >
            {avatar || '🎓'}
          </div>
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            margin: '0 0 6px',
            color: '#ffffff',
            letterSpacing: '-0.01em',
          }}
        >
          You're in the Arena!
        </h1>

        <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.65)', margin: '0 0 20px' }}>
          Ready as{' '}
          <span
            style={{
              fontWeight: 800,
              color: '#60a5fa',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {nickname}
          </span>
        </p>

        {/* Status card with pulsing radar */}
        <div
          className="sqi-card-dark"
          style={{
            padding: '20px 24px',
            marginBottom: '20px',
            borderRadius: '18px',
            background: 'linear-gradient(180deg, rgba(16, 27, 59, 0.8) 0%, rgba(10, 17, 40, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#34d399',
                boxShadow: '0 0 10px #34d399',
              }}
            />
            <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Connected · Waiting for Host
            </span>
          </div>

          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
            Look up at the main projector screen. The competition will begin shortly!
          </p>
        </div>

        {/* Live Reaction toolbar */}
        <div style={{ marginBottom: '18px' }}>
          <ReactionToolbar onReact={onReact} />
        </div>

        {/* Guide banner */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.45)', margin: 0, lineHeight: 1.5 }}>
            📺 Questions appear on the big screen<br />
            📱 Tap your answer buttons here
          </p>
        </div>
      </div>
    </div>
  );
}
