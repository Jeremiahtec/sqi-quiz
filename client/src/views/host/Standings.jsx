/**
 * Standings.jsx — Intermediate Leaderboard View
 * Displayed between questions to show current scores with avatars,
 * Fullscreen toggle, and live floating reactions.
 */
import { ChevronRight } from 'lucide-react';
import Podium from '../../components/Podium';
import FullscreenToggle from '../../components/FullscreenToggle';
import FloatingReactions from '../../components/FloatingReactions';

export default function Standings({ leaderboard, questionIndex, totalQuestions, onNext, socket }) {
  return (
    <div className="layout-navy" style={{
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floating reactions overlay */}
      <FloatingReactions socket={socket} />

      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Standings · Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* SQI brand & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FullscreenToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
            <span className="font-display" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>SQI Quiz</span>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '40px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 10,
      }}>
        <h2 className="font-display animate-slide-up" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '40px', letterSpacing: '-0.02em', textAlign: 'center' }}>
          Current Standings
        </h2>

        {leaderboard && leaderboard.length >= 1 ? (
          <div className="animate-scale-in" style={{ width: '100%', maxWidth: '700px', animationDelay: '0.1s' }}>
            <Podium leaderboard={leaderboard.slice(0, 3)} />
            
            {leaderboard.length > 3 && (
              <div className="sqi-card-dark" style={{ padding: '20px 24px', marginTop: '40px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                  Next in line
                </p>
                {leaderboard.slice(3, 8).map((p, i) => (
                  <div key={p.nickname} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 4px',
                    borderBottom: i < Math.min(leaderboard.length - 3, 5) - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <span style={{ width: '28px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
                      {i + 4}.
                    </span>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                      {p.avatar || '🎓'}
                    </span>
                    <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500 }}>{p.nickname}</span>
                    <span className="font-display" style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1rem' }}>
                      {p.score.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem', marginTop: '40px' }}>
            No scores yet.
          </p>
        )}
      </div>

      {/* ── Control bar ──────────────────────────────────── */}
      <div style={{
        padding: '16px 28px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        flexShrink: 0, position: 'relative', zIndex: 10,
      }}>
        <button
          id="next-question-btn"
          className="btn-primary"
          onClick={onNext}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', padding: '12px 28px' }}
        >
          {questionIndex + 1 >= totalQuestions ? '🏆 Show Final Results' : 'Next Question'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
