const PhaserRef = window.Phaser;

export default class AttackHitbox extends PhaserRef.GameObjects.Rectangle {
  constructor(scene, owner, definition) {
    const width = definition.width ?? (definition.radius * 2 ?? 40);
    const height = definition.height ?? (definition.radius * 2 ?? 40);
    super(scene, owner.x, owner.y, width, height, 0xfff1b7, 0.2);
    this.scene = scene;
    this.owner = owner;
    this.definition = definition;
    this.hitTargets = new Set();

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.allowGravity = false;
    this.body.setImmovable(true);
    this.body.setSize(width, height);
    this.setDepth(16);
    this.setBlendMode(PhaserRef.BlendModes.ADD);
    this.setStrokeStyle(2, 0xfff7d1, 0.8);
    this.setAlpha(0.45);

    if (definition.radius) {
      this.setDisplaySize(definition.radius * 2, definition.radius * 2);
      this.body.setCircle(definition.radius);
      this.body.setOffset(-definition.radius, -definition.radius);
    }

    this.refreshPosition();

    scene.time.addEvent({
      delay: definition.duration ?? 150,
      callback: () => this.destroy(),
    });
  }

  refreshPosition() {
    if (this.definition.radius) {
      this.setPosition(this.owner.x, this.owner.y + this.owner.height / 2);
      return;
    }
    const offsetX = (this.definition.offsetX ?? 0) * this.owner.facing;
    const offsetY = this.definition.offsetY ?? 0;
    this.setPosition(this.owner.x + offsetX, this.owner.y + offsetY);
  }
}
