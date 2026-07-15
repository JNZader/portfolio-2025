type Rgb = { r: number; g: number; b: number; a: number };

function parseNumber(value: string, percentScale = 1): number {
  const trimmed = value.trim();
  return trimmed.endsWith('%') ? (Number.parseFloat(trimmed) / 100) * percentScale : Number.parseFloat(trimmed);
}

function parseRgb(value: string): Rgb | undefined {
  const match = value.match(/^rgba?\(\s*([^,\s]+)[,\s]+([^,\s]+)[,\s]+([^,\s]+)(?:[,\s/]+([^,\s]+))?\s*\)$/i);
  if (!match) return undefined;
  return {
    r: parseNumber(match[1], 255),
    g: parseNumber(match[2], 255),
    b: parseNumber(match[3], 255),
    a: match[4] ? parseNumber(match[4]) : 1,
  };
}

function parseOklch(value: string): Rgb | undefined {
  const match = value.match(/^oklch\(\s*([^\s]+)[,\s]+([^\s]+)[,\s]+([^\s]+)(?:[,\s/]+([^\s]+))?\s*\)$/i);
  if (!match) return undefined;

  const lightness = parseNumber(match[1]);
  const chroma = parseNumber(match[2]);
  const hue = (parseNumber(match[3]) * Math.PI) / 180;
  const aLab = chroma * Math.cos(hue);
  const bLab = chroma * Math.sin(hue);
  const l = lightness + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const m = lightness - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const s = lightness - 0.0894841775 * aLab - 1.291485548 * bLab;
  const l3 = l ** 3;
  const m3 = m ** 3;
  const s3 = s ** 3;
  const linear = {
    r: 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    b: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  };
  const toSrgb = (channel: number) =>
    255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055);
  return { r: toSrgb(linear.r), g: toSrgb(linear.g), b: toSrgb(linear.b), a: match[4] ? parseNumber(match[4]) : 1 };
}

function parseOklab(value: string): Rgb | undefined {
  const match = value.match(/^oklab\(\s*([^\s]+)[,\s]+([^\s]+)[,\s]+([^\s]+)(?:[,\s/]+([^\s]+))?\s*\)$/i);
  if (!match) return undefined;
  const lightness = parseNumber(match[1]);
  const aLab = parseNumber(match[2]);
  const bLab = parseNumber(match[3]);
  const l = lightness + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const m = lightness - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const s = lightness - 0.0894841775 * aLab - 1.291485548 * bLab;
  const l3 = l ** 3;
  const m3 = m ** 3;
  const s3 = s ** 3;
  const toSrgb = (channel: number) =>
    255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055);
  return {
    r: toSrgb(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
    g: toSrgb(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
    b: toSrgb(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3),
    a: match[4] ? parseNumber(match[4]) : 1,
  };
}

function parseLab(value: string): Rgb | undefined {
  const match = value.match(/^lab\(\s*([^\s]+)[,\s]+([^\s]+)[,\s]+([^\s]+)(?:[,\s/]+([^\s]+))?\s*\)$/i);
  if (!match) return undefined;

  const lightness = parseNumber(match[1], 100);
  const aLab = parseNumber(match[2], 125);
  const bLab = parseNumber(match[3], 125);
  const fy = (lightness + 16) / 116;
  const fx = aLab / 500 + fy;
  const fz = fy - bLab / 200;
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;
  const f = (channel: number) => (channel ** 3 > epsilon ? channel ** 3 : (116 * channel - 16) / kappa);
  const xyzD50 = { x: 0.96422 * f(fx), y: 1 * f(fy), z: 0.82521 * f(fz) };
  const xyzD65 = {
    x: 0.9555766 * xyzD50.x - 0.0230393 * xyzD50.y + 0.0631636 * xyzD50.z,
    y: -0.0282895 * xyzD50.x + 1.0099416 * xyzD50.y + 0.0210077 * xyzD50.z,
    z: 0.0122982 * xyzD50.x - 0.020483 * xyzD50.y + 1.3299098 * xyzD50.z,
  };
  const linear = {
    r: 3.2404542 * xyzD65.x - 1.5371385 * xyzD65.y - 0.4985314 * xyzD65.z,
    g: -0.969266 * xyzD65.x + 1.8760108 * xyzD65.y + 0.041556 * xyzD65.z,
    b: 0.0556434 * xyzD65.x - 0.2040259 * xyzD65.y + 1.0572252 * xyzD65.z,
  };
  const toSrgb = (channel: number) =>
    255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055);
  return { r: toSrgb(linear.r), g: toSrgb(linear.g), b: toSrgb(linear.b), a: match[4] ? parseNumber(match[4]) : 1 };
}

function parseCssColor(value: string): Rgb {
  const color = parseRgb(value) ?? parseOklch(value) ?? parseOklab(value) ?? parseLab(value);
  if (!color || Object.values(color).some((channel) => Number.isNaN(channel))) {
    throw new Error(`Unable to resolve computed CSS color: ${value}`);
  }
  return color;
}

function composite(foreground: Rgb, background: Rgb): Rgb {
  const alpha = foreground.a + background.a * (1 - foreground.a);
  if (alpha === 0) throw new Error('Unable to resolve fully transparent computed colors');
  return {
    r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
    g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
    b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
    a: alpha,
  };
}

function luminance(color: Rgb): number {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

export function contrastRatio(foregroundValue: string, backgroundValue: string): number {
  const background = parseCssColor(backgroundValue);
  const foreground = composite(parseCssColor(foregroundValue), background);
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}
