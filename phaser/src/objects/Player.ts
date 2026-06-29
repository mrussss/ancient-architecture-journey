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

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle');
    this.spawnX = x;
    this.spawnY = y;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setDisplaySize(72, 96);
    this.setCollideWorldBounds(false);
    this.body!.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
    this.body!.setOffset((this.width - PLAYER_WIDTH) * 0.5, this.height - PLAYER_HEIGHT);

    this.attackHitbox = scene.add.zone(x, y, PLAYER_WIDTH * 1.8, PLAYER_HEIGHT * 0.75);
    scene.physics.add.existing(this.attackHitbox);
    const attackBody = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    attackBody.setAllowGravity(false);
    attackBody.enable = false;
  }

  updateFromControls(controls: ControlState, time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
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

    if (controls.jumpPressed && body.blocked.down) {
      body.setVelocityY(PLAYER_JUMP_VELOCITY);
    }

    if (controls.attackPressed) {
      this.startAttack(time);
    }

    if (!this.isAttacking) {
      this.setTexture(body.blocked.down ? (Math.abs(body.velocity.x) > 4 ? 'player_walk' : 'player_idle') : 'player_jump');
    }
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
    this.setTexture('player_attack');
    this.setDisplaySize(88, 96);
    const body = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    this.updateAttackHitbox();
    this.scene.time.delayedCall(ATTACK_DURATION, () => {
      this.isAttacking = false;
      this.setDisplaySize(72, 96);
      body.enable = false;
    });
  }

  private updateAttackHitbox(): void {
    const offsetX = this.facing === 'right' ? PLAYER_WIDTH * 0.95 : -PLAYER_WIDTH * 0.95;
    this.attackHitbox.setPosition(this.x + offsetX, this.y - PLAYER_HEIGHT * 0.55);
    const body = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER_WIDTH * 1.8, PLAYER_HEIGHT * 0.75);
  }
}
