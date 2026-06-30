import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { enemyTextureByType } from '../data/assets';
import { getLevel, type LevelData } from '../data/levels';
import { Collectible } from '../objects/Collectible';
import { Enemy } from '../objects/Enemy';
import { Player } from '../objects/Player';
import { TilePlatform } from '../objects/TilePlatform';
import { Trap } from '../objects/Trap';
import { DebugOverlay } from '../ui/DebugOverlay';
import { Hud } from '../ui/Hud';
import { Button } from '../ui/Button';
import { ParallaxBackground } from '../ui/ParallaxBackground';
import { Controls } from '../utils/controls';
import { printLevelValidationReport, validateLevel, type LevelValidationReport } from '../utils/levelValidation';

interface GameSceneInitData {
  levelId: number;
}

export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private controls!: Controls;
  private player!: Player;
  private groundPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private solidBlockPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private oneWayPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private traps!: Phaser.Physics.Arcade.StaticGroup;
  private pages!: Phaser.Physics.Arcade.Group;
  private goal!: Phaser.Physics.Arcade.StaticImage;
  private hud!: Hud;
  private debugOverlay!: DebugOverlay;
  private background!: ParallaxBackground;
  private validationReport!: LevelValidationReport;
  private audio!: AudioManager;
  private pauseObjects: Phaser.GameObjects.GameObject[] = [];
  private pauseMusicText?: Phaser.GameObjects.Text;
  private pageCount = 0;
  private completed = false;
  private pausedByMenu = false;

  constructor() {
    super('GameScene');
  }

  init(data: GameSceneInitData): void {
    this.level = getLevel(data.levelId ?? 1);
    this.pageCount = 0;
    this.completed = false;
    this.pausedByMenu = false;
  }

  create(): void {
    this.audio = AudioManager.get(this);
    this.audio.playBgm();
    this.validationReport = validateLevel(this.level);
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

    this.physics.add.collider(this.player, this.groundPlatforms);
    this.physics.add.collider(this.player, this.solidBlockPlatforms);
    this.physics.add.collider(this.player, this.oneWayPlatforms, undefined, this.shouldCollideOneWay, this);
    this.physics.add.collider(this.enemies, this.groundPlatforms);
    this.physics.add.collider(this.enemies, this.solidBlockPlatforms);
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
    this.debugOverlay = new DebugOverlay(this, this.level, this.validationReport, this.player, this.goal);
    this.hud.update(this.player.hp, this.pageCount, this.level.pages.length);
    this.cameras.main.fadeIn(180, 0, 0, 0);
  }

  update(time: number, delta: number): void {
    const controls = this.controls.read();
    if (controls.restartPressed) {
      this.scene.restart({ levelId: this.level.id });
      return;
    }
    if (controls.escapePressed) {
      this.togglePauseMenu();
      return;
    }
    if (controls.debugPressed) {
      this.debugOverlay.toggle();
    }
    if (controls.reportPressed) {
      printLevelValidationReport(this.validationReport);
    }

    if (this.pausedByMenu) {
      this.background.update(this.cameras.main);
      this.debugOverlay.update();
      return;
    }

    this.player.updateFromControls(controls, time);
    this.enemies.children.iterate((child) => {
      (child as Enemy).updatePatrol(delta);
      return true;
    });
    this.background.update(this.cameras.main);
    this.debugOverlay.update();
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
    const backgroundKey =
      this.level.wideBackgroundKey && this.textures.exists(this.level.wideBackgroundKey)
        ? this.level.wideBackgroundKey
        : this.level.backgroundKey;
    this.background = new ParallaxBackground(this, backgroundKey, this.level.worldWidth);
    this.add.rectangle(0, 488, this.level.worldWidth, 52, 0x101215, 0.18).setOrigin(0, 0);
  }

  private createPlatforms(): void {
    this.groundPlatforms = this.physics.add.staticGroup();
    this.solidBlockPlatforms = this.physics.add.staticGroup();
    this.oneWayPlatforms = this.physics.add.staticGroup();
    for (const rect of this.level.platforms) {
      const kind = rect.kind ?? 'ground';
      const group =
        kind === 'oneWay'
          ? this.oneWayPlatforms
          : kind === 'solidBlock'
            ? this.solidBlockPlatforms
            : this.groundPlatforms;
      new TilePlatform(this, group, rect, this.level.tileKey);
    }
  }

  private shouldCollideOneWay(
    playerObject: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    platformObject: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): boolean {
    const playerBody = playerObject.body as Phaser.Physics.Arcade.Body;
    const platformBody = platformObject.body as Phaser.Physics.Arcade.StaticBody;
    return playerBody.velocity.y >= 0 && playerBody.bottom <= platformBody.top + 10;
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
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: false });
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

  private togglePauseMenu(): void {
    if (this.pausedByMenu) {
      this.closePauseMenu();
      return;
    }
    this.openPauseMenu();
  }

  private openPauseMenu(): void {
    this.pausedByMenu = true;
    this.physics.pause();

    const shade = this.add
      .rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x000000, 0.42)
      .setScrollFactor(0)
      .setDepth(2000);
    const panel = this.add
      .rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 500, 340, 0x11181c, 0.88)
      .setStrokeStyle(2, 0xd7bd6a)
      .setScrollFactor(0)
      .setDepth(2000);
    const title = this.add.text(WINDOW_WIDTH / 2, 158, '暂停', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '34px',
      color: '#ffe08a'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    const volumeLabel = this.add.text(WINDOW_WIDTH / 2, 222, '音乐音量', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '17px',
      color: '#dce6d6'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    this.pauseMusicText = this.add.text(WINDOW_WIDTH / 2, 250, '', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '19px',
      color: '#fff3d0'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

    this.pauseObjects.push(shade, panel, title, volumeLabel, this.pauseMusicText);

    this.addPauseButton(WINDOW_WIDTH / 2, 312, 210, 46, '继续游戏', () => this.closePauseMenu());
    this.addPauseButton(WINDOW_WIDTH / 2 - 118, 368, 52, 34, '-', () => this.changeMusicVolume(-0.1));
    this.addPauseButton(WINDOW_WIDTH / 2 - 54, 368, 52, 34, '+', () => this.changeMusicVolume(0.1));
    this.addPauseButton(WINDOW_WIDTH / 2 + 54, 368, 104, 34, '静音', () => this.toggleMusicMute());
    this.addPauseButton(WINDOW_WIDTH / 2, 432, 210, 46, '返回选关', () => {
      this.physics.resume();
      this.scene.start('LevelSelectScene');
    });
    this.updatePauseMusicText();
  }

  private closePauseMenu(): void {
    this.pausedByMenu = false;
    this.physics.resume();
    for (const object of this.pauseObjects) {
      object.destroy();
    }
    this.pauseObjects = [];
    this.pauseMusicText = undefined;
  }

  private addPauseButton(x: number, y: number, width: number, height: number, text: string, onClick: () => void): void {
    const button = new Button(this, x, y, width, height, text, onClick);
    button.setScrollFactor(0).setDepth(2010);
    this.pauseObjects.push(button);
  }

  private changeMusicVolume(delta: number): void {
    this.audio.playBgm();
    this.audio.setVolume(this.audio.getVolume() + delta);
    this.updatePauseMusicText();
  }

  private toggleMusicMute(): void {
    this.audio.playBgm();
    this.audio.toggleMute();
    this.updatePauseMusicText();
  }

  private updatePauseMusicText(): void {
    this.pauseMusicText?.setText(this.audio.isMuted() ? '音乐：静音' : `音乐：${Math.round(this.audio.getVolume() * 100)}%`);
  }
}
