import { describe, expect, it } from 'vitest';
import { computeKnockbackVector } from '../src/util/CombatMath.js';

describe('computeKnockbackVector', () => {
  const attacker = { x: 100, y: 200, facing: 1 };
  const target = { x: 200, y: 200 };

  it('returns horizontal knockback respecting facing', () => {
    const result = computeKnockbackVector({ knockback: 220, angle: 0 }, { ...attacker, facing: -1 }, target);
    expect(result.x).toBeCloseTo(-220, 5);
    expect(result.y).toBeCloseTo(0, 5);
  });

  it('returns upward knockback for uppercut', () => {
    const result = computeKnockbackVector({ knockback: 320, angle: -90 }, attacker, target);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(-320, 5);
  });

  it('returns downward knockback for spike attacks', () => {
    const result = computeKnockbackVector({ knockback: 340, angle: 90 }, attacker, target);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(340, 5);
  });

  it('returns diagonal knockback for launcher style attacks', () => {
    const result = computeKnockbackVector({ knockback: 260, angle: -45 }, attacker, target);
    const component = 260 / Math.sqrt(2);
    expect(result.x).toBeCloseTo(component, 5);
    expect(result.y).toBeCloseTo(-component, 5);
  });

  it('returns radial knockback for shockwave effects', () => {
    const shockResult = computeKnockbackVector({ knockback: 400, radius: 160, angle: null }, attacker, { x: 80, y: 240 });
    // Expected direction vector is (-20, 40) normalised
    const expectedMagnitude = Math.sqrt((-20) ** 2 + 40 ** 2);
    const expectedX = (-20 / expectedMagnitude) * 400;
    const expectedY = (40 / expectedMagnitude) * 400;
    expect(shockResult.x).toBeCloseTo(expectedX, 5);
    expect(shockResult.y).toBeCloseTo(expectedY, 5);
  });

  it('falls back to facing direction when attacker and target share a position', () => {
    const result = computeKnockbackVector({ knockback: 180, radius: 120, angle: null }, attacker, attacker);
    expect(Number.isFinite(result.x)).toBe(true);
    expect(Number.isFinite(result.y)).toBe(true);
    expect(Math.hypot(result.x, result.y)).toBeCloseTo(180, 5);
  });

  it('returns a zero vector when magnitude is zero', () => {
    const result = computeKnockbackVector({ knockback: 0, angle: 0 }, attacker, target);
    expect(result).toEqual({ x: 0, y: 0 });
  });
});
