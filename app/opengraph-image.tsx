import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Brand gradient stops — exact `--primary` → `--tertiary` oklch tokens from the
// portfolio design system (tokens.md). Satori (next/og) cannot read CSS vars or
// consume `next/font`, so we inline the token's oklch directly; it parses
// oklch inside `linear-gradient` (verified). Solid `oklch()` color values are
// NOT supported by Satori, hence the gradient-only usage below.
const BRAND_GRADIENT = 'linear-gradient(to bottom right, oklch(50% 0.2 250), oklch(55% 0.2 300))';

// Highlight gradient for the JZ monogram: white → pale tertiary tint. The OG
// background already carries the full `--primary`→`--tertiary` brand gradient, so
// the mark uses a lighter gradient to stay legible (a same-hue gradient would
// blend into the background). Hue is derived from the brand tertiary token.
const MARK_GRADIENT = 'linear-gradient(to bottom right, oklch(99% 0 0), oklch(88% 0.07 300))';

// Image generation
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND_GRADIENT,
        color: 'white',
        padding: '40px',
        gap: '24px',
      }}
    >
      {/* JZ monogram — gradient-clipped text (Satori supports background-clip:text) */}
      <div
        style={{
          fontSize: 200,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: MARK_GRADIENT,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        JZ
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.02em' }}>Javier Zader</div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>Backend Developer · Sistemas end-to-end</div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
