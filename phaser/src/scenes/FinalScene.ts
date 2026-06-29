import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { getStoryPages } from '../data/story';
import { Button } from '../ui/Button';

export class FinalScene extends Phaser.Scene {
  constructor() {
    super('FinalScene');
  }

  create(): void {
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'bg_taihe').setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT).setAlpha(0.86);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 760, 380, 0x11181c, 0.78).setStrokeStyle(2, 0xd7bd6a);
    this.add.text(WINDOW_WIDTH / 2, 126, '古建奇旅完成', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '40px',
      color: '#ffe08a'
    }).setOrigin(0.5);
    const text = getStoryPages(4, 'final').map((page) => page.text).join('\n\n');
    this.add.text(WINDOW_WIDTH / 2, 245, text, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '22px',
      color: '#fff8e8',
      align: 'center',
      wordWrap: { width: 660 }
    }).setOrigin(0.5);
    new Button(this, WINDOW_WIDTH / 2, 435, 260, 52, 'Main Menu', () => this.scene.start('MainMenuScene'));
  }
}
