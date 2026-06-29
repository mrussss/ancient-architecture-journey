import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { enemyTextureByType } from '../data/assets';
import { getLevel, type LevelData, type RectData } from '../data/levels';
import { Collectible } from '../objects/Collectible';
import { Enemy } from '../objects/Enemy';
import { Player } from '../objects/Player';
import { Trap } from '../objects/Trap';
import { Hud } from '../ui/Hud';
import { Controls } from '../utils/controls';
import { validateLevel } from '../utils/levelValidation';

interface GameSceneInitData {
  levelId: number;
}

export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private controls!: Controls;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private traps!: Phaser.Physics.Arcade.StaticGroup;
  private pages!: Phaser.Physics.Arcade.Group;
  private goal!: Phaser.Physics.Arcade.StaticImage;
  private hud!: Hud;
  private pageCount = 0;
  private completed = false;

  constructor() {
    super('GameScene');
  }

  init(data: GameSceneInitData): void {
    this.level = getLevel(data.levelId ?? 1);
    this.pageCount = 0;
    this.completed = false;
  }

  create(): void {
    validateLevel(this.level);
    this.physics.world.setBounds(0, 0, this.level.worldWidth, this.level.worldHeight + 220);
    this.createBackground();
    this.createPlatforms();
    this.createTraps();
    this.createPages();
    this.createEnemies();

    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y);
    this.goal = this.physics.add.staticImage(
      this.level.goal.x + this.level.goal.w / 2,
      this.level.goal.y + this.level.goal.h / 2,
      'ui_portal'
    );
    this.goal.setDisplaySize(this.level.goal.w, this.level.goal.h);
    this.goal.refreshBody();
    this.tweens.add({ targets: this.goal, alpha: 0.55, scale: 1.08, duration: 760, yoyo: true, repeat: -1 });

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.traps, () => this.handleTrapHit());
    this.physics.add.overlap(this.player, this.enemies, (_player, enemy) => this.handleEnemyHit(enemy as Enemy));
    this.physics.add.overlap(this.player.attackHitbox, this.enemies, (_hitbox, enemy) => this.handleAttackEnemy(enemy as Enemy));
    this.physics.add.overlap(this.player, this.pages, (_player, page) => this.handleCollectPage(page as Collectible));
    this.physics.add.overlap(this.player, this.goal, () => this.handleGoal());

    this.cameras.main.setBounds(0, 0, this.level.worldWidth, WINDOW_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(180, 100);

    this.controls = new Controls(this);
    this.hud = new Hud(this, this.level);
    this.hud.update(this.player.hp, this.pageCount, this.level.pages.length);
    this.cameras.main.fadeIn(180, 0, 0, 0);
  }

  update(time: number): void {
    const controls = this.controls.read();
    if (controls.restartPressed) {
      this.scene.restart({ levelId: this.level.id });
      return;
    }
    if (controls.escapePressed) {
      this.scene.start('LevelSelectScene');
      return;
    }

    this.player.updateFromControls(controls, time);
    this.hud.update(this.player.hp, this.pageCount, this.level.pages.length);

    if (this.player.y > this.level.worldHeight + 110) {
      if (this.player.damage(1) && !this.player.isDead()) {
        this.player.respawn();
      }
    }

    if (this.player.isDead()) {
      this.scene.start('GameOverScene', { levelId: this.level.id });
    }
  }

  private createBackground(): void {
    this.add.tileSprite(0, 0, this.level.worldWidth, WINDOW_HEIGHT, this.level.backgroundKey)
      .setOrigin(0, 0)
      .setScrollFactor(0.28, 0)
      .setDisplaySize(this.level.worldWidth, WINDOW_HEIGHT);
    this.add.rectangle(0, 488, this.level.worldWidth, 52, 0x101215, 0.18).setOrigin(0, 0);
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    for (const rect of this.level.platforms) {
      const platform = this.platforms.create(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.textureKey ?? this.level.tileKey) as Phaser.Physics.Arcade.StaticImage;
      platform.setDisplaySize(rect.w, rect.h);
      platform.refreshBody();
      platform.setTint(this.tintForPlatform(rect));
    }
  }

  private createTraps(): void {
    this.traps = this.physics.add.staticGroup();
    for (const trapData of this.level.traps) {
      const trap = new Trap(this, trapData);
      this.traps.add(trap);
    }
  }

  private createPages(): void {
    this.pages = this.physics.add.group({ allowGravity: false });
    for (const point of this.level.pages) {
      this.pages.add(new Collectible(this, point.x, point.y));
    }
  }

  private createEnemies(): void {
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    for (const enemyData of this.level.enemies) {
      if (!this.textures.exists(enemyTextureByType[enemyData.type])) {
        console.warn(`Missing enemy texture for ${enemyData.type}`);
      }
      this.enemies.add(new Enemy(this, enemyData));
    }
  }

  private handleTrapHit(): void {
    if (this.player.damage(1) && this.player.isDead()) {
      this.scene.start('GameOverScene', { levelId: this.level.id });
    }
  }

  private handleEnemyHit(enemy: Enemy): void {
    if (!enemy.active) {
      return;
    }
    if (this.player.damage(enemy.damageAmount) && this.player.isDead()) {
      this.scene.start('GameOverScene', { levelId: this.level.id });
    }
  }

  private handleAttackEnemy(enemy: Enemy): void {
    if (!this.player.isAttacking || !enemy.active) {
      return;
    }
    enemy.hit();
  }

  private handleCollectPage(page: Collectible): void {
    if (page.collected) {
      return;
    }
    page.collect(() => undefined);
    this.pageCount += 1;
    this.hud.update(this.player.hp, this.pageCount, this.level.pages.length);
  }

  private handleGoal(): void {
    if (this.completed) {
      return;
    }
    this.completed = true;
    this.scene.start('StoryScene', {
      levelId: this.level.id,
      storyType: 'complete',
      nextScene: this.level.id >= 4 ? 'FinalScene' : 'LevelCompleteScene'
    });
  }

  private tintForPlatform(rect: RectData): number {
    if (rect.h > 40) {
      return 0xffffff;
    }
    return 0xf1e2bd;
  }
}
