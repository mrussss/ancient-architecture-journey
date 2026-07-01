import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { getLevel } from '../data/levels';
import { Button } from '../ui/Button';

interface LevelCompleteData {
  levelId: number;
  pagesCollected?: number;
  totalPages?: number;
}

export class LevelCompleteScene extends Phaser.Scene {
  private levelId = 1;
  private pagesCollected = 0;
  private totalPages = 0;

  constructor() {
    super('LevelCompleteScene');
  }

  init(data: LevelCompleteData): void {
    this.levelId = data.levelId ?? 1;
    const level = getLevel(this.levelId);
    this.totalPages = data.totalPages ?? level.pages.length;
    this.pagesCollected = data.pagesCollected ?? this.totalPages;
  }

  create(): void {
    const level = getLevel(this.levelId);
    const bg = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, level.backgroundKey).setAlpha(0.84);
    this.coverImage(bg);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x050607, 0.36);
    const panelX = WINDOW_WIDTH / 2;
    const panelY = WINDOW_HEIGHT / 2;
    this.add.image(panelX, panelY, 'ui_result_panel').setDisplaySize(640, 392).setAlpha(0.98);
    this.add.text(WINDOW_WIDTH / 2, 112, `${level.title.split('：')[0]}完成`, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '32px',
      color: '#ffe08a'
    }).setOrigin(0.5);
    this.add.text(WINDOW_WIDTH / 2, 160, `残页归卷：${this.pagesCollected} / ${this.totalPages}`, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '20px',
      color: '#e8dcc2'
    }).setOrigin(0.5);
    this.add.text(WINDOW_WIDTH / 2 - 250, 205, this.summaryForLevel(this.levelId), {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '17px',
      color: '#efe2c5',
      align: 'center',
      wordWrap: { width: 500 },
      fixedWidth: 500,
      fixedHeight: 70,
      lineSpacing: 6
    }).setOrigin(0, 0);
    new Button(this, WINDOW_WIDTH / 2, 312, 250, 48, '继续下一章', () => {
      this.scene.start('StoryScene', { levelId: this.levelId + 1, storyType: 'intro', nextScene: 'GameScene' });
    }, 'primary');
    new Button(this, WINDOW_WIDTH / 2, 368, 250, 44, '重访本章', () => this.scene.start('GameScene', { levelId: this.levelId }));
    new Button(this, WINDOW_WIDTH / 2, 420, 250, 44, '返回选关', () => this.scene.start('LevelSelectScene'));
  }

  private summaryForLevel(levelId: number): string {
    const summaries: Record<number, string> = {
      1: '石拱的弧线重新清晰，古桥记忆已被修复。',
      2: '屋檐与梁架在光中重现，民居记忆已被修复。',
      3: '门楼与堂屋秩序归位，县署记忆已被修复。'
    };
    return summaries[levelId] ?? '建筑记忆已被修复。';
  }

  private coverImage(image: Phaser.GameObjects.Image): void {
    const source = image.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(WINDOW_WIDTH / source.width, WINDOW_HEIGHT / source.height);
    image.setDisplaySize(source.width * scale, source.height * scale);
  }
}
