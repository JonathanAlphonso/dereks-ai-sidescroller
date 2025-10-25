const PhaserRef = window.Phaser;

export default class Character extends PhaserRef.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, color, config = {}) {
    super(scene, x, y, width, height, color);
    this.scene = scene;
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
    if (this.invulnerableTimer > 0 || this.isDead) {
      return;
    }
    this.health = Math.max(0, this.health - amount);
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
    this.isDead = true;
    this.body.enable = false;
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

    if ((body.blocked.down || body.touching.down) && Math.abs(prevVel.y) > 250 && Math.abs(body.velocity.y) < 40) {
      this.takeDamage(Math.abs(prevVel.y) * this.impactScale);
    }

    if ((body.blocked.left || body.blocked.right || body.touching.left || body.touching.right) && Math.abs(prevVel.x) > 250 && Math.abs(body.velocity.x) < 40) {
      this.takeDamage(Math.abs(prevVel.x) * this.impactScale);
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
