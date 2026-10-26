import { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';

export default function QRCode({ value, size = 130 }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!value) return;
    QRCodeLib.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#0a1128', // SQI Deep Navy
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '8px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      <img
        src={dataUrl}
        alt="Scan to join"
        width={size}
        height={size}
        style={{ display: 'block', borderRadius: '4px' }}
      />
    </div>
  );
}
