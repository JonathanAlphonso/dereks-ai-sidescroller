import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import { generatePlatforms } from '../util/PlatformGenerator.js';
import AttackManager from '../combat/AttackManager.js';
import { drawGlowTexture } from '../util/TextureUtils.js';
import { computeRelativeSpeed } from '../util/ImpactMath.js';

const PhaserRef = window.Phaser;

export default class GameScene extends PhaserRef.Scene {
  constructor() {
    super('GameScene');
    this.waveNumber = 0;
    this.gameOver = false;
  }

  preload() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const viewWidth = 960;
    const viewHeight = 540;

    graphics.fillGradientStyle(0x12092f, 0x28105c, 0x05020f, 0x0a0420, 1, 1, 1, 1);
    graphics.fillRect(0, 0, viewWidth, viewHeight);
    graphics.generateTexture('bg-sky', viewWidth, viewHeight);

    graphics.clear();
    graphics.fillStyle(0xffffff, 0.05);
    for (let i = 0; i < 140; i++) {
      const starX = PhaserRef.Math.Between(0, viewWidth);
      const starY = PhaserRef.Math.Between(0, viewHeight);
      const radius = PhaserRef.Math.Between(1, 2);
      graphics.fillCircle(starX, starY, radius);
    }
    graphics.generateTexture('bg-stars', viewWidth, viewHeight);

    graphics.clear();
    const auroraStart = { r: 88, g: 214, b: 255 };
    const auroraEnd = { r: 255, g: 121, b: 242 };
    for (let i = 0; i <= 6; i++) {
      const colorStep = PhaserRef.Display.Color.Interpolate.ColorWithColor(auroraStart, auroraEnd, 6, i);
      const colorValue = PhaserRef.Display.Color.GetColor(colorStep.r, colorStep.g, colorStep.b);
      const alpha = 0.28 - i * 0.03;
      graphics.fillStyle(colorValue, alpha);
      graphics.fillEllipse(256, 256, 540 - i * 48, 340 - i * 28);
    }
    graphics.generateTexture('bg-aurora', 512, 512);

    graphics.clear();
    for (let i = 0; i < 9; i++) {
      const radius = 250 - i * 28;
      const alpha = 0.18 - i * 0.015;
      const color = PhaserRef.Display.Color.GetColor(60 + i * 12, 48 + i * 10, 120 + i * 18);
      graphics.fillStyle(color, alpha);
      graphics.fillCircle(256, 256, radius);
    }
    graphics.generateTexture('bg-nebula', 512, 512);

    graphics.clear();
    for (let i = 0; i < 60; i++) {
      const w = PhaserRef.Math.Between(160, 420);
      const h = PhaserRef.Math.Between(40, 110);
      const x = PhaserRef.Math.Between(0, 512 - w);
      const y = PhaserRef.Math.Between(0, 256 - h);
      const alpha = PhaserRef.Math.FloatBetween(0.02, 0.08);
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillRoundedRect(x, y, w, h, PhaserRef.Math.Between(24, 60));
    }
    graphics.generateTexture('bg-mist', 512, 256);

    graphics.clear();
    graphics.fillGradientStyle(0x1f2a4d, 0x293a6d, 0x111831, 0x111831, 1, 1, 1, 1);
    graphics.fillRoundedRect(0, 0, 220, 48, 16);
    graphics.lineStyle(3, 0x67a6ff, 0.6);
    graphics.strokeRoundedRect(0, 0, 220, 48, 16);
    graphics.generateTexture('ground', 220, 48);

    graphics.clear();
    graphics.fillGradientStyle(0x1c2545, 0x27315b, 0x141c33, 0x0f1524, 1, 1, 1, 1);
    graphics.fillRoundedRect(0, 0, 180, 32, 12);
    graphics.lineStyle(2, 0x87c7ff, 0.5);
    graphics.strokeRoundedRect(0, 0, 180, 32, 12);
    graphics.generateTexture('platform', 180, 32);

