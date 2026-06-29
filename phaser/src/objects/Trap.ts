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
  }
}
