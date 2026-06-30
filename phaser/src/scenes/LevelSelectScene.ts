import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { levels } from '../data/levels';
import { Button } from '../ui/Button';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create(): void {
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'bg_huizhou').setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT).setAlpha(0.86);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 820, 430, 0x11181c, 0.74).setStrokeStyle(2, 0xd7bd6a);
    this.add.text(WINDOW_WIDTH / 2, 92, '选择关卡', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '34px',
      color: '#ffe08a'
    }).setOrigin(0.5);

    const positions = [
      [290, 205],
      [670, 205],
      [290, 330],
      [670, 330]
    ];
    levels.forEach((level, index) => {
      const [x, y] = positions[index];
      this.add.image(x, y - 18, level.backgroundKey).setDisplaySize(280, 92).setAlpha(0.62);
      new Button(this, x, y + 44, 320, 58, level.title, () => {
        this.scene.start('StoryScene', { levelId: level.id, storyType: 'intro', nextScene: 'GameScene' });
      });
      this.add.text(x, y + 86, level.subtitle, {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '14px',
        color: '#dce6d6'
      }).setOrigin(0.5);
    });

    new Button(this, WINDOW_WIDTH / 2, 474, 220, 46, '返回主菜单', () => this.scene.start('MainMenuScene'));
    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('MainMenuScene'));
  }
}
