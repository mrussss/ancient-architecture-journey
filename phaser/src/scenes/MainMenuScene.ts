import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { Button } from '../ui/Button';

export class MainMenuScene extends Phaser.Scene {
  private buttons: Button[] = [];
  private selectedIndex = 0;

  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'bg_bridge').setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT).setAlpha(0.88);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 760, 410, 0x11181c, 0.72).setStrokeStyle(2, 0xd7bd6a);
    this.add.text(WINDOW_WIDTH / 2, 112, '一跃千年：古建奇旅', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '42px',
      color: '#ffe08a'
    }).setOrigin(0.5);
    this.add.text(WINDOW_WIDTH / 2, 164, 'Ancient Architecture Journey', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#fff3d0'
    }).setOrigin(0.5);

    this.buttons = [
      new Button(this, WINDOW_WIDTH / 2, 255, 280, 54, 'Start Game', () => this.startGame()),
      new Button(this, WINDOW_WIDTH / 2, 322, 280, 54, 'Select Level', () => this.scene.start('LevelSelectScene')),
      new Button(this, WINDOW_WIDTH / 2, 389, 280, 54, 'Credits / About', () => this.showAbout())
    ];
    new Button(this, WINDOW_WIDTH - 112, 42, 150, 38, 'Fullscreen', () => this.toggleFullscreen());
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
    this.scene.start('StoryScene', { levelId: 1, storyType: 'intro', nextScene: 'GameScene' });
  }

  private showAbout(): void {
    this.add.text(WINDOW_WIDTH / 2, 462, 'C++/SDL2 版本同仓库保留，Phaser 版用于网页展示。', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#dce6d6'
    }).setOrigin(0.5);
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
