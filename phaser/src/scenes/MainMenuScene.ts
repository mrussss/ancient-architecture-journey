import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { Button } from '../ui/Button';

export class MainMenuScene extends Phaser.Scene {
  private buttons: Button[] = [];
  private audio!: AudioManager;
  private musicText!: Phaser.GameObjects.Text;
  private aboutText?: Phaser.GameObjects.Text;
  private selectedIndex = 0;

  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    this.audio = AudioManager.get(this);
    this.audio.playBgm();
    this.input.once('pointerdown', () => this.audio.playBgm());

    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'bg_bridge').setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT).setAlpha(0.88);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 760, 460, 0x11181c, 0.72).setStrokeStyle(2, 0xd7bd6a);
    this.add.text(WINDOW_WIDTH / 2, 98, '一跃千年：古建奇旅', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '42px',
      color: '#ffe08a'
    }).setOrigin(0.5);
    this.add.text(WINDOW_WIDTH / 2, 148, '残页归卷，古法重光', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '24px',
      color: '#fff3d0'
    }).setOrigin(0.5);

    this.buttons = [
      new Button(this, WINDOW_WIDTH / 2, 235, 280, 54, '开始旅程', () => this.startGame()),
      new Button(this, WINDOW_WIDTH / 2, 302, 280, 54, '选择关卡', () => this.openLevelSelect()),
      new Button(this, WINDOW_WIDTH / 2, 369, 280, 54, '作品说明', () => this.showAbout())
    ];
    this.createMusicControls();

    new Button(this, WINDOW_WIDTH - 112, 42, 150, 38, '全屏', () => this.toggleFullscreen());
    this.add.text(18, WINDOW_HEIGHT - 24, 'Phaser Remake · F2 Debug Overlay', {
      fontFamily: 'Arial, sans-serif',
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
    this.aboutText?.destroy();
    this.aboutText = this.add.text(WINDOW_WIDTH / 2, 504, '数字媒体课程作品：以《营造法式》残页为线索，穿行四类中国古代建筑场景。', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '16px',
      color: '#dce6d6',
      align: 'center',
      wordWrap: { width: 720 }
    }).setOrigin(0.5);
  }

  private createMusicControls(): void {
    this.add.text(WINDOW_WIDTH / 2, 424, '音乐音量', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '16px',
      color: '#dce6d6'
    }).setOrigin(0.5);
    this.musicText = this.add.text(WINDOW_WIDTH / 2, 447, '', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#fff3d0'
    }).setOrigin(0.5);
    new Button(this, WINDOW_WIDTH / 2 - 112, 478, 52, 34, '-', () => this.changeVolume(-0.1));
    new Button(this, WINDOW_WIDTH / 2 - 48, 478, 52, 34, '+', () => this.changeVolume(0.1));
    new Button(this, WINDOW_WIDTH / 2 + 56, 478, 104, 34, '静音', () => this.toggleMute());
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
}
