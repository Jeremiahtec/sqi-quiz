/**
 * Join.jsx — Player Join Screen
 * Ultra-minimalist entry form: PIN + Nickname.
 */
import { useState } from 'react';
import { Hash, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const AVATARS = ['🎓', '💻', '🤖', '🚀', '🧠', '⚡', '🛡️', '🎨'];

export default function Join({ onJoin, error, isJoining }) {
  const [pin, setPin]           = useState(() => {
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
    <div className="layout-light" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Card */}
      <div
        className="sqi-card animate-scale-in"
        style={{
          padding: '40px 32px',
          width: '100%',
          maxWidth: '380px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* SQI Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'var(--sqi-navy)',
            color: 'white',
            marginBottom: '16px',
            fontSize: '1.6rem',
            animation: 'float 3.5s ease-in-out infinite',
            boxShadow: '0 4px 12px rgba(10, 17, 40, 0.1)',
          }}>
            🎓
          </div>
          <h1
            className="font-display"
            style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--sqi-navy)' }}
          >
            SQI Quiz
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--sqi-text-light)', margin: 0 }}>
            SQI College of ICT
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* PIN input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--sqi-text-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              Game PIN
            </label>
            <div style={{ position: 'relative' }}>
              <Hash
                size={18}
                style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--sqi-text-light)',
                }}
              />
              <input
                id="pin-input"
                className="input-base"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  paddingLeft: '42px',
                  fontSize: '1.5rem',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                }}
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          {/* Avatar selection */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--sqi-text-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
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
                    height: '38px',
                    borderRadius: '8px',
                    border: avatar === av ? '2px solid var(--sqi-accent)' : '1px solid var(--sqi-gray-border)',
                    background: avatar === av ? 'rgba(37, 99, 235, 0.1)' : 'var(--sqi-white)',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transform: avatar === av ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--sqi-text-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              Nickname
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--sqi-text-light)',
                }}
              />
              <input
                id="nickname-input"
                className="input-base"
                type="text"
                maxLength={20}
                placeholder="Your name"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{ paddingLeft: '42px' }}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="animate-slide-up"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 14px',
                background: 'rgba(225,29,72,0.1)',
                border: '1px solid var(--opt-red)',
                borderRadius: '8px',
                color: 'var(--opt-red)',
                fontSize: '0.875rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="join-btn"
            type="submit"
            className="btn-primary"
            disabled={!isValid || isJoining}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', marginTop: '8px',
            }}
          >
            {isJoining ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }} />
                Joining...
              </>
            ) : (
              <>
                Let's Play!
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom hint */}
      <p style={{
        marginTop: '24px',
        fontSize: '0.8rem',
        color: 'var(--sqi-text-light)',
        textAlign: 'center',
        zIndex: 1,
      }}>
        Ask your instructor for the Game PIN
      </p>
    </div>
  );
}
