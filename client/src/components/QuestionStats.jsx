/**
 * QuestionStats.jsx
 * Bar chart showing class accuracy % per question — post-game analytics tab.
 */

export default function QuestionStats({ questionStats = [] }) {
  if (!questionStats.length) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '60px 0' }}>
        No question data available.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {questionStats.map((stat, i) => {
        const accuracy = stat.accuracy ?? 0;
        const barColor = accuracy >= 70 ? '#10b981' : accuracy >= 40 ? '#f59e0b' : '#f43f5e';

        return (
          <div
            key={i}
            className="sqi-card-dark animate-slide-up"
            style={{
              padding: '16px 20px',
              animationDelay: `${i * 0.06}s`,
            }}
          >
            {/* Question label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '12px' }}>
              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
                flex: 1,
                lineHeight: 1.4,
              }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginRight: '8px',
                }}>
                  Q{i + 1}
                </span>
                {stat.questionText}
              </p>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: barColor,
                }}>
                  {accuracy}%
                </span>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
                  {stat.correctCount}/{stat.answeredCount} correct
                </p>
              </div>
            </div>

            {/* Bar track */}
            <div style={{
              height: '10px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${accuracy}%`,
                  background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                  borderRadius: '999px',
                  transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: `0 0 10px rgba(0,0,0,0.1)`,
                }}
              />
            </div>

            {/* Type badge */}
            <p style={{ marginTop: '6px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
              {stat.type?.replace('-', ' ').toUpperCase()} · {stat.totalPlayers} players
            </p>
          </div>
        );
      })}
    </div>
  );
}
