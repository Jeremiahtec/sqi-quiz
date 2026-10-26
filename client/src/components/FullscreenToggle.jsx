import { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export default function FullscreenToggle({ style = {} }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen TV Mode'}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        padding: '6px 10px',
        cursor: 'pointer',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8rem',
        fontWeight: 600,
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
      <span>{isFullscreen ? 'Exit' : 'Full TV'}</span>
    </button>
  );
}
