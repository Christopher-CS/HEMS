// Lightweight color helpers used by the device detail modal. Kept pure so it
// can be tested without React Native.

const toHex = (value: number) => {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return clamped.toString(16).padStart(2, '0');
};

export function hslToHex(hue: number, saturation: number, lightness: number = 50): string {
  const h = ((hue % 360) + 360) % 360;
  const s = Math.max(0, Math.min(100, saturation)) / 100;
  const l = Math.max(0, Math.min(100, lightness)) / 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return `#${toHex(f(0) * 255)}${toHex(f(8) * 255)}${toHex(f(4) * 255)}`;
}

// Approximate a color temperature in Kelvin to a warm/cool tinted swatch.
// Returns a hex string useful as a preview swatch (not a full blackbody curve).
export function kelvinToHex(kelvin: number): string {
  const k = Math.max(2700, Math.min(6500, kelvin));
  const t = (k - 2700) / (6500 - 2700); // 0 warm -> 1 cool

  // Warm: ~#FFB266, neutral midpoint: ~#FFE6CC, cool: ~#C9DEFF
  const warm = { r: 255, g: 178, b: 102 };
  const cool = { r: 201, g: 222, b: 255 };

  const r = warm.r + (cool.r - warm.r) * t;
  const g = warm.g + (cool.g - warm.g) * t;
  const b = warm.b + (cool.b - warm.b) * t;

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const HUE_SWATCHES: number[] = [0, 30, 60, 120, 180, 210, 270, 300, 330];

// Snapshot of evenly-spaced hue swatches for the rainbow strip background.
export const HUE_STRIP_SEGMENTS: string[] = Array.from({ length: 24 }, (_, i) =>
  hslToHex(i * 15, 90, 55)
);
