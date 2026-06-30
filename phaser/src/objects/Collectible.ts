import Phaser from 'phaser';

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  collected = false;
  private baseY: number;
  private glow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x + 18, y + 18, 'item_page');
    this.baseY = y + 18;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(42, 42);
    this.setDepth(40);
    this.body!.setAllowGravity(false);
    this.body!.setSize(30, 32);
    this.body!.setOffset(33, 32);
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
}
