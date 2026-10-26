/**
 * PinDisplay.jsx
 * Responsive, high-impact 6-digit game PIN showcase with smooth copy feedback.
 */
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function PinDisplay({ pin }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!pin) return;
    navigator.clipboard.writeText(pin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const digits = (pin || '------').split('');

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: '440px' }}>
      <p
        style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '10px',
        }}
      >
        Game PIN
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
        }}
      >
        {/* Digit blocks */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {digits.map((d, i) => (
            <span
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'clamp(40px, 4.8vw, 56px)',
                height: 'clamp(54px, 6.5vw, 70px)',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.04) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '12px',
                fontSize: 'clamp(1.7rem, 2.6vw, 2.2rem)',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                userSelect: 'none',
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
          type="button"
          style={{
            background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '10px',
            padding: '10px',
            cursor: 'pointer',
            color: copied ? '#34d399' : 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!copied) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            if (!copied) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <p
        style={{
          marginTop: '10px',
          fontSize: '0.78rem',
          color: 'rgba(255, 255, 255, 0.45)',
          margin: '10px 0 0',
        }}
      >
        Join at <span style={{ color: '#60a5fa', fontWeight: 600 }}>sqi-quiz.onrender.com</span>
      </p>
    </div>
  );
}
