/**
 * Join.jsx — Player Join Screen
 * High-production dark gaming entrance portal.
 * Features: PIN Auto-formatting, Avatar Selector Pills, Nickname input,
 * and Instant "Enter Arena" action with zero horizontal/vertical scrollbars.
 */
import { useState } from 'react';
import { Hash, User, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';

const AVATARS = ['🎓', '💻', '🤖', '🚀', '🧠', '⚡', '🛡️', '🎨'];

export default function Join({ onJoin, error, isJoining }) {
  const [pin, setPin] = useState(() => {
    try {
      const urlPin = new URLSearchParams(window.location.search).get('pin');
      return urlPin ? urlPin.slice(0, 6) : (sessionStorage.getItem('sqi_pin') || '');
    } catch {
      return '';
    }
  });
  const [nickname, setNickname] = useState(() => {
    try {
      return sessionStorage.getItem('sqi_nickname') || '';
    } catch {
      return '';
    }
  });
  const [avatar, setAvatar] = useState(() => {
    try {
      return sessionStorage.getItem('sqi_avatar') || '🎓';
    } catch {
      return '🎓';
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim() || isJoining) return;
    try {
      sessionStorage.setItem('sqi_pin', pin.trim());
      sessionStorage.setItem('sqi_nickname', nickname.trim());
      sessionStorage.setItem('sqi_avatar', avatar);
    } catch {}
    onJoin(pin.trim(), nickname.trim(), avatar);
  };

  const isValid = pin.length === 6 && nickname.trim().length >= 2;

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
        position: 'relative',
        overflowX: 'hidden',
        backgroundColor: '#070D1E',
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />

      {/* Main Glass Card */}
      <div
        className="sqi-card-dark animate-scale-in"
        style={{
          padding: '36px 28px',
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
          zIndex: 1,
          borderRadius: '24px',
          background: 'linear-gradient(180deg, rgba(16, 27, 59, 0.85) 0%, rgba(10, 17, 40, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* SQI Emblem & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <img
              src="/sqi-logo.png"
              alt="SQI College of ICT Logo"
              style={{
                width: '74px',
                height: '74px',
                objectFit: 'contain',
                animation: 'float 3.5s ease-in-out infinite',
                filter: 'drop-shadow(0 8px 24px rgba(37, 99, 235, 0.45))',
              }}
            />
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              margin: '0 0 4px',
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}
          >
            SQI Quiz Arena
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.55)', margin: 0 }}>
            SQI College of ICT
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* PIN input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}
            >
              Game PIN
            </label>
            <div style={{ position: 'relative' }}>
              <Hash
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              />
              <input
                id="pin-input"
                className="input-dark"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  paddingLeft: '42px',
                  fontSize: '1.6rem',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  textAlign: 'center',
                }}
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          {/* Avatar selection */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}
            >
              Choose Avatar
            </label>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: avatar === av ? '2px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: avatar === av ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                    fontSize: '1.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transform: avatar === av ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    boxShadow: avatar === av ? '0 0 14px rgba(37, 99, 235, 0.4)' : 'none',
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}
            >
              Your Nickname
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              />
              <input
                id="nickname-input"
                className="input-dark"
                type="text"
                maxLength={20}
                placeholder="Enter player name"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{
                  paddingLeft: '42px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                }}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="animate-slide-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '10px',
                color: '#f43f5e',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="join-btn"
            type="submit"
            className="btn-primary"
            disabled={!isValid || isJoining}
            style={{
              padding: '14px',
              fontSize: '1.05rem',
              fontWeight: 800,
              borderRadius: '12px',
              marginTop: '6px',
            }}
          >
            {isJoining ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Connecting to Room…</span>
              </>
            ) : (
              <>
                <span>Enter Arena</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
