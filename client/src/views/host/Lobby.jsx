/**
 * Lobby.jsx — Host Lobby Screen
 * Professional waiting room with PIN, Scannable QR Code, Sound effects,
 * Fullscreen toggle, live floating reactions, and player avatars with moderation.
 */
import { useState, useEffect, useRef } from 'react';
import { Users, Play, Wifi, WifiOff, X, QrCode, Copy, Check } from 'lucide-react';
import PinDisplay from '../../components/PinDisplay';
import QRCode from '../../components/QRCode';
import SoundToggle from '../../components/SoundToggle';
import FullscreenToggle from '../../components/FullscreenToggle';
import FloatingReactions from '../../components/FloatingReactions';
import { playLobbyJoin } from '../../utils/soundEffects';

export default function Lobby({ pin, players = [], quiz, connected, onStart, onKickPlayer, socket }) {
  const [starting, setStarting] = useState(false);
  const [copied, setCopied]     = useState(false);
  const prevPlayerCount = useRef(players.length);

  // Play subtle chime when a new player joins
  useEffect(() => {
    if (players.length > prevPlayerCount.current) {
      playLobbyJoin();
    }
    prevPlayerCount.current = players.length;
  }, [players.length]);

  const handleStart = () => {
    if (players.length === 0 || starting) return;
    setStarting(true);
    onStart();
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  // Build join URL for QR code
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?pin=${pin || ''}`
    : `/?pin=${pin || ''}`;

  return (
    <div className="layout-navy" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Floating Reactions overlay */}
      <FloatingReactions socket={socket} />

      {/* Header */}
      <header style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative', zIndex: 10,
        background: 'rgba(8,8,24,0.4)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <div>
            <h1 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>SQI Quiz</h1>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Game Lobby</p>
          </div>
        </div>

        {quiz && (
          <div className="sqi-card-dark" style={{ borderRadius: '10px', padding: '8px 16px', maxWidth: '300px' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Playing</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{quiz.title}</p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FullscreenToggle />
          <SoundToggle />

          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '999px',
            background: connected ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
            border: `1px solid ${connected ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
          }}>
            {connected ? <Wifi size={13} style={{ color: '#10b981' }} /> : <WifiOff size={13} style={{ color: '#f43f5e' }} />}
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: connected ? '#10b981' : '#f43f5e' }}>
              {connected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', gap: '28px', position: 'relative', zIndex: 10,
      }}>
        {/* PIN + QR code card */}
        <div
          className="sqi-card-dark animate-scale-in"
          style={{
            padding: '28px 36px',
            maxWidth: '680px',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          {/* QR Code side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <QRCode value={joinUrl} size={120} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 500 }}>
              <QrCode size={13} />
              <span>Scan to join</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '100px', background: 'rgba(255,255,255,0.1)' }} />

          {/* PIN side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PinDisplay pin={pin} />
            <button
              onClick={handleCopyLink}
              className="btn-ghost"
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: '999px',
                color: copied ? '#10b981' : 'rgba(255,255,255,0.7)',
                borderColor: copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.15)',
                background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              <span>{copied ? 'Invite Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>
        </div>

        {/* Player count + list */}
        <div className="sqi-card-dark animate-slide-up" style={{ borderRadius: '24px', padding: '28px 32px', maxWidth: '680px', width: '100%', animationDelay: '0.15s' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--sqi-accent)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Players Joined</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '40px', height: '40px',
              borderRadius: '50%',
              background: players.length > 0 ? 'rgba(77,144,254,0.2)' : 'rgba(255,255,255,0.07)',
              border: `2px solid ${players.length > 0 ? 'var(--sqi-accent)' : 'rgba(255,255,255,0.1)'}`,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800, fontSize: '1.1rem',
              color: players.length > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s',
            }}>
              {players.length}
            </div>
          </div>

          {/* Player chips with Avatars */}
          <div style={{ minHeight: '80px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start' }}>
            {players.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'rgba(255,255,255,0.3)', marginTop: '24px', marginBottom: '24px', width: '100%' }}>
                <Users size={44} />
                <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>
                  Waiting for players to join...
                </p>
              </div>
            ) : (
              players.map((p, i) => {
                const name = typeof p === 'string' ? p : p.nickname;
                const avatar = typeof p === 'string' ? '🎓' : (p.avatar || '🎓');

                return (
                  <span
                    key={name}
                    className="sqi-card-dark animate-scale-in"
                    style={{
                      padding: '8px 16px',
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      animationDelay: `${i * 0.04}s`,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '30px',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{avatar}</span>
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onKickPlayer?.(name);
                      }}
                      title={`Kick ${name}`}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.6)',
                        marginLeft: '4px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(244,63,94,0.3)';
                        e.currentTarget.style.color = '#f43f5e';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                      }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                );
              })
            )}
          </div>

          {/* Start button */}
          <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px' }}>
            <button
              id="start-game-btn"
              className="btn-primary"
              onClick={handleStart}
              disabled={players.length === 0 || starting || !connected}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', fontSize: '1.1rem', padding: '16px',
              }}
            >
              <Play size={20} />
              {starting ? 'Starting…' : `Start Game (${players.length} player${players.length !== 1 ? 's' : ''})`}
            </button>

            {players.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
                At least 1 player must join before starting
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
