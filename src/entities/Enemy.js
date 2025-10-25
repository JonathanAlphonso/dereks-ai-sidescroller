import Character from './Character.js';
import AttackManager from '../combat/AttackManager.js';

const PhaserRef = window.Phaser;

export default class Enemy extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, 38, 62, 0xff6b6b, {
      maxHealth: 60,
      impactScale: 0.04,
      knockbackResistance: 0.05,
    });

    this.setStrokeStyle(2, 0xffc7c7, 0.8);
    this.setDepth(12);

    this.body.setSize(38, 62);
    this.body.setOffset(-19, -31);
    this.body.setBounce(0.05);

    this.speed = 180;
    this.jumpVelocity = -420;
    this.attackRange = 70;
    this.aggroRadius = 700;
    this.attackCooldown = 600;
    this.attackTimer = 0;

    this.target = null;
    this.attackManager = new AttackManager(scene, this, scene.enemyAttacks, ['enemySwipe']);

    this.glowParticles = scene.add.particles('enemy-glow');
    this.glowParticles.setDepth(11);
    this.glowEmitter = this.glowParticles.createEmitter({
      speedX: { min: -25, max: 25 },
      speedY: { min: -25, max: 25 },
      scale: { start: 0.55, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 360,
      frequency: 60,
      blendMode: 'ADD',
    });
    this.glowEmitter.startFollow(this, 0, 22);
  }

  setTarget(target) {
    this.target = target;
  }

  updateCharacter(time, delta) {
    if (this.isDead) return;
    const body = this.body;

    if (this.stunTimer > 0) {
      body.setAccelerationX(0);
      return;
    }

    if (!this.target || this.target.isDead) {
      return;
    }

    const distance = PhaserRef.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    if (distance > this.aggroRadius) {
      body.setVelocityX(body.velocity.x * 0.9);
      return;
    }

    const dir = Math.sign(this.target.x - this.x) || 1;
    this.facing = dir;
    body.setVelocityX(dir * this.speed);

    if (this.target.y + 40 < this.y && body.onFloor()) {
      body.setVelocityY(this.jumpVelocity);
    }

    this.attackTimer = Math.max(0, this.attackTimer - delta);
    if (distance <= this.attackRange && this.attackTimer === 0) {
      const attack = this.attackManager.perform('enemySwipe');
      if (attack) {
        this.attackTimer = this.attackCooldown;
      }
    }
  }

  die() {
    if (this.glowParticles) {
      this.glowParticles.destroy();
      this.glowParticles = null;
      this.glowEmitter = null;
    }
    super.die();
  }
}
