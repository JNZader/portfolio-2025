import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 64,
        background: 'linear-gradient(to bottom right, #1e40af, #7c3aed)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        padding: '40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div>Javier Zader</div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>Backend Java Developer</div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
