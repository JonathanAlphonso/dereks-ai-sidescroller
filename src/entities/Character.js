import { calculateImpactDamage, sanitizeDamageAmount } from '../util/ImpactMath.js';

const PhaserRef = window.Phaser;

export default class Character extends PhaserRef.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, color, config = {}) {
    super(scene, x, y, width, height, color);
    this.scene = scene;
    this.setOrigin(0.5, 0.5);
    this.setDepth(10);
    this.setAlpha(0.95);
    this.setStrokeStyle(2, 0xffffff, 0.2);
    this.maxHealth = config.maxHealth ?? 100;
    this.health = this.maxHealth;
    this.stunTimer = 0;
    this.invulnerableTimer = 0;
    this.impactScale = config.impactScale ?? 0.05;
    this.knockbackResistance = config.knockbackResistance ?? 0;
    this.facing = 1;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    this.body.setDrag(1200, 0);
    this.body.setMaxVelocity(400, 900);

    this.prevVelocity = new PhaserRef.Math.Vector2();
    this.lastVelocity = new PhaserRef.Math.Vector2();
    this.lastImpactCheck = 0;

    this.isDead = false;

    scene.events.on('update', this.handleUpdate, this);
  }

  handleUpdate(time, delta) {
    if (this.isDead) {
      return;
    }
    this.updateCharacter(time, delta);
    this.applyImpactDamage(time);
    this.lastVelocity.copy(this.prevVelocity);
    this.prevVelocity.copy(this.body.velocity);
    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - delta);
    }
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - delta);
    }
  }

  // Placeholder for subclasses
  updateCharacter() {}

  takeDamage(amount) {
    const damage = sanitizeDamageAmount(amount);
    if (damage === 0 || this.invulnerableTimer > 0 || this.isDead) {
      return;
    }
    this.health = Math.max(0, this.health - damage);
    this.scene.events.emit('character-health-changed', this, this.health, this.maxHealth);
    if (this.health <= 0) {
      this.die();
    }
  }

  heal(amount) {
    this.health = PhaserRef.Math.Clamp(this.health + amount, 0, this.maxHealth);
    this.scene.events.emit('character-health-changed', this, this.health, this.maxHealth);
  }

  die() {
    if (this.isDead) {
      return;
    }
    this.isDead = true;
    this.body.enable = false;
    this.scene.events.emit('character-died', this);
    this.scene.time.addEvent({
      delay: 250,
      callback: () => this.destroy(),
    });
  }

  applyKnockback(vector, stun = 0) {
    const resistance = 1 - this.knockbackResistance;
    this.body.setVelocity(vector.x * resistance, vector.y * resistance);
    if (stun > 0) {
      this.stunTimer = Math.max(this.stunTimer, stun);
    }
  }

  applyImpactDamage(time) {
    if (time === this.lastImpactCheck) {
      return;
    }
    this.lastImpactCheck = time;
    const body = this.body;
    const prevVel = this.lastVelocity;

    const collisions = {
      down: body.blocked.down || body.touching.down,
      side:
        body.blocked.left ||
        body.blocked.right ||
        body.touching.left ||
        body.touching.right,
    };

    const { verticalDamage, horizontalDamage } = calculateImpactDamage({
      prevVelocity: prevVel,
      currentVelocity: body.velocity,
      collisions,
      impactScale: this.impactScale,
    });

    if (verticalDamage > 0) {
      this.takeDamage(verticalDamage);
    }

    if (horizontalDamage > 0) {
      this.takeDamage(horizontalDamage);
    }
  }

  setFacingFromVelocity() {
    if (this.body.velocity.x > 10) {
      this.facing = 1;
    } else if (this.body.velocity.x < -10) {
      this.facing = -1;
    }
  }
}
