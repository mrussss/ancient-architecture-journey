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
    const bg = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, level.backgroundKey).setAlpha(0.78);
    this.coverImage(bg);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x080000, 0.42);
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'ui_result_panel').setDisplaySize(560, 342).setTint(0xffd0c0).setAlpha(0.96);
    this.add.text(WINDOW_WIDTH / 2, 150, '旅程中断', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '40px',
      color: '#ffb0a0'
    }).setOrigin(0.5);
    this.add.text(WINDOW_WIDTH / 2, 205, '古卷微光尚未熄灭，建筑记忆仍在等待归卷。', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#fff3d0',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);
    new Button(this, WINDOW_WIDTH / 2, 284, 260, 48, '重新挑战', () => this.scene.start('GameScene', { levelId: this.levelId }), 'primary');
    new Button(this, WINDOW_WIDTH / 2, 342, 260, 46, '返回选关', () => this.scene.start('LevelSelectScene'));
    new Button(this, WINDOW_WIDTH / 2, 398, 260, 46, '返回主菜单', () => this.scene.start('MainMenuScene'));
  }

  private coverImage(image: Phaser.GameObjects.Image): void {
    const source = image.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(WINDOW_WIDTH / source.width, WINDOW_HEIGHT / source.height);
    image.setDisplaySize(source.width * scale, source.height * scale);
  }
}
