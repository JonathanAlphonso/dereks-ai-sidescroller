const PhaserRef = window.Phaser;

export function generatePlatforms(scene, bounds, platformGroup) {
  const { width, height } = bounds;
  const baseY = height - 40;
  const ground = platformGroup.create(width / 2, baseY, 'ground').setDisplaySize(width, 40);
  ground.setDepth(2);
  ground.refreshBody();

  const layers = 4;
  for (let i = 1; i <= layers; i++) {
    const y = baseY - i * PhaserRef.Math.Between(90, 130);
    const platforms = PhaserRef.Math.Between(2, 4);
    const spacing = width / platforms;
    for (let j = 0; j < platforms; j++) {
      const platformWidth = PhaserRef.Math.Between(140, 240);
      const x = spacing * j + PhaserRef.Math.Between(80, spacing - 80);
      const platform = platformGroup.create(x, y, 'platform');
      platform.setDisplaySize(platformWidth, 24);
      const tintShift = PhaserRef.Math.Between(-20, 30);
      const tint = PhaserRef.Display.Color.GetColor(96 + tintShift, 150 + tintShift, 255);
      platform.setTint(tint);
      platform.setAlpha(0.9);
      platform.setDepth(3);
      platform.refreshBody();
    }
  }
}
