import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isMuted, toggleMuted } from '../utils/soundEffects';

export default function SoundToggle({ style = {} }) {
  const [muted, setMutedState] = useState(isMuted());

  const handleToggle = () => {
    const next = toggleMuted();
    setMutedState(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={muted ? 'Unmute Sound' : 'Mute Sound'}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        padding: '6px 10px',
        cursor: 'pointer',
        color: muted ? 'rgba(255, 255, 255, 0.4)' : '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8rem',
        fontWeight: 600,
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      <span>{muted ? 'Muted' : 'Sound'}</span>
    </button>
  );
}
