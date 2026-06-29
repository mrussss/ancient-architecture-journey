import Phaser from 'phaser';

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  collected = false;
  private baseY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x + 13, y + 15, 'item_page');
    this.baseY = y + 15;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(30, 36);
    this.body!.setAllowGravity(false);
    this.body!.setSize(26, 30);
    this.setTint(0xffefb8);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.collected) {
      this.y = this.baseY + Math.sin(time / 240) * 5;
      this.setAlpha(0.82 + Math.sin(time / 180) * 0.18);
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
      targets: this,
      alpha: 0,
      scale: 1.5,
      duration: 180,
      onComplete: () => {
        this.destroy();
        onDone();
      }
    });
  }
}
