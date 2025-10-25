export function computeDescendingRadii(baseRadius, decrement, steps) {
  const radii = [];
  if (steps <= 0 || decrement <= 0) {
    return radii;
  }
  for (let i = 0; i < steps; i += 1) {
    const radius = baseRadius - decrement * i;
    if (radius <= 0) {
      break;
    }
    radii.push(radius);
  }
  return radii;
}

export function drawGlowTexture(graphics, {
  key,
  width,
  height,
  centerX,
  centerY,
  color,
  baseRadius,
  radiusStep,
  steps,
  alphaStart,
  alphaStep,
}) {
  const radii = computeDescendingRadii(baseRadius, radiusStep, steps);
  radii.forEach((radius, index) => {
    const alpha = Math.max(0, alphaStart - alphaStep * index);
    if (alpha <= 0) {
      return;
    }
    graphics.fillStyle(color, alpha);
    graphics.fillCircle(centerX, centerY, radius);
  });
  graphics.generateTexture(key, width, height);
  return radii.length;
}
