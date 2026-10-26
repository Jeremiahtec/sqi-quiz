/**
 * PostGame.jsx — Post-Game Insights
 * Tab 1: Podium with victory fanfare & confetti
 * Tab 2: Per-question accuracy bar chart + Toughest Question Spotlight
 * Tab 3: Full leaderboard
 * Header: CSV Report Export & Sound Toggle
 */
import { useState, useEffect } from 'react';
import { Trophy, BarChart2, Home, Users, Download, AlertTriangle } from 'lucide-react';
import ConfettiCanvas from '../../components/ConfettiCanvas';
import Podium from '../../components/Podium';
import QuestionStats from '../../components/QuestionStats';
import SoundToggle from '../../components/SoundToggle';
import FullscreenToggle from '../../components/FullscreenToggle';
import FloatingReactions from '../../components/FloatingReactions';
import { playFanfare } from '../../utils/soundEffects';

export default function PostGame({ finalData, onDone, socket }) {
  const [activeTab, setActiveTab] = useState('podium');

  const leaderboard    = finalData?.leaderboard    || [];
  const questionStats  = finalData?.questionStats  || [];

  // Play victory fanfare on mount
  useEffect(() => {
    playFanfare();
  }, []);

  // CSV Report Generator
  const handleExportCSV = () => {
    let csv = 'SQI QUIZ SESSION REPORT\n';
    csv += `Generated,"${new Date().toLocaleString()}"\n`;
    csv += `Total Players,${leaderboard.length}\n`;
    csv += `Total Questions,${questionStats.length}\n\n`;

    csv += 'LEADERBOARD\n';
    csv += 'Rank,Player,Total Score,Correct Answers,Accuracy %\n';
    leaderboard.forEach((p, idx) => {
      const correctCount = p.answers?.filter((a) => a?.correct).length || 0;
      const totalAnswered = p.answers?.length || questionStats.length || 1;
      const acc = Math.round((correctCount / totalAnswered) * 100);
      csv += `${idx + 1},"${p.nickname.replace(/"/g, '""')}",${p.score},${correctCount},${acc}%\n`;
    });

    csv += '\nQUESTION PERFORMANCE BREAKDOWN\n';
    csv += 'Question #,Question,Type,Correct Answer,Accuracy %,Correct Count,Answered Count,Total Players\n';
    questionStats.forEach((q, idx) => {
      const qText = (q.questionText || '').replace(/"/g, '""');
      const cAns = String(q.correctAnswer || '').replace(/"/g, '""');
      csv += `Q${idx + 1},"${qText}",${q.type},"${cAns}",${q.accuracy}%,${q.correctCount},${q.answeredCount},${q.totalPlayers}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sqi-quiz-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Find toughest question
  const toughestQuestion = questionStats.length > 0
    ? [...questionStats].sort((a, b) => a.accuracy - b.accuracy)[0]
    : null;

  return (
    <div className="layout-navy" style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floating reactions */}
      <FloatingReactions socket={socket} />

      {/* Confetti (always visible on podium tab) */}
      {activeTab === 'podium' && <ConfettiCanvas />}

      {/* ── Header ──────────────────────────────────────── */}
      <header style={{
        padding: '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'relative', zIndex: 20, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem' }}>🏆</span>
          <div>
            <h1 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Game Over!</h1>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              {leaderboard.length} players · {questionStats.length} questions
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '4px',
        }}>
          {[
            { id: 'podium',  label: 'Podium',   icon: <Trophy size={15} /> },
            { id: 'stats',   label: 'Analytics',icon: <BarChart2 size={15} /> },
            { id: 'board',   label: 'All Players', icon: <Users size={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: activeTab === tab.id
                  ? 'var(--sqi-accent)'
                  : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FullscreenToggle />
          <SoundToggle />

          <button
            type="button"
            onClick={handleExportCSV}
            title="Download full quiz report as CSV"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Download size={14} />
            Export CSV
          </button>

          <button
            id="done-btn"
            className="btn-ghost"
            onClick={onDone}
            style={{ display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </header>

      {/* ── Tab content ─────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px', position: 'relative', zIndex: 10 }}>

        {/* ── PODIUM TAB ── */}
        {activeTab === 'podium' && (
          <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center' }}>
              <div className="shimmer-text font-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Quiz Complete!
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '10px', fontSize: '1rem' }}>
                🎓 SQI College of ICT
              </p>
            </div>

            {/* Podium */}
            {leaderboard.length >= 1 && (
              <div>
                <p style={{
                  textAlign: 'center', fontSize: '0.78rem', fontWeight: 700,
                  color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
                  letterSpacing: '0.15em', marginBottom: '32px',
                }}>
                  Top Performers
                </p>
                <Podium leaderboard={leaderboard} />
              </div>
            )}

            {/* Rest of leaderboard */}
            {leaderboard.length > 3 && (
              <div className="sqi-card-dark" style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                  All Players
                </p>
                {leaderboard.slice(3).map((p, i) => (
                  <div key={p.nickname} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 4px',
                    borderBottom: i < leaderboard.length - 4 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <span style={{ width: '28px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
                      {i + 4}.
                    </span>
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{p.avatar || '🎓'}</span>
                    <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500 }}>{p.nickname}</span>
                    <span className="font-display" style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1rem' }}>
                      {p.score.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab === 'stats' && (
          <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>
                Class Performance
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: 0 }}>
                Accuracy per question — use this to identify topics that need review.
              </p>
            </div>

            {/* Toughest Question Spotlight */}
            {toughestQuestion && (
              <div
                className="sqi-card-dark"
                style={{
                  padding: '18px 24px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >
                <div style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  borderRadius: '10px',
                  padding: '8px',
                  color: '#f59e0b',
                  flexShrink: 0,
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f59e0b' }}>
                      Toughest Question Spotlight
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b', fontFamily: "'Outfit', sans-serif" }}>
                      {toughestQuestion.accuracy}% Accuracy
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, margin: '0 0 6px', fontSize: '0.95rem', color: '#fff' }}>
                    Q{(toughestQuestion.questionIndex ?? 0) + 1}: {toughestQuestion.questionText}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    Correct answer was: <strong style={{ color: '#34d399' }}>{toughestQuestion.correctAnswer}</strong>. Only {toughestQuestion.correctCount} of {toughestQuestion.answeredCount} answered correctly.
                  </p>
                </div>
              </div>
            )}

            <QuestionStats questionStats={questionStats} />
          </div>
        )}

        {/* ── ALL PLAYERS TAB ── */}
        {activeTab === 'board' && (
          <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>
                Full Leaderboard
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: 0 }}>
                {leaderboard.length} players participated
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((p, i) => {
                const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                const pct = leaderboard[0]?.score > 0
                  ? (p.score / leaderboard[0].score) * 100
                  : 0;

                return (
                  <div
                    key={p.nickname}
                    className="sqi-card-dark animate-slide-up"
                    style={{
                      padding: '14px 20px',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      animationDelay: `${i * 0.04}s`,
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', width: '28px', textAlign: 'center', flexShrink: 0 }}>
                      {rankEmoji || <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>{i + 1}</span>}
                    </span>
                    <span style={{ fontSize: '1.35rem', lineHeight: 1, flexShrink: 0 }}>{p.avatar || '🎓'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.nickname}
                      </p>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--sqi-accent), #6366f1)', borderRadius: '999px' }} />
                      </div>
                    </div>
                    <span className="font-display" style={{ fontWeight: 900, color: '#f59e0b', fontSize: '1.1rem', flexShrink: 0 }}>
                      {p.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}

              {leaderboard.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
                  No players participated.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
