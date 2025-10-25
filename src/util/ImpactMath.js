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

  const verticalDamage =
    collisions.down &&
    Math.abs(prevVelocity.y) > verticalThreshold &&
    Math.abs(currentVelocity.y) < stopThreshold
      ? Math.abs(prevVelocity.y) * impactScale
      : 0;

  const horizontalDamage =
    collisions.side &&
    Math.abs(prevVelocity.x) > horizontalThreshold &&
    Math.abs(currentVelocity.x) < stopThreshold
      ? Math.abs(prevVelocity.x) * impactScale
      : 0;

  return { verticalDamage, horizontalDamage };
}
