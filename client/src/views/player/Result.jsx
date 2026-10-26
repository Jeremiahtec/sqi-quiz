/**
 * Result.jsx — Player Result Screen
 * Shows per-question result (correct/wrong + score) after each reveal.
 * Also handles the final game-over screen with leaderboard rank.
 */
import { Trophy, CheckCircle2, XCircle, Clock, Medal } from 'lucide-react';
import ReactionToolbar from '../../components/ReactionToolbar';

// ── Per-Question Result ─────────────────────────────────────
function QuestionResult({ resultData, onReact }) {
  const { correct, scoreGain, streakBonus, streak, totalScore, rank, correctAnswerText } = resultData || {};

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

      <div className="animate-scale-in" style={{ position: 'relative', zIndex: 1, maxWidth: '300px', width: '100%' }}>
        {/* Big icon */}
        <div style={{ marginBottom: '16px', animation: 'bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
          {correct
            ? <CheckCircle2 size={88} style={{ color: '#10b981' }} />
            : <XCircle     size={88} style={{ color: '#f43f5e' }} />
          }
        </div>

        {/* Streak badge */}
        {correct && streak >= 2 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#b45309',
            borderRadius: '999px',
            padding: '5px 14px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '10px',
          }}>
            <span>🔥</span>
            <span>{streak} in a row!</span>
            {streakBonus > 0 && <span style={{ opacity: 0.85 }}>(+{streakBonus} bonus)</span>}
          </div>
        )}

        {/* Correct / Wrong */}
        <h1
          className="font-display"
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            margin: '0 0 6px',
            color: correct ? 'var(--opt-green)' : 'var(--opt-red)',
          }}
        >
          {correct ? 'Correct!' : 'Wrong!'}
        </h1>

        {/* Show correct answer if wrong */}
        {!correct && correctAnswerText && (
          <p style={{ color: 'var(--sqi-text-light)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 500 }}>
            Correct answer: <strong style={{ color: 'var(--sqi-text-dark)' }}>{correctAnswerText}</strong>
          </p>
        )}

        {/* Score card */}
        <div
          className="sqi-card"
          style={{ padding: '24px', marginBottom: '20px', marginTop: '12px' }}
        >
          {correct && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--sqi-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>
                Points earned
              </p>
              <p className="font-display" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--sqi-accent)', margin: 0 }}>
                +{(scoreGain || 0).toLocaleString()}
              </p>
            </div>
          )}

          <div style={{ borderTop: correct ? '1px solid var(--sqi-gray-border)' : 'none', paddingTop: correct ? '16px' : 0, display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--sqi-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>Total Score</p>
              <p className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--sqi-navy)', margin: 0 }}>
                {(totalScore || 0).toLocaleString()}
              </p>
            </div>
            <div style={{ borderLeft: '1px solid var(--sqi-gray-border)', paddingLeft: '20px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--sqi-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>Rank</p>
              <p className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--sqi-text-dark)', margin: 0 }}>
                #{rank || '—'}
              </p>
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--sqi-text-light)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '14px' }}>
          <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Waiting for next question…
        </p>

        <ReactionToolbar onReact={onReact} />
      </div>
    </div>
  );
}

// ── Game Over Screen ─────────────────────────────────────────
function GameOver({ finalData, nickname }) {
  const leaderboard = finalData?.leaderboard || [];
  const myEntry = leaderboard.find((p) => p.nickname === nickname);
  const myRank  = myEntry ? leaderboard.indexOf(myEntry) + 1 : null;

  const rankEmoji = myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎓';

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
        <div style={{ fontSize: '5rem', marginBottom: '12px', animation: 'float 3s ease-in-out infinite' }}>
          {rankEmoji}
        </div>

        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--sqi-navy)' }}>
          Game Over!
        </h1>
        <p style={{ color: 'var(--sqi-text-light)', margin: '0 0 24px', fontSize: '0.95rem' }}>
          Great job, <strong style={{ color: 'var(--sqi-text-dark)' }}>{nickname}</strong>!
        </p>

        {myEntry && (
          <div className="sqi-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--sqi-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontWeight: 600 }}>
              Final Score
            </p>
            <p className="font-display" style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--sqi-accent)', margin: '0 0 4px' }}>
              {myEntry.score.toLocaleString()}
            </p>
            <p style={{ color: 'var(--sqi-text-light)', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>
              {myRank <= 3 ? `🏆 ${['', '1st', '2nd', '3rd'][myRank]} Place!` : `Rank #${myRank}`}
            </p>
          </div>
        )}

        {/* Top 3 mini-leaderboard */}
        {leaderboard.length > 0 && (
          <div className="sqi-card" style={{ padding: '16px', textAlign: 'left' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sqi-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Top Players
            </p>
            {leaderboard.slice(0, 5).map((p, i) => (
              <div key={p.nickname} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 4px',
                borderBottom: i < 4 ? '1px solid var(--sqi-gray-border)' : 'none',
                background: p.nickname === nickname ? 'var(--sqi-gray-bg)' : 'transparent',
                borderRadius: '8px',
              }}>
                <span style={{ width: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: '0.9rem',
                  fontWeight: p.nickname === nickname ? 700 : 500,
                  color: p.nickname === nickname ? 'var(--sqi-accent)' : 'var(--sqi-text-dark)',
                }}>
                  {p.nickname}
                </span>
                <span className="font-display" style={{ fontWeight: 700, color: 'var(--sqi-navy)', fontSize: '0.95rem' }}>
                  {p.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <ReactionToolbar onReact={onReact} />
        </div>
      </div>
    </div>
  );
}

// ── Exports ──────────────────────────────────────────────────
export default function PlayerResult({ resultData, isGameOver, finalData, nickname, onReact }) {
  if (isGameOver) {
    return <GameOver finalData={finalData} nickname={nickname} onReact={onReact} />;
  }
  return <QuestionResult resultData={resultData} onReact={onReact} />;
}
