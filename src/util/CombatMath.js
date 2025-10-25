const DEFAULT_KNOCKBACK = 150;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function normalizeVector(x, y, fallback = { x: 1, y: 0 }) {
  let lengthSq = x * x + y * y;
  if (lengthSq === 0) {
    x = fallback.x;
    y = fallback.y;
    lengthSq = x * x + y * y;
  }
  const length = Math.sqrt(lengthSq);
  if (length === 0) {
    return { x: 1, y: 0 };
  }
  return { x: x / length, y: y / length };
}

function scaleVector(x, y, magnitude) {
  return { x: x * magnitude, y: y * magnitude };
}

export function computeKnockbackVector(definition, attacker, target) {
  const magnitude = definition.knockback ?? DEFAULT_KNOCKBACK;
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  const attackerPos = attacker ?? { x: 0, y: 0, facing: 1 };
  const targetPos = target ?? { x: 0, y: 0 };
  const facing = typeof attackerPos.facing === 'number' && attackerPos.facing !== 0 ? attackerPos.facing : 1;

  if (definition.radius && (definition.angle === undefined || definition.angle === null)) {
    const dx = targetPos.x - attackerPos.x;
    const dy = targetPos.y - attackerPos.y;
    const normalized = normalizeVector(dx, dy, { x: facing, y: -0.2 });
    return scaleVector(normalized.x, normalized.y, magnitude);
  }

  const angleDegrees = typeof definition.angle === 'number' ? definition.angle : 0;
  const angle = toRadians(angleDegrees);

  let vx = Math.cos(angle);
  let vy = Math.sin(angle);

  if (angleDegrees === 90) {
    vx = 0;
    vy = 1;
  } else if (angleDegrees === -90) {
    vx = 0;
    vy = -1;
  } else if (angleDegrees === 0) {
    vx = facing;
    vy = 0;
  } else {
    vx *= facing;
  }

  const fallback = { x: facing, y: -0.1 };
  const normalized = normalizeVector(vx, vy, fallback);
  return scaleVector(normalized.x, normalized.y, magnitude);
}
