import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { getLevel } from '../data/levels';
import { Button } from '../ui/Button';

interface GameOverData {
  levelId: number;
}

export class GameOverScene extends Phaser.Scene {
  private levelId = 1;

  constructor() {
    super('GameOverScene');
  }

  init(data: GameOverData): void {
    this.levelId = data.levelId ?? 1;
  }

  create(): void {
    const level = getLevel(this.levelId);
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, level.backgroundKey).setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT).setAlpha(0.75);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 520, 320, 0x11181c, 0.82).setStrokeStyle(2, 0xb84d4d);
    this.add.text(WINDOW_WIDTH / 2, 160, '时空迷途', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '42px',
      color: '#ffb0a0'
    }).setOrigin(0.5);
    new Button(this, WINDOW_WIDTH / 2, 250, 260, 52, '重新挑战', () => this.scene.start('GameScene', { levelId: this.levelId }));
    new Button(this, WINDOW_WIDTH / 2, 315, 260, 52, '返回选关', () => this.scene.start('LevelSelectScene'));
    new Button(this, WINDOW_WIDTH / 2, 380, 260, 52, '返回主菜单', () => this.scene.start('MainMenuScene'));
  }
}
