import AttackHitbox from './AttackHitbox.js';
import { ATTACK_DEFINITIONS } from './AttackDefinitions.js';

const PhaserRef = window.Phaser;

export default class AttackManager {
  constructor(scene, owner, attackGroup, available = []) {
    this.scene = scene;
    this.owner = owner;
    this.attackGroup = attackGroup;
    this.availableAttacks = available;
    this.cooldownTimer = 0;
    this.cooldown = 120;
    scene.events.on('update', this.update, this);
  }

  update(time, delta) {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer = Math.max(0, this.cooldownTimer - delta);
    }
  }

  perform(name) {
    if (this.cooldownTimer > 0) {
      return null;
    }
    if (!this.availableAttacks.includes(name)) {
      return null;
    }
    const definition = ATTACK_DEFINITIONS[name];
    if (!definition) {
      return null;
    }

    const attack = new AttackHitbox(this.scene, this.owner, definition);
    this.attackGroup.add(attack);
    attack.refreshPosition();
    this.cooldownTimer = this.cooldown;
    return attack;
  }

  static knockbackVector(definition, attacker, target) {
    const magnitude = definition.knockback ?? 150;
    if (definition.radius && !definition.angle) {
      const dir = new PhaserRef.Math.Vector2(target.x - attacker.x, target.y - attacker.y);
      if (dir.lengthSq() === 0) {
        dir.set(1, -0.2);
      }
      dir.normalize();
      return dir.scale(magnitude);
    }

    const angle = PhaserRef.Math.DegToRad(definition.angle ?? 0);
    const directionX = definition.angle === null ? 0 : Math.cos(angle);
    const directionY = definition.angle === null ? 0 : Math.sin(angle);
    const vector = new PhaserRef.Math.Vector2(directionX, directionY);
    if (!definition.radius) {
      vector.x *= attacker.facing;
    }
    if (definition.angle === 90 || definition.angle === -90) {
      vector.x = 0;
      vector.y = definition.angle < 0 ? -1 : 1;
    }
    if (definition.angle === 0) {
      vector.y = 0;
      vector.x = attacker.facing;
    }
    if (definition.angle === -45 || definition.angle === 45) {
      vector.setToPolar(angle, 1);
      vector.x *= attacker.facing;
    }
    if (vector.lengthSq() === 0) {
      vector.set(attacker.facing, -0.1);
    }
    return vector.normalize().scale(magnitude);
  }
}