    graphics.clear();
    for (let i = 0; i < 7; i++) {
      const alpha = 0.22 - i * 0.025;
      const color = PhaserRef.Display.Color.GetColor(255, 210 - i * 12, 132 + i * 10);
      graphics.fillStyle(color, alpha);
      graphics.fillCircle(30, 30, 30 - i * 4);
    }
    graphics.generateTexture('attack', 60, 60);

    graphics.clear();
    drawGlowTexture(graphics, {
      key: 'player-glow',
      width: 64,
      height: 64,
      centerX: 32,
      centerY: 32,
      color: 0x58d6ff,
      baseRadius: 32,
      radiusStep: 3,
      steps: 12,
      alphaStart: 0.25,
      alphaStep: 0.02,
    });

    graphics.clear();
    drawGlowTexture(graphics, {
      key: 'enemy-glow',
      width: 64,
      height: 64,
      centerX: 32,
      centerY: 32,
      color: 0xff7a7a,
      baseRadius: 32,
      radiusStep: 3,
      steps: 12,
      alphaStart: 0.28,
      alphaStep: 0.02,
    });

    graphics.clear();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 4);
    graphics.generateTexture('star', 16, 16);

    graphics.clear();
    graphics.fillStyle(0x0b1229, 0.82);
    graphics.fillRoundedRect(0, 0, 360, 50, 20);
    graphics.lineStyle(3, 0x3f8cff, 0.9);
    graphics.strokeRoundedRect(0, 0, 360, 50, 20);
    graphics.generateTexture('hud-panel', 360, 50);

    graphics.clear();
    graphics.fillStyle(0x16203e, 0.92);
    graphics.fillRoundedRect(0, 0, 160, 46, 16);
    graphics.lineStyle(2, 0x7b5cff, 0.8);
    graphics.strokeRoundedRect(0, 0, 160, 46, 16);
    graphics.generateTexture('hud-chip', 160, 46);

    graphics.clear();
    graphics.fillStyle(0x121027, 0.92);
    graphics.fillRoundedRect(0, 0, 420, 260, 32);
    graphics.lineStyle(4, 0x8f7bff, 0.9);
    graphics.strokeRoundedRect(0, 0, 420, 260, 32);
    graphics.generateTexture('ui-panel', 420, 260);

    graphics.clear();
    graphics.fillStyle(0x6f5bff, 1);
    graphics.fillRoundedRect(0, 0, 220, 62, 22);
    graphics.lineStyle(3, 0xffffff, 0.7);
    graphics.strokeRoundedRect(0, 0, 220, 62, 22);
    graphics.generateTexture('ui-button', 220, 62);

    graphics.destroy();

    this.load.audio('shockwave', 'https://assets.codepen.io/21542/explosion-08.mp3');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.waveNumber = 0;
    this.gameOver = false;

    this.cameras.main.fadeIn(400);

    this.createBackgroundLayers(width, height);
    this.createAmbientFX(width, height);

    this.platforms = this.physics.add.staticGroup();
    generatePlatforms(this, { width, height }, this.platforms);

    this.playerAttacks = this.physics.add.group({ classType: PhaserRef.GameObjects.GameObject, runChildUpdate: false });
    this.enemyAttacks = this.physics.add.group({ classType: PhaserRef.GameObjects.GameObject, runChildUpdate: false });

    this.player = new Player(this, width / 2, height / 2 - 120);

    this.enemies = this.add.group();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemyAttacks, this.platforms, (attack) => attack.destroy(), null, this);

    this.physics.add.collider(this.player, this.enemies, this.handlePlayerCollision, null, this);

    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.enemies);

    this.physics.add.overlap(this.playerAttacks, this.enemies, this.handleAttackHit, null, this);
    this.physics.add.overlap(this.enemyAttacks, this.player, this.handleEnemyAttackHit, null, this);

    this.createHUD();

    this.events.on('character-died', this.handleCharacterDeath, this);

    this.spawnTimer = this.time.addEvent({
      delay: 4500,
      loop: true,
      callback: this.spawnWave,
      callbackScope: this,
    });

    this.spawnWave();

    this.events.once(PhaserRef.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  update(time, delta) {
    if (this.nebulaLayer) {
      this.nebulaLayer.tilePositionX += 0.02 * delta;
      this.nebulaLayer.tilePositionY += 0.004 * delta;
    }
    if (this.mistLayer) {
      this.mistLayer.tilePositionX += 0.06 * delta;
    }
    if (this.aurora) {
      this.aurora.rotation = Math.sin(time * 0.0004) * 0.08;
      this.aurora.y = this.scale.height / 2 - 120 + Math.sin(time * 0.0007) * 12;
      this.aurora.alpha = 0.28 + Math.sin(time * 0.0012) * 0.06;
    }
  }

  handlePlayerCollision(player, enemy) {
    if (!enemy.active || enemy.isDead) {
      return;
    }
    const enemyVelocity = enemy?.body?.velocity?.x;
    const playerVelocity = player?.body?.velocity?.x;
    const impact = computeRelativeSpeed(enemyVelocity, playerVelocity);
    if (impact > 200) {
      player.takeDamage(impact * 0.04);
      enemy.takeDamage(impact * 0.02);
    }
  }

  handleAttackHit(attack, enemy) {
    if (!attack.active || !enemy.active || enemy.isDead) {
      return;
    }
    if (attack.hitTargets.has(enemy)) {
      return;
    }
    const definition = attack.definition;
    const knockback = AttackManager.knockbackVector(definition, attack.owner, enemy);
    enemy.takeDamage(definition.damage);
    enemy.applyKnockback(knockback, definition.stun);
    attack.hitTargets.add(enemy);
  }

  handleEnemyAttackHit(attack, player) {
    if (!attack.active || !player.active || player.isDead) {
      return;
    }
    if (attack.hitTargets.has(player)) {
      return;
    }
    const definition = attack.definition;
    const knockback = AttackManager.knockbackVector(definition, attack.owner, player);
    player.takeDamage(definition.damage);
    player.applyKnockback(knockback, definition.stun);
    attack.hitTargets.add(player);
  }

  spawnWave() {
    if (!this.player || this.player.isDead || this.gameOver) {
      return;
    }
    this.waveNumber += 1;
    const enemiesPerSide = Math.min(3 + Math.floor(this.waveNumber / 2), 6);
    const width = this.scale.width;
    const height = this.scale.height;

    const spawnY = height / 2 - 120;
    const spacingY = 40;

    for (let i = 0; i < enemiesPerSide; i++) {
      const leftEnemy = this.spawnEnemy(-60, spawnY + i * spacingY);
      const rightEnemy = this.spawnEnemy(width + 60, spawnY + i * spacingY);
      leftEnemy.body.setVelocityX(160);
      rightEnemy.body.setVelocityX(-160);
    }

    this.events.emit('wave-updated', this.waveNumber);
    this.pulseWaveText();
  }

  spawnEnemy(x, y) {
    const enemy = new Enemy(this, x, y);
    enemy.setTarget(this.player);
    this.enemies.add(enemy);
    this.physics.add.collider(enemy, this.platforms);
    return enemy;
  }

  createHUD() {
    const width = this.scale.width;
    this.hudPanel = this.add.image(width / 2, 34, 'hud-panel').setDepth(30);
    this.healthBarBack = this.add.rectangle(width / 2, 34, 300, 16, 0x081427, 0.8).setDepth(31);
    this.healthBar = this.add.rectangle(width / 2, 34, 300, 12, 0x33d0ff, 1).setDepth(32);
    this.healthHighlight = this.add.rectangle(width / 2, 30, 300, 6, 0xffffff, 0.35).setDepth(33);
    this.healthText = this.add.text(width / 2, 34, 'Health', {
      fontSize: '18px',
      fontFamily: '"Segoe UI", sans-serif',
      fontStyle: '600',
      color: '#dff7ff',
    }).setOrigin(0.5, 0.5).setDepth(34);

    this.wavePanel = this.add.image(width - 120, 34, 'hud-chip').setDepth(30);
    this.waveText = this.add.text(width - 120, 34, 'Wave 1', {
      fontSize: '18px',
      fontFamily: '"Segoe UI", sans-serif',
      fontStyle: '600',
      color: '#d9ccff',
    }).setOrigin(0.5, 0.5).setDepth(31);

    this.events.on('character-health-changed', this.updateHealthBar, this);
    this.events.on('wave-updated', this.updateWaveText, this);

    this.updateHealthBar(this.player, this.player.health, this.player.maxHealth);
  }

  updateHealthBar(character, health, maxHealth) {
    if (character !== this.player) {
      return;
    }
    const pct = PhaserRef.Math.Clamp(health / maxHealth, 0, 1);
    const width = 300 * pct;
    this.healthBar.width = width;
    this.healthHighlight.width = width;
    this.healthText.setText(`Health: ${Math.ceil(health)} / ${maxHealth}`);
  }

  updateWaveText(waveNumber) {
    this.waveText.setText(`Wave ${waveNumber}`);
  }

  pulseWaveText() {
    if (!this.waveText || !this.wavePanel) {
      return;
    }
    this.tweens.add({
      targets: [this.waveText, this.wavePanel],
      scale: { from: 1, to: 1.12 },
      duration: 240,
      ease: 'Sine.easeInOut',
      yoyo: true,
    });
  }

  createBackgroundLayers(width, height) {
    this.add.image(width / 2, height / 2, 'bg-sky').setDisplaySize(width, height).setDepth(-30);
    this.add.image(width / 2, height / 2, 'bg-stars').setDisplaySize(width, height).setDepth(-29).setAlpha(0.6);
    this.nebulaLayer = this.add.tileSprite(width / 2, height / 2, width * 1.2, height * 1.2, 'bg-nebula')
      .setDepth(-27)
      .setAlpha(0.28)
      .setBlendMode(PhaserRef.BlendModes.ADD);
    this.aurora = this.add.image(width / 2, height / 2 - 120, 'bg-aurora')
      .setDepth(-26)
      .setScale(1.35)
      .setBlendMode(PhaserRef.BlendModes.ADD)
      .setAlpha(0.32);
    this.mistLayer = this.add.tileSprite(width / 2, height - 80, width * 1.4, 260, 'bg-mist')
      .setDepth(-6)
      .setAlpha(0.35);
    this.add.rectangle(width / 2, height - 32, width * 1.2, 120, 0x05060f, 0.65).setDepth(-5);
  }

  createAmbientFX(width, height) {
    this.starfield = this.add.particles('star');
    this.starfield.setDepth(-28);
    this.starfieldEmitter = this.starfield.createEmitter({
      x: { min: 0, max: width },
      y: { min: 0, max: height / 2 },
      speedX: { min: -10, max: 10 },
      speedY: { min: 6, max: 18 },
      lifespan: 4200,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      quantity: 2,
      blendMode: 'ADD',
    });

    this.groundGlow = this.add.particles('player-glow');
    this.groundGlow.setDepth(-4);
    this.groundGlowEmitter = this.groundGlow.createEmitter({
      x: { min: 0, max: width },
      y: height - 60,
      speedX: { min: -12, max: 12 },
      speedY: { min: -40, max: -10 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.25, end: 0 },
      lifespan: 3200,
      quantity: 1,
      frequency: 42,
      blendMode: 'ADD',
    });
  }

  handleCharacterDeath(character) {
    if (character === this.player) {
      this.triggerGameOver();
      return;
    }

    if (this.enemies && this.enemies.contains(character)) {
      this.enemies.remove(character);
    }

    this.flashElimination(character.x, character.y);
  }

  triggerGameOver() {
    if (this.gameOver) {
      return;
    }
    this.gameOver = true;
    if (this.spawnTimer) {
      this.spawnTimer.remove(false);
      this.spawnTimer = null;
    }
    this.physics.pause();
    this.player.setAlpha(0.5);
    this.enemies.children.iterate((enemy) => {
      if (!enemy) {
        return;
      }
      if (enemy.body) {
        enemy.body.setVelocity(0, 0);
      }
    });
    this.showGameOverOverlay();
  }

  showGameOverOverlay() {
    if (this.gameOverOverlay) {
      return;
    }

    const width = this.scale.width;
    const height = this.scale.height;
    const overlay = this.add.container(0, 0).setDepth(60);
    overlay.add(this.add.rectangle(width / 2, height / 2, width, height, 0x05030a, 0.72));
    overlay.add(this.add.image(width / 2, height / 2, 'ui-panel'));

    const title = this.add.text(width / 2, height / 2 - 70, 'Game Over', {
      fontSize: '36px',
      fontFamily: '"Segoe UI", sans-serif',
      fontStyle: '700',
      color: '#f1eaff',
      shadow: {
        offsetX: 0,
        offsetY: 4,
        color: '#4c36a8',
        blur: 12,
        fill: true,
      },
    }).setOrigin(0.5, 0.5);
    overlay.add(title);

    const waveSummary = this.add.text(width / 2, height / 2 - 20, `Wave Survived: ${this.waveNumber}`, {
      fontSize: '20px',
      fontFamily: '"Segoe UI", sans-serif',
      color: '#d0c9ff',
    }).setOrigin(0.5, 0.5);
    overlay.add(waveSummary);

    const button = this.add.image(width / 2, height / 2 + 70, 'ui-button').setInteractive({ useHandCursor: true });
    overlay.add(button);

    const buttonLabel = this.add.text(width / 2, height / 2 + 70, 'Retry', {
      fontSize: '24px',
      fontFamily: '"Segoe UI", sans-serif',
      fontStyle: '600',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);
    overlay.add(buttonLabel);

    button.on('pointerover', () => {
      button.setScale(1.05);
      button.setTint(0xa998ff);
    });

    button.on('pointerout', () => {
      button.setScale(1);
      button.clearTint();
    });

    const restartHandler = () => {
      button.disableInteractive();
      this.scene.restart();
    };

    button.on('pointerup', restartHandler);

    this.input.keyboard.once('keydown-ENTER', restartHandler);
    this.input.keyboard.once('keydown-SPACE', restartHandler);
    this.input.keyboard.once('keydown-R', restartHandler);

    this.gameOverOverlay = overlay;
  }

  flashElimination(x, y) {
    const burst = this.add.particles('enemy-glow');
    burst.setDepth(40);
    const emitter = burst.createEmitter({
      x,
      y,
      speed: { min: -220, max: 220 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 420,
      quantity: 24,
      blendMode: 'ADD',
    });
    this.time.delayedCall(440, () => {
      emitter.stop();
      burst.destroy();
    });
  }

  cleanup() {
    this.events.off('character-died', this.handleCharacterDeath, this);
    this.events.off('character-health-changed', this.updateHealthBar, this);
    this.events.off('wave-updated', this.updateWaveText, this);

    if (this.spawnTimer) {
      this.spawnTimer.remove(false);
      this.spawnTimer = null;
    }

    if (this.starfield) {
      this.starfield.destroy();
      this.starfield = null;
      this.starfieldEmitter = null;
    }

    if (this.groundGlow) {
      this.groundGlow.destroy();
      this.groundGlow = null;
      this.groundGlowEmitter = null;
    }

    if (this.nebulaLayer) {
      this.nebulaLayer.destroy();
      this.nebulaLayer = null;
    }

    if (this.mistLayer) {
      this.mistLayer.destroy();
      this.mistLayer = null;
    }

    if (this.aurora) {
      this.aurora.destroy();
      this.aurora = null;
    }

    if (this.gameOverOverlay) {
      this.gameOverOverlay.destroy();
      this.gameOverOverlay = null;
    }
  }
}
