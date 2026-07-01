import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { Button } from '../ui/Button';

export class MainMenuScene extends Phaser.Scene {
  private buttons: Button[] = [];
  private audio!: AudioManager;
  private musicText!: Phaser.GameObjects.Text;
  private aboutContainer?: Phaser.GameObjects.Container;
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

    this.add.text(WINDOW_WIDTH / 2, 82, '一跃千年：古建奇旅', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '42px',
      color: '#ffe08a'
    }).setOrigin(0.5);
    this.add.text(WINDOW_WIDTH / 2, 130, '残页归卷，古法重光', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '24px',
      color: '#fff3d0'
    }).setOrigin(0.5);

    this.buttons = [
      new Button(this, WINDOW_WIDTH / 2, 220, 300, 58, '开始旅程', () => this.startGame(), 'primary'),
      new Button(this, WINDOW_WIDTH / 2, 288, 282, 52, '选择关卡', () => this.openLevelSelect()),
      new Button(this, WINDOW_WIDTH / 2, 350, 282, 52, '作品说明', () => this.showAbout())
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

    const shade = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x000000, 0.54);
    shade.setInteractive();
    const panel = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'ui_result_panel').setDisplaySize(760, 430).setAlpha(0.98);
    const title = this.add.text(WINDOW_WIDTH / 2, 110, '作品说明', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '34px',
      color: '#ffe08a'
    }).setOrigin(0.5);
    const body = this.add.text(
      WINDOW_WIDTH / 2,
      250,
      [
        '作品名称：《一跃千年：古建奇旅》',
        '作品类型：中国古代建筑主题 2D 横版平台跳跃游戏',
        '',
        '玩家扮演数字媒体专业学生“小研”，在古建筑数字化采集中发现残破古卷《营造法式》。残页散落在古桥、徽居、县署与太和殿四段建筑记忆中，玩家需要收集残页、避开机关、抵达传送门，让古法重光。',
        '',
        '技术路线：Vite + TypeScript + Phaser 3',
        '创作特色：章节式关卡、漫画式剧情、残页收集、古风 UI 包装'
      ].join('\n'),
      {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '17px',
        color: '#fff8e8',
        align: 'left',
        wordWrap: { width: 650 },
        lineSpacing: 6
      }
    ).setOrigin(0.5);
    const closeButton = new Button(this, WINDOW_WIDTH / 2, 442, 220, 46, '返回主菜单', () => {
      this.aboutContainer?.destroy(true);
      this.aboutContainer = undefined;
    });

    this.aboutContainer = this.add.container(0, 0, [shade, panel, title, body, closeButton]).setDepth(120);
  }

  private createMusicControls(): void {
    this.add.text(WINDOW_WIDTH / 2, 398, '音乐音量', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '16px',
      color: '#dce6d6'
    }).setOrigin(0.5);
    this.musicText = this.add.text(WINDOW_WIDTH / 2, 421, '', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#fff3d0'
    }).setOrigin(0.5);
    new Button(this, WINDOW_WIDTH / 2 - 118, 458, 54, 34, '-', () => this.changeVolume(-0.1), 'small');
    new Button(this, WINDOW_WIDTH / 2 - 52, 458, 54, 34, '+', () => this.changeVolume(0.1), 'small');
    new Button(this, WINDOW_WIDTH / 2 + 58, 458, 108, 34, '静音', () => this.toggleMute(), 'small');
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
