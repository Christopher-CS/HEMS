import { hslToHex, kelvinToHex, HUE_STRIP_SEGMENTS } from './color';

describe('color helpers', () => {
  it('hslToHex produces canonical primaries', () => {
    expect(hslToHex(0, 100, 50).toLowerCase()).toBe('#ff0000');
    expect(hslToHex(120, 100, 50).toLowerCase()).toBe('#00ff00');
    expect(hslToHex(240, 100, 50).toLowerCase()).toBe('#0000ff');
  });

  it('hslToHex wraps hue values larger than 360', () => {
    expect(hslToHex(360, 100, 50)).toBe(hslToHex(0, 100, 50));
    expect(hslToHex(720 + 120, 100, 50)).toBe(hslToHex(120, 100, 50));
  });

  it('kelvinToHex returns warm tones for low K and cool tones for high K', () => {
    const warm = kelvinToHex(2700);
    const cool = kelvinToHex(6500);
    expect(warm).not.toBe(cool);
    expect(warm.startsWith('#ff')).toBe(true);
    expect(cool.toLowerCase()).toMatch(/^#[a-f0-9]{6}$/);
  });

  it('exports a non-empty rainbow strip', () => {
    expect(HUE_STRIP_SEGMENTS.length).toBeGreaterThan(0);
    HUE_STRIP_SEGMENTS.forEach((c) => expect(c).toMatch(/^#[a-f0-9]{6}$/i));
  });
});
