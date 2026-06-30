import Phaser from 'phaser';

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  collected = false;
  private baseY: number;
  private glow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'item_page');
    this.baseY = y;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setDisplaySize(42, 50);
    this.setDepth(40);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    this.centerBody(body, 32, 40);
    this.glow = scene.add
      .ellipse(this.x, this.y, 58, 58, 0xffd76a, 0.2)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(39);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.collected) {
      this.y = this.baseY + Math.sin(time / 240) * 5;
      this.angle = Math.sin(time / 620) * 4;
      this.setAlpha(0.9 + Math.sin(time / 180) * 0.1);
      this.glow.setPosition(this.x, this.y);
      this.glow.setAlpha(0.16 + Math.sin(time / 210) * 0.06);
      this.glow.setScale(0.95 + Math.sin(time / 260) * 0.08);
    }
  }

  collect(onDone: () => void): void {
    if (this.collected) {
      return;
    }
    this.collected = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.scene.tweens.add({
      targets: [this, this.glow],
      alpha: 0,
      scale: 1.6,
      duration: 220,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.glow.destroy();
        this.destroy();
        onDone();
      }
    });
  }

  private centerBody(body: Phaser.Physics.Arcade.Body, worldWidth: number, worldHeight: number): void {
    const sourceWidth = worldWidth / this.scaleX;
    const sourceHeight = worldHeight / this.scaleY;
    body.setSize(sourceWidth, sourceHeight);
    body.setOffset((this.width - sourceWidth) * 0.5, (this.height - sourceHeight) * 0.5);
  }
}
