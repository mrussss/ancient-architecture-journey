import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { getLevel } from '../data/levels';
import { Button } from '../ui/Button';

interface LevelCompleteData {
  levelId: number;
}

export class LevelCompleteScene extends Phaser.Scene {
  private levelId = 1;

  constructor() {
    super('LevelCompleteScene');
  }

  init(data: LevelCompleteData): void {
    this.levelId = data.levelId ?? 1;
  }

  create(): void {
    const level = getLevel(this.levelId);
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, level.backgroundKey).setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT).setAlpha(0.86);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 560, 360, 0x11181c, 0.78).setStrokeStyle(2, 0xd7bd6a);
    this.add.text(WINDOW_WIDTH / 2, 145, '残页归卷', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '38px',
      color: '#ffe08a'
    }).setOrigin(0.5);
    this.add.text(WINDOW_WIDTH / 2, 198, '本章残页已收齐', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '22px',
      color: '#fff3d0'
    }).setOrigin(0.5);
    new Button(this, WINDOW_WIDTH / 2, 270, 260, 52, '继续旅程', () => {
      this.scene.start('StoryScene', { levelId: this.levelId + 1, storyType: 'intro', nextScene: 'GameScene' });
    });
    new Button(this, WINDOW_WIDTH / 2, 335, 260, 52, '重访本章', () => this.scene.start('GameScene', { levelId: this.levelId }));
    new Button(this, WINDOW_WIDTH / 2, 400, 260, 52, '返回选关', () => this.scene.start('LevelSelectScene'));
  }
}
