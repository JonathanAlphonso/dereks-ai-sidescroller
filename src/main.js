import GameScene from './scenes/GameScene.js';

const PhaserRef = window.Phaser;

const config = {
  type: PhaserRef.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#120d1e',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false,
    },
  },
  scene: [GameScene],
};

new PhaserRef.Game(config);
