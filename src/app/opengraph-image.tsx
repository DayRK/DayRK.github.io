import { ImageResponse } from 'next/og';

// Shown when the site is shared on Facebook, Messenger, X, LinkedIn, etc.
export const alt = 'Jan Patrick Bejare — Full Stack Web Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #030711 0%, #160d24 55%, #2a1145 100%)',
          color: '#f5f3ff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: '#c4b5fd', textTransform: 'uppercase' }}>
          Portfolio
        </div>
        <div style={{ marginTop: 24, fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
          Jan Patrick Bejare
        </div>
        <div style={{ marginTop: 20, fontSize: 34, color: '#a5b4fc' }}>
          Full Stack Web Application Developer
        </div>
      </div>
    ),
    { ...size }
  );
}
