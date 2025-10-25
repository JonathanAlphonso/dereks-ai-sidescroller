import { describe, expect, it } from 'vitest';
import { computeDescendingRadii, drawGlowTexture } from '../src/util/TextureUtils.js';

class MockGraphics {
  constructor() {
    this.calls = [];
    this.generated = null;
    this.currentFill = null;
  }

  fillStyle(color, alpha) {
    this.currentFill = { color, alpha };
  }

  fillCircle(x, y, radius) {
    this.calls.push({ x, y, radius, fill: this.currentFill });
  }

  generateTexture(key, width, height) {
    this.generated = { key, width, height };
  }
}

describe('computeDescendingRadii', () => {
  it('produces only positive radii and stops before zero', () => {
    const radii = computeDescendingRadii(32, 3, 12);
    expect(radii).toEqual([32, 29, 26, 23, 20, 17, 14, 11, 8, 5, 2]);
    expect(radii.every((value) => value > 0)).toBe(true);
  });

  it('returns an empty array when steps or decrement are invalid', () => {
    expect(computeDescendingRadii(32, 0, 10)).toEqual([]);
    expect(computeDescendingRadii(32, 5, 0)).toEqual([]);
  });
});

describe('drawGlowTexture', () => {
  it('draws concentric circles without using non-positive radii', () => {
    const graphics = new MockGraphics();
    const ringsDrawn = drawGlowTexture(graphics, {
      key: 'player-glow',
      width: 64,
      height: 64,
      centerX: 32,
      centerY: 32,
      color: 0x58d6ff,
      baseRadius: 32,
      radiusStep: 3,
      steps: 12,
      alphaStart: 0.25,
      alphaStep: 0.02,
    });

    expect(ringsDrawn).toBe(11);
    expect(graphics.calls).toHaveLength(11);
    expect(graphics.calls.every((call) => call.radius > 0)).toBe(true);
    expect(graphics.generated).toEqual({ key: 'player-glow', width: 64, height: 64 });
  });
});
