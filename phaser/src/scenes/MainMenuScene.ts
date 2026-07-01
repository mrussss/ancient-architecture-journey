import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { AchievementManager } from '../systems/AchievementManager';
import { Button } from '../ui/Button';

export class MainMenuScene extends Phaser.Scene {
  private buttons: Button[] = [];
  private audio!: AudioManager;
  private musicText!: Phaser.GameObjects.Text;
  private aboutContainer?: Phaser.GameObjects.Container;
  private achievementContainer?: Phaser.GameObjects.Container;
  private selectedIndex = 0;

  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    this.audio = AudioManager.get(this);
    this.audio.playBgm();
    this.input.once('pointerdown', () => this.audio.playBgm());

    const bgKey = this.textures.exists('bg_bridge_wide') ? 'bg_bridge_wide' : 'bg_bridge';
    const bg = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, bgKey).setAlpha(0.82);
    this.coverImage(bg);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x06080a, 0.24);
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 6, 'ui_menu_panel').setDisplaySize(760, 498).setAlpha(0.96);

    this.add.text(WINDOW_WIDTH / 2, 124, '一跃千年：古建奇旅', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '32px',
      color: '#ffe08a'
    }).setOrigin(0.5);
    this.add.text(WINDOW_WIDTH / 2, 162, '残页归卷，古法重光', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '21px',
      color: '#fff3d0'
    }).setOrigin(0.5);

    this.buttons = [
      new Button(this, WINDOW_WIDTH / 2, 220, 300, 50, '开始旅程', () => this.startGame(), 'primary'),
      new Button(this, WINDOW_WIDTH / 2, 275, 282, 46, '选择关卡', () => this.openLevelSelect()),
      new Button(this, WINDOW_WIDTH / 2, 330, 282, 46, '成就', () => this.showAchievements()),
      new Button(this, WINDOW_WIDTH / 2, 385, 282, 46, '作品说明', () => this.showAbout())
    ];
    this.createMusicControls();

    new Button(this, WINDOW_WIDTH - 92, 38, 128, 36, '全屏', () => this.toggleFullscreen(), 'small');
    this.add.text(20, WINDOW_HEIGHT - 24, 'Vite + TypeScript + Phaser 3 · F2 调试 / F3 验证', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '14px',
      color: '#dce6d6'
    }).setOrigin(0, 0.5);
    this.updateSelection();

    this.input.keyboard!.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard!.on('keydown-W', () => this.moveSelection(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard!.on('keydown-S', () => this.moveSelection(1));
    this.input.keyboard!.on('keydown-ENTER', () => this.activate());
  }

  private startGame(): void {
    this.audio.playBgm();
    this.scene.start('StoryScene', { levelId: 1, storyType: 'intro', nextScene: 'GameScene' });
  }

  private openLevelSelect(): void {
    this.audio.playBgm();
    this.scene.start('LevelSelectScene');
  }

  private showAbout(): void {
    this.audio.playBgm();
    this.aboutContainer?.destroy(true);
    this.achievementContainer?.destroy(true);
    this.achievementContainer = undefined;

    const shade = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x000000, 0.78);
    shade.setInteractive();
    const panel = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 12, 'ui_result_panel').setDisplaySize(760, 430).setAlpha(1);
    const title = this.add.text(WINDOW_WIDTH / 2, 54, '作品说明', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '32px',
      color: '#ffe08a',
      stroke: '#3a260c',
      strokeThickness: 4
    }).setOrigin(0.5);
    const body = this.add.text(
      WINDOW_WIDTH / 2 - 230,
      178,
      [
        '作品名称：《一跃千年：古建奇旅》',
        '作品类型：中国古代建筑主题 2D 横版平台跳跃游戏',
        '',
        '玩家扮演数字媒体专业学生“小研”，在古建筑数字化采集中发现残破古卷《营造法式》。',
        '残页散落在古桥、徽居、县署与太和殿四段建筑记忆中。',
        '玩家需要收集残页、避开机关、抵达传送门，让古法重光。',
        '',
        '技术路线：Vite + TypeScript + Phaser 3',
        '创作特色：章节式关卡、漫画式剧情、残页收集、古风 UI 包装'
      ].join('\n'),
      {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '14px',
        color: '#e8dcc2',
        align: 'left',
        wordWrap: { width: 460 },
        lineSpacing: 5,
        fixedWidth: 460,
        fixedHeight: 210
      }
    ).setOrigin(0, 0);
    const closeButton = new Button(this, WINDOW_WIDTH / 2, 420, 210, 42, '返回主菜单', () => {
      this.aboutContainer?.destroy(true);
      this.aboutContainer = undefined;
    });

    this.aboutContainer = this.add.container(0, 0, [shade, panel, title, body, closeButton]).setDepth(120);
  }

  private showAchievements(): void {
    this.audio.playBgm();
    this.achievementContainer?.destroy(true);
    this.aboutContainer?.destroy(true);
    this.aboutContainer = undefined;

    const shade = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x000000, 0.78);
    shade.setInteractive();
    const panel = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 12, 'ui_result_panel').setDisplaySize(760, 430).setAlpha(1);
    const title = this.add.text(WINDOW_WIDTH / 2, 54, '成就', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '32px',
      color: '#ffe08a',
      stroke: '#3a260c',
      strokeThickness: 4
    }).setOrigin(0.5);

    const rows: Phaser.GameObjects.GameObject[] = [];
    AchievementManager.list().forEach((achievement, index) => {
      const y = 165 + index * 92;
      const iconKey =
        achievement.unlocked && this.textures.exists('ui_achievement_badge')
          ? 'ui_achievement_badge'
          : this.textures.exists('ui_achievement_badge_locked')
            ? 'ui_achievement_badge_locked'
            : 'icon_page';
      const icon = this.add.image(270, y + 12, iconKey).setDisplaySize(48, 48);
      const name = this.add.text(320, y - 8, `${achievement.unlocked ? '已解锁' : '未解锁'} · ${achievement.title}`, {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '20px',
        color: achievement.unlocked ? '#ffe08a' : '#c9d2c5',
        fixedWidth: 360
      });
      const desc = this.add.text(320, y + 24, achievement.description, {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '15px',
        color: '#efe2c5',
        wordWrap: { width: 360 },
        fixedWidth: 360
      });
      rows.push(icon, name, desc);
    });

    const closeButton = new Button(this, WINDOW_WIDTH / 2, 420, 210, 42, '返回主菜单', () => {
      this.achievementContainer?.destroy(true);
      this.achievementContainer = undefined;
    });

    this.achievementContainer = this.add.container(0, 0, [shade, panel, title, ...rows, closeButton]).setDepth(130);
  }

  private createMusicControls(): void {
    this.add.text(WINDOW_WIDTH / 2, 413, '音乐音量', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '16px',
      color: '#dce6d6'
    }).setOrigin(0.5);
    this.musicText = this.add.text(WINDOW_WIDTH / 2, 434, '', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#fff3d0'
    }).setOrigin(0.5);
    new Button(this, WINDOW_WIDTH / 2 - 118, 468, 54, 34, '-', () => this.changeVolume(-0.1), 'small');
    new Button(this, WINDOW_WIDTH / 2 - 52, 468, 54, 34, '+', () => this.changeVolume(0.1), 'small');
    new Button(this, WINDOW_WIDTH / 2 + 58, 468, 108, 34, '静音', () => this.toggleMute(), 'small');
    this.updateMusicText();
  }

  private changeVolume(delta: number): void {
    this.audio.playBgm();
    this.audio.setVolume(this.audio.getVolume() + delta);
    this.updateMusicText();
  }

  private toggleMute(): void {
    this.audio.playBgm();
    this.audio.toggleMute();
    this.updateMusicText();
  }

  private updateMusicText(): void {
    const label = this.audio.isMuted() ? '音乐：静音' : `音乐：${Math.round(this.audio.getVolume() * 100)}%`;
    this.musicText.setText(label);
  }

  private toggleFullscreen(): void {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
      return;
    }
    this.scale.startFullscreen();
  }

  private moveSelection(delta: number): void {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + delta, 0, this.buttons.length);
    this.updateSelection();
  }

  private activate(): void {
    this.buttons[this.selectedIndex].press();
  }

  private updateSelection(): void {
    this.buttons.forEach((button, index) => button.setSelected(index === this.selectedIndex));
  }

  private coverImage(image: Phaser.GameObjects.Image): void {
    const source = image.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(WINDOW_WIDTH / source.width, WINDOW_HEIGHT / source.height);
    image.setDisplaySize(source.width * scale, source.height * scale);
  }
}
