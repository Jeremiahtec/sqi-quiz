/**
 * StartCountdown.jsx
 * High-energy 5-second exaggerated countdown before Question 1 starts.
 * Features animated scale-slam numbers, audio countdown beeps,
 * and live reaction floating overlays.
 */
import { useState, useEffect, useRef } from 'react';
import { Zap, Tv, Eye } from 'lucide-react';
import FloatingReactions from './FloatingReactions';
import SoundToggle from './SoundToggle';
import FullscreenToggle from './FullscreenToggle';
import { playStartCountdownTick } from '../utils/soundEffects';

export default function StartCountdown({ socket, isHost, totalQuestions = 1 }) {
  const [count, setCount] = useState(5);
  const [animKey, setAnimKey] = useState(0);
  const prevCount = useRef(5);

  // Play audio sound effect on each tick
  useEffect(() => {
    playStartCountdownTick(count);
    setAnimKey((k) => k + 1);
  }, [count]);

  // Sync with server socket events, or local fallback ticker
  useEffect(() => {
    if (!socket) return;

    const handleTick = ({ count: serverCount }) => {
      setCount(serverCount);
    };

    socket.on('game:countdown-tick', handleTick);
    return () => socket.off('game:countdown-tick', handleTick);
  }, [socket]);

  // Local fallback timer in case socket tick is delayed
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0; // GO!
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isGo = count === 0;

  // Colors per number
  const countColor = isGo
    ? 'var(--opt-green)'
    : count === 1
    ? 'var(--opt-red)'
    : count <= 3
    ? 'var(--opt-yellow)'
    : 'var(--sqi-accent)';

  return (
    <div className="layout-navy" style={{
      height: '100dvh', width: '100vw',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Floating live reactions */}
      <FloatingReactions socket={socket} />

      {/* Background ambient glow rings */}
      <div style={{
        position: 'absolute',
        width: '420px', height: '420px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${countColor}33 0%, transparent 70%)`,
        transition: 'all 0.4s ease',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Top Header controls (host only) */}
      {isHost && (
        <div style={{
          position: 'absolute', top: '20px', right: '28px',
          display: 'flex', alignItems: 'center', gap: '12px', zIndex: 20,
        }}>
          <FullscreenToggle />
          <SoundToggle />
        </div>
      )}

      {/* Top badge */}
      <div className="animate-slide-up" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '8px 22px', borderRadius: '999px',
        background: 'rgba(255,255,255,0.06)',
        border: `1.5px solid ${countColor}66`,
        color: '#ffffff',
        fontSize: '0.95rem', fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        marginBottom: '28px',
        boxShadow: `0 0 20px ${countColor}44`,
        transition: 'all 0.4s ease',
        position: 'relative', zIndex: 10,
      }}>
        <Zap size={18} fill={countColor} color={countColor} />
        <span>GET READY!</span>
      </div>

      {/* Giant Animated Number */}
      <div
        key={animKey}
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: isGo ? 'clamp(6rem, 18vw, 12rem)' : 'clamp(7rem, 24vw, 15rem)',
          fontWeight: 900,
          color: countColor,
          lineHeight: 1,
          textShadow: `0 0 40px ${countColor}aa, 0 10px 30px rgba(0,0,0,0.6)`,
          animation: 'scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          userSelect: 'none',
          position: 'relative', zIndex: 10,
        }}
      >
        {isGo ? 'GO!' : count}
      </div>

      {/* Subtitle guidance */}
      <div style={{ marginTop: '32px', position: 'relative', zIndex: 10, padding: '0 24px' }}>
        {isHost ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)' }}>
            <Tv size={20} style={{ color: 'var(--sqi-accent)' }} />
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
              Question 1 of {totalQuestions} is starting!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)' }}>
            <Eye size={20} style={{ color: 'var(--opt-yellow)' }} />
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
              Look at the projector screen!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
