import Phaser from 'phaser';
import {
  ATTACK_COOLDOWN,
  ATTACK_DURATION,
  INVINCIBLE_TIME,
  MAX_HP,
  PLAYER_HEIGHT,
  PLAYER_JUMP_VELOCITY,
  PLAYER_SPEED,
  PLAYER_WIDTH
} from '../constants';
import type { ControlState } from '../utils/controls';

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp = MAX_HP;
  readonly maxHp = MAX_HP;
  isInvincible = false;
  isAttacking = false;
  facing: 'left' | 'right' = 'right';
  readonly spawnX: number;
  readonly spawnY: number;
  readonly attackHitbox: Phaser.GameObjects.Zone;
  private attackReadyAt = 0;
  private lastGroundedAt = 0;
  private jumpBufferedUntil = 0;
  private readonly coyoteTimeMs = 90;
  private readonly jumpBufferMs = 120;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'xiaoyan_sheet', 0);
    this.spawnX = x;
    this.spawnY = y;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setCollideWorldBounds(false);
    this.applyVisualSize();

    this.attackHitbox = scene.add.zone(x, y, PLAYER_WIDTH * 1.8, PLAYER_HEIGHT * 0.75);
    scene.physics.add.existing(this.attackHitbox);
    const attackBody = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    attackBody.setAllowGravity(false);
    attackBody.enable = false;
  }

  updateFromControls(controls: ControlState, time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down || body.touching.down || body.onFloor();
    if (grounded) {
      this.lastGroundedAt = time;
    }
    if (controls.jumpPressed) {
      this.jumpBufferedUntil = time + this.jumpBufferMs;
    }

    if (controls.left) {
      body.setVelocityX(-PLAYER_SPEED);
      this.facing = 'left';
      this.setFlipX(true);
    } else if (controls.right) {
      body.setVelocityX(PLAYER_SPEED);
      this.facing = 'right';
      this.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    if (time <= this.jumpBufferedUntil && time - this.lastGroundedAt <= this.coyoteTimeMs) {
      body.setVelocityY(PLAYER_JUMP_VELOCITY);
      this.jumpBufferedUntil = 0;
      this.lastGroundedAt = 0;
    }

    if (controls.attackPressed) {
      this.startAttack(time);
    }

    this.updateAnimation(body);
    this.updateAttackHitbox();
  }

  damage(amount: number): boolean {
    if (this.isInvincible || amount <= 0) {
      return false;
    }
    this.hp = Math.max(0, this.hp - amount);
    this.isInvincible = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.25,
      yoyo: true,
      repeat: 7,
      duration: 75,
      onComplete: () => {
        this.alpha = 1;
        this.isInvincible = false;
      }
    });
    this.scene.time.delayedCall(INVINCIBLE_TIME, () => {
      this.alpha = 1;
      this.isInvincible = false;
    });
    return true;
  }

  respawn(): void {
    this.setPosition(this.spawnX, this.spawnY);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.lastGroundedAt = 0;
    this.jumpBufferedUntil = 0;
    this.damage(0);
    this.isInvincible = true;
    this.scene.time.delayedCall(INVINCIBLE_TIME, () => {
      this.alpha = 1;
      this.isInvincible = false;
    });
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  private startAttack(time: number): void {
    if (time < this.attackReadyAt || this.isAttacking) {
      return;
    }
    this.isAttacking = true;
    this.attackReadyAt = time + ATTACK_COOLDOWN;
    this.anims.stop();
    this.setTexture('xiaoyan_sheet', 6);
    this.applyVisualSize();
    const body = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    this.updateAttackHitbox();
    this.scene.time.delayedCall(ATTACK_DURATION, () => {
      this.isAttacking = false;
      this.applyVisualSize();
      body.enable = false;
    });
  }

  private updateAnimation(body: Phaser.Physics.Arcade.Body): void {
    if (this.isAttacking) {
      return;
    }
    if (!body.blocked.down) {
      this.anims.stop();
      this.setTexture('xiaoyan_sheet', 5);
      this.applyVisualSize();
      return;
    }
    if (Math.abs(body.velocity.x) > 5) {
      this.play('xiaoyan-walk', true);
      this.applyVisualSize();
      return;
    }
    this.anims.stop();
    this.setTexture('xiaoyan_sheet', 0);
    this.applyVisualSize();
  }

  private applyVisualSize(): void {
    this.setDisplaySize(72, 96);
    if (!this.body) {
      return;
    }
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
    body.setOffset((this.width - PLAYER_WIDTH) * 0.5, this.height - PLAYER_HEIGHT - 2);
  }

  private updateAttackHitbox(): void {
    const offsetX = this.facing === 'right' ? PLAYER_WIDTH * 0.95 : -PLAYER_WIDTH * 0.95;
    this.attackHitbox.setPosition(this.x + offsetX, this.y - PLAYER_HEIGHT * 0.55);
    const body = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER_WIDTH * 1.8, PLAYER_HEIGHT * 0.75);
  }
}
