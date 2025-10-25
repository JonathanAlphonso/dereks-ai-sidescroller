import Character from './Character.js';
import AttackManager from '../combat/AttackManager.js';

const PhaserRef = window.Phaser;

export default class Player extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, 40, 70, 0x58d6ff, {
      maxHealth: 120,
      impactScale: 0.06,
      knockbackResistance: 0.2,
    });

    this.setStrokeStyle(3, 0x9deaff, 0.9);
    this.setDepth(15);

    this.body.setSize(40, 70);
    this.body.setOffset(-20, -35);
    this.body.setBounce(0.05);

    this.speed = 280;
    this.jumpVelocity = -450;
    this.airControl = 200;
    this.groundPounding = false;
    this.attackManager = new AttackManager(scene, this, scene.playerAttacks, ['jab', 'uppercut', 'spike', 'launcher', 'shockwave']);

    this.trailParticles = scene.add.particles('player-glow');
    this.trailParticles.setDepth(14);
    this.trailEmitter = this.trailParticles.createEmitter({
      speedX: { min: -40, max: 40 },
      speedY: { min: -40, max: 40 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 420,
      frequency: 28,
      blendMode: 'ADD',
    });
    this.trailEmitter.startFollow(this, 0, 24);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      left: PhaserRef.Input.Keyboard.KeyCodes.A,
      right: PhaserRef.Input.Keyboard.KeyCodes.D,
      up: PhaserRef.Input.Keyboard.KeyCodes.W,
      down: PhaserRef.Input.Keyboard.KeyCodes.S,
      jab: PhaserRef.Input.Keyboard.KeyCodes.J,
      uppercut: PhaserRef.Input.Keyboard.KeyCodes.K,
      spike: PhaserRef.Input.Keyboard.KeyCodes.L,
      launcher: PhaserRef.Input.Keyboard.KeyCodes.U,
    });

    this.jumpBuffer = 0;
    this.jumpBufferWindow = 180;
  }

  updateCharacter(time, delta) {
    const body = this.body;
    const dt = delta / 1000;

    if (this.stunTimer > 0) {
      body.setAccelerationX(0);
      return;
    }

    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const onFloor = body.onFloor();

    let move = 0;
    if (left) move -= 1;
    if (right) move += 1;

    if (move !== 0) {
      const velocityTarget = move * this.speed;
      const acceleration = onFloor ? 1400 : 900;
      const diff = velocityTarget - body.velocity.x;
      const deltaVel = PhaserRef.Math.Clamp(diff, -acceleration * dt, acceleration * dt);
      body.setVelocityX(body.velocity.x + deltaVel);
      this.facing = move;
    } else if (onFloor) {
      body.setVelocityX(body.velocity.x * 0.85);
    }

    if (PhaserRef.Input.Keyboard.JustDown(this.cursors.up) || PhaserRef.Input.Keyboard.JustDown(this.keys.up) || PhaserRef.Input.Keyboard.JustDown(this.cursors.space)) {
      this.jumpBuffer = this.jumpBufferWindow;
    } else {
      this.jumpBuffer = Math.max(0, this.jumpBuffer - delta);
    }

    if (this.jumpBuffer > 0 && onFloor) {
      body.setVelocityY(this.jumpVelocity);
      this.jumpBuffer = 0;
    }

    if (!onFloor && (this.cursors.down.isDown || this.keys.down.isDown) && !this.groundPounding) {
      this.activateGroundPound();
    }

    if (onFloor && this.groundPounding) {
      this.releaseShockwave();
    }

    this.handleAttacks();
    this.setFacingFromVelocity();
  }

  activateGroundPound() {
    this.groundPounding = true;
    this.body.setVelocityX(0);
    this.body.setVelocityY(600);
  }

  releaseShockwave() {
    this.groundPounding = false;
    const shockwave = this.attackManager.perform('shockwave');
    if (shockwave) {
      this.scene.sound.play('shockwave', { volume: 0.4 });
    }
  }

  handleAttacks() {
    if (this.stunTimer > 0) {
      return;
    }
    const keys = this.keys;
    if (PhaserRef.Input.Keyboard.JustDown(keys.jab)) {
      this.attackManager.perform('jab');
    }
    if (PhaserRef.Input.Keyboard.JustDown(keys.uppercut)) {
      this.attackManager.perform('uppercut');
    }
    if (PhaserRef.Input.Keyboard.JustDown(keys.spike)) {
      this.attackManager.perform('spike');
    }
    if (PhaserRef.Input.Keyboard.JustDown(keys.launcher)) {
      this.attackManager.perform('launcher');
    }
  }

  die() {
    if (this.trailParticles) {
      this.trailParticles.destroy();
      this.trailParticles = null;
      this.trailEmitter = null;
    }
    super.die();
  }
}
