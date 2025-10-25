import AttackHitbox from './AttackHitbox.js';
import { ATTACK_DEFINITIONS } from './AttackDefinitions.js';
import { computeKnockbackVector } from '../util/CombatMath.js';

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
    const knockback = computeKnockbackVector(definition, attacker, target);
    return new PhaserRef.Math.Vector2(knockback.x, knockback.y);
  }
}
