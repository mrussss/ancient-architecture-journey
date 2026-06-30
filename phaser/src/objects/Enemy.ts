import Phaser from 'phaser';
import { enemyTextureByType } from '../data/assets';
import type { EnemyData, EnemyType } from '../data/levels';

const ENEMY_DEFAULT_FACING: 'left' | 'right' = 'left';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp = 1;
  damageAmount = 1;
  private speed = 74;
  private leftLimit: number;
  private rightLimit: number;
  private lastDirection: -1 | 1 = 1;
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
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setCollideWorldBounds(false);
    body.setVelocityX(this.speed);
    this.syncFacing();
    scene.tweens.add({
      targets: this,
      scaleY: this.scaleY * 1.04,
      angle: 1.5,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
  }

  updatePatrol(_delta: number): void {
    if (!this.active || !this.body) {
      return;
    }
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left || body.touching.left) {
      this.lastDirection = 1;
      body.setVelocityX(Math.abs(this.speed));
    }
    if (body.blocked.right || body.touching.right) {
      this.lastDirection = -1;
      body.setVelocityX(-Math.abs(this.speed));
    }
    if (this.x <= this.leftLimit) {
      this.x = this.leftLimit;
      this.lastDirection = 1;
      body.setVelocityX(Math.abs(this.speed));
    } else if (this.x >= this.rightLimit) {
      this.x = this.rightLimit;
      this.lastDirection = -1;
      body.setVelocityX(-Math.abs(this.speed));
    } else if (Math.abs(body.velocity.x) < 1) {
      body.setVelocityX(this.lastDirection * this.speed);
    } else {
      this.lastDirection = body.velocity.x > 0 ? 1 : -1;
    }

    this.x = Phaser.Math.Clamp(this.x, this.leftLimit, this.rightLimit);
    this.syncFacing();
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

  private syncFacing(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const movingRight = body.velocity.x > 0;
    this.setFlipX(ENEMY_DEFAULT_FACING === 'left' ? movingRight : !movingRight);
  }
}
