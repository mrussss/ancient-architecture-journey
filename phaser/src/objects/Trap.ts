import Phaser from 'phaser';
import { trapTextureByType } from '../data/assets';
import type { TrapData } from '../data/levels';

export class Trap extends Phaser.Physics.Arcade.Sprite {
  readonly damageAmount = 1;

  constructor(scene: Phaser.Scene, data: TrapData) {
    super(scene, data.x + data.w / 2, data.y + data.h / 2, trapTextureByType[data.type]);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDisplaySize(data.w, data.h);
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(data.w, data.h);
    body.updateFromGameObject();
    this.addMotion(data.type);
  }

  private addMotion(type: TrapData['type']): void {
    if (type === 'water') {
      this.scene.tweens.add({ targets: this, y: this.y + 2, alpha: 0.72, duration: 620, yoyo: true, repeat: -1 });
    } else if (type === 'fire') {
      this.scene.tweens.add({ targets: this, scaleY: this.scaleY * 1.12, duration: 180, yoyo: true, repeat: -1 });
    } else if (type === 'fallingStone') {
      this.scene.tweens.add({ targets: this, angle: 4, y: this.y - 3, duration: 420, yoyo: true, repeat: -1 });
    }
  }
}
