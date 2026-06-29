import Phaser from 'phaser';
import { enemyTextureByType } from '../data/assets';
import type { EnemyData, EnemyType } from '../data/levels';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp = 1;
  damageAmount = 1;
  private speed = 74;
  private leftLimit: number;
  private rightLimit: number;
  readonly enemyType: EnemyType;

  constructor(scene: Phaser.Scene, data: EnemyData) {
    super(scene, data.x, data.y + data.h, enemyTextureByType[data.type]);
    this.enemyType = data.type;
    this.leftLimit = data.leftLimit;
    this.rightLimit = data.rightLimit;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDisplaySize(data.type === 'palaceLion' ? 80 : 72, data.type === 'yamenGuard' ? 72 : 64);
    this.body!.setSize(data.w, data.h);
    this.body!.setOffset((this.width - data.w) * 0.5, this.height - data.h);
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(this.speed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.x < this.leftLimit) {
      this.x = this.leftLimit;
      body.setVelocityX(Math.abs(this.speed));
      this.setFlipX(false);
    } else if (this.x > this.rightLimit) {
      this.x = this.rightLimit;
      body.setVelocityX(-Math.abs(this.speed));
      this.setFlipX(true);
    }
  }

  hit(): void {
    this.hp -= 1;
    if (this.hp <= 0) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.enable = false;
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scale: 0.7,
        duration: 180,
        onComplete: () => this.destroy()
      });
    }
  }
}
