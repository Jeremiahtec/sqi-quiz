/**
 * PinDisplay.jsx
 * Renders the 6-digit game PIN with visual flair.
 */
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function PinDisplay({ pin }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const digits = (pin || '------').split('');

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '12px',
      }}>
        Game PIN
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {/* Digit blocks */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {digits.map((d, i) => (
            <span
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '80px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                fontSize: '2.5rem',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.02em',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          title="Copy PIN"
          style={{
            marginLeft: '8px',
            background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '10px',
            padding: '10px',
            cursor: 'pointer',
            color: copied ? '#22c55e' : 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>

      <p style={{
        marginTop: '10px',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.4)',
      }}>
        sqi-quiz.local · Join at the URL shown on screen
      </p>
    </div>
  );
}
