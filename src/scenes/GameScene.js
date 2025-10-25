import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import { generatePlatforms } from '../util/PlatformGenerator.js';
import AttackManager from '../combat/AttackManager.js';

const PhaserRef = window.Phaser;

export default class GameScene extends PhaserRef.Scene {
  constructor() {
    super('GameScene');
    this.waveNumber = 0;
  }

  preload() {
    // Generate textures for rectangles via graphics
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    graphics.fillStyle(0x1d2136, 1);
    graphics.fillRect(0, 0, 100, 40);
    graphics.generateTexture('ground', 100, 40);

    graphics.clear();
    graphics.fillStyle(0x2e314a, 1);
    graphics.fillRect(0, 0, 100, 24);
    graphics.generateTexture('platform', 100, 24);

    graphics.clear();
    graphics.fillStyle(0xfff1b7, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.generateTexture('attack', 60, 60);

    this.load.audio('shockwave', 'https://assets.codepen.io/21542/explosion-08.mp3');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x181029).setDepth(-5);

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

    this.time.addEvent({
      delay: 4500,
      loop: true,
      callback: this.spawnWave,
      callbackScope: this,
    });

    this.spawnWave();
  }

  handlePlayerCollision(player, enemy) {
    if (!enemy.active || enemy.isDead) {
      return;
    }
    const impact = Math.abs(enemy.body.velocity.x - player.body.velocity.x);
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
    if (!this.player || this.player.isDead) {
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
    this.healthBar = this.add.rectangle(width / 2, 30, 260, 18, 0x00c2ff).setOrigin(0.5, 0.5);
    this.healthBarBack = this.add.rectangle(width / 2, 30, 270, 22, 0x081423).setOrigin(0.5, 0.5).setDepth(-1);
    this.healthText = this.add.text(width / 2, 30, 'Health', {
      fontSize: '16px',
      color: '#f5fbff',
    }).setOrigin(0.5, 0.5);

    this.waveText = this.add.text(width - 140, 30, 'Wave 1', {
      fontSize: '16px',
      color: '#f5fbff',
    }).setOrigin(0.5, 0.5);

    this.events.on('character-health-changed', this.updateHealthBar, this);
    this.events.on('wave-updated', this.updateWaveText, this);

    this.updateHealthBar(this.player, this.player.health, this.player.maxHealth);
  }

  updateHealthBar(character, health, maxHealth) {
    if (character !== this.player) {
      return;
    }
    const pct = PhaserRef.Math.Clamp(health / maxHealth, 0, 1);
    this.healthBar.width = 260 * pct;
    this.healthText.setText(`Health: ${Math.ceil(health)} / ${maxHealth}`);
  }

  updateWaveText(waveNumber) {
    this.waveText.setText(`Wave ${waveNumber}`);
  }
}
