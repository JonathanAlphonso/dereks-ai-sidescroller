function isFiniteNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

export function computeRelativeSpeed(valueA, valueB) {
  const safeA = isFiniteNumber(valueA);
  const safeB = isFiniteNumber(valueB);
  return Math.abs(safeA - safeB);
}

export function sanitizeDamageAmount(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return amount;
}

export function calculateImpactDamage({
  prevVelocity,
  currentVelocity,
  collisions,
  impactScale,
  thresholds = {},
}) {
  const verticalThreshold = thresholds.vertical ?? 250;
  const horizontalThreshold = thresholds.horizontal ?? 250;
  const stopThreshold = thresholds.stop ?? 40;

  const previousX = isFiniteNumber(prevVelocity?.x);
  const previousY = isFiniteNumber(prevVelocity?.y);
  const currentX = isFiniteNumber(currentVelocity?.x);
  const currentY = isFiniteNumber(currentVelocity?.y);

  const verticalDamage =
    collisions.down &&
    Math.abs(previousY) > verticalThreshold &&
    Math.abs(currentY) < stopThreshold
      ? sanitizeDamageAmount(Math.abs(previousY) * impactScale)
      : 0;

  const horizontalDamage =
    collisions.side &&
    Math.abs(previousX) > horizontalThreshold &&
    Math.abs(currentX) < stopThreshold
      ? sanitizeDamageAmount(Math.abs(previousX) * impactScale)
      : 0;

  return { verticalDamage, horizontalDamage };
}
