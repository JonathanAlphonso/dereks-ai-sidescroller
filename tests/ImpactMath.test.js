import { describe, expect, it } from 'vitest';
import { calculateImpactDamage } from '../src/util/ImpactMath.js';

describe('calculateImpactDamage', () => {
  const impactScale = 0.05;

  it('returns vertical damage when falling fast and stopping on the ground', () => {
    const result = calculateImpactDamage({
      prevVelocity: { x: 0, y: -600 },
      currentVelocity: { x: 0, y: 10 },
      collisions: { down: true, side: false },
      impactScale,
    });
    expect(result.verticalDamage).toBeCloseTo(600 * impactScale, 5);
    expect(result.horizontalDamage).toBe(0);
  });

  it('returns horizontal damage when slamming into a wall', () => {
    const result = calculateImpactDamage({
      prevVelocity: { x: 520, y: 0 },
      currentVelocity: { x: 10, y: 0 },
      collisions: { down: false, side: true },
      impactScale,
    });
    expect(result.horizontalDamage).toBeCloseTo(520 * impactScale, 5);
    expect(result.verticalDamage).toBe(0);
  });

  it('applies both vertical and horizontal damage when both collisions occur', () => {
    const result = calculateImpactDamage({
      prevVelocity: { x: -520, y: -540 },
      currentVelocity: { x: 10, y: 10 },
      collisions: { down: true, side: true },
      impactScale,
    });
    expect(result.verticalDamage).toBeCloseTo(540 * impactScale, 5);
    expect(result.horizontalDamage).toBeCloseTo(520 * impactScale, 5);
  });

  it('returns zero damage when thresholds are not met', () => {
    const result = calculateImpactDamage({
      prevVelocity: { x: 100, y: 120 },
      currentVelocity: { x: 20, y: 30 },
      collisions: { down: true, side: true },
      impactScale,
    });
    expect(result.verticalDamage).toBe(0);
    expect(result.horizontalDamage).toBe(0);
  });
});
