/**
 * Lobby.jsx — Host Arena Lobby Screen
 * Dual-stage widescreen layout designed for projectors and displays.
 * Fits within 100vh with ZERO scrollbars.
 * Features: QR Code, Game PIN, Live Player Roster, Floating Reactions,
 * Sound Effects, Fullscreen, and Instant Keyboard Shortcut Launch (Space/Enter).
 */
import { useState, useEffect, useRef } from 'react';
import { Users, Play, Wifi, WifiOff, X, QrCode, Copy, Check, Sparkles, Radio } from 'lucide-react';
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

  // Keyboard shortcut: Space or Enter to launch when at least 1 player is present
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && players.length > 0 && !starting) {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [players.length, starting]);

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
    <div
      className="layout-navy"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Reactions overlay */}
      <FloatingReactions socket={socket} />

      {/* ── Top Bar ───────────────────────────────────────── */}
      <header
        style={{
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 20,
          background: 'rgba(10, 17, 40, 0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/sqi-logo.png"
            alt="SQI College of ICT"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.4))',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                SQI Quiz
              </h1>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(37, 99, 235, 0.25)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                }}
              >
                Lobby
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.45)', margin: 0 }}>
              Waiting for players to connect
            </p>
          </div>
        </div>

        {quiz && (
          <div
            className="sqi-card-dark"
            style={{
              borderRadius: '12px',
              padding: '6px 18px',
              maxWidth: '380px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {quiz.questions?.length || 0} Questions
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <p
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  margin: 0,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {quiz.title}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FullscreenToggle />
          <SoundToggle />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            }}
          >
            {connected ? <Wifi size={13} style={{ color: '#10b981' }} /> : <WifiOff size={13} style={{ color: '#f43f5e' }} />}
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: connected ? '#10b981' : '#f43f5e' }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Center Stage (Dual Pane) ───────────────────────── */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 440px) 1fr',
          gap: '24px',
          padding: '20px 32px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ── Left Pane: QR Code & PIN Portal ──────────────── */}
        <div
          className="sqi-card-dark animate-scale-in"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            borderRadius: '20px',
            background: 'linear-gradient(180deg, rgba(16, 27, 59, 0.8) 0%, rgba(10, 17, 40, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            textAlign: 'center',
          }}
        >
          {/* QR Code with crisp frame */}
          <div
            style={{
              padding: '12px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              display: 'inline-flex',
            }}
          >
            <QRCode value={joinUrl} size={130} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', fontWeight: 600 }}>
            <QrCode size={14} style={{ color: '#60a5fa' }} />
            <span>Scan with phone camera to join</span>
          </div>

          {/* Divider */}
          <div style={{ width: '80%', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

          {/* PIN Component */}
          <PinDisplay pin={pin} />

          {/* Copy invite link button */}
          <button
            onClick={handleCopyLink}
            className="btn-ghost"
            type="button"
            style={{
              padding: '7px 16px',
              fontSize: '0.82rem',
              borderRadius: '999px',
              color: copied ? '#34d399' : 'rgba(255, 255, 255, 0.75)',
              borderColor: copied ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.15)',
              background: copied ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            }}
          >
            {copied ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
            <span>{copied ? 'Invite Link Copied!' : 'Copy Direct Link'}</span>
          </button>
        </div>

        {/* ── Right Pane: Live Competitors Arena ────────────── */}
        <div
          className="sqi-card-dark animate-slide-up"
          style={{
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            background: 'linear-gradient(180deg, rgba(16, 27, 59, 0.7) 0%, rgba(10, 17, 40, 0.85) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(37, 99, 235, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa',
                }}
              >
                <Users size={17} />
              </div>
              <div>
                <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Competitors in Arena
                </h3>
                <p style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.45)', margin: 0 }}>
                  Real-time participant feed
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: players.length > 0 ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${players.length > 0 ? 'rgba(37, 99, 235, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: players.length > 0 ? '#34d399' : 'rgba(255, 255, 255, 0.3)',
                  boxShadow: players.length > 0 ? '0 0 10px #34d399' : 'none',
                }}
              />
              <span
                className="font-display"
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: players.length > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {players.length} {players.length === 1 ? 'Player' : 'Players'}
              </span>
            </div>
          </div>

          {/* Player Chips Area (scrolls cleanly if many players) */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignContent: 'flex-start',
              paddingRight: '6px',
            }}
          >
            {players.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  color: 'rgba(255, 255, 255, 0.35)',
                  textAlign: 'center',
                  gap: '14px',
                  padding: '24px',
                }}
              >
                <div
                  className="animate-pulse-glow"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(37, 99, 235, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                  }}
                >
                  <Radio size={28} />
                </div>
                <div>
                  <p className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px', color: '#ffffff' }}>
                    Waiting for players to step in…
                  </p>
                  <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                    Scan the QR code or enter Game PIN on your phone.
                  </p>
                </div>
              </div>
            ) : (
              players.map((p, i) => {
                const name = typeof p === 'string' ? p : p.nickname;
                const avatar = typeof p === 'string' ? '🎓' : (p.avatar || '🎓');

                return (
                  <div
                    key={name}
                    className="animate-scale-in"
                    style={{
                      padding: '8px 16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      animationDelay: `${i * 0.04}s`,
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '999px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{avatar}</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif" }}>{name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onKickPlayer?.(name);
                      }}
                      title={`Remove ${name}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginLeft: '4px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(244, 63, 94, 0.3)';
                        e.currentTarget.style.color = '#f43f5e';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                      }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ── Bottom Pinned Launch Bar ──────────────────────── */}
      <footer
        style={{
          padding: '14px 32px',
          background: 'rgba(10, 17, 40, 0.85)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.82rem' }}>
          <Sparkles size={14} style={{ color: '#fbbf24' }} />
          <span>
            {players.length > 0 ? (
              <>Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>Space</kbd> or click Start to launch the game</>
            ) : (
              'At least 1 player must connect before the tournament can start'
            )}
          </span>
        </div>

        <button
          id="start-game-btn"
          className="btn-primary"
          onClick={handleStart}
          disabled={players.length === 0 || starting || !connected}
          style={{
            padding: '12px 36px',
            fontSize: '1.05rem',
            fontWeight: 800,
            borderRadius: '12px',
            gap: '10px',
            boxShadow: players.length > 0 ? '0 0 24px rgba(37, 99, 235, 0.5)' : 'none',
          }}
        >
          <Play size={18} fill="currentColor" />
          <span>
            {starting
              ? 'Starting Arena…'
              : `Start Game (${players.length} ${players.length === 1 ? 'Player' : 'Players'})`}
          </span>
        </button>
      </footer>
    </div>
  );
}
