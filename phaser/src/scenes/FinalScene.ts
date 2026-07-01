import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { getStoryPages } from '../data/story';
import { Button } from '../ui/Button';

export class FinalScene extends Phaser.Scene {
  constructor() {
    super('FinalScene');
  }

  create(): void {
    const bgKey = this.textures.exists('comic_final_2') ? 'comic_final_2' : 'bg_taihe';
    const bg = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, bgKey).setAlpha(0.88);
    this.coverImage(bg);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x050607, 0.34);

    const panelX = WINDOW_WIDTH / 2;
    const panelY = WINDOW_HEIGHT / 2 + 12;
    this.add.image(panelX, panelY, 'ui_result_panel').setDisplaySize(760, 392).setAlpha(0.96);

    this.add.text(WINDOW_WIDTH / 2, 190, '古法重光', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '30px',
      color: '#ffe08a',
      stroke: '#3a260c',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(WINDOW_WIDTH / 2, 230, '四章残页已归卷，完整古建图卷重现。', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#efe2c5',
      align: 'center',
      fixedWidth: 560
    }).setOrigin(0.5);

    const bodyText = getStoryPages(4, 'final').map((page) => page.text).join('\n\n');
    const body = this.add.text(WINDOW_WIDTH / 2 - 280, 268, bodyText, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '16px',
      color: '#efe2c5',
      align: 'left',
      wordWrap: { width: 560 },
      fixedWidth: 560,
      fixedHeight: 78,
      lineSpacing: 6
    }).setOrigin(0, 0);
    this.fitTextHeight(body, 78, 14);

    new Button(this, WINDOW_WIDTH / 2 - 145, 420, 220, 42, '返回主菜单', () => this.scene.start('MainMenuScene'));
    new Button(this, WINDOW_WIDTH / 2 + 145, 420, 220, 42, '重新开始', () => {
      this.scene.start('StoryScene', { levelId: 1, storyType: 'intro', nextScene: 'GameScene' });
    }, 'primary');
  }

  private coverImage(image: Phaser.GameObjects.Image): void {
    const source = image.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(WINDOW_WIDTH / source.width, WINDOW_HEIGHT / source.height);
    image.setDisplaySize(source.width * scale, source.height * scale);
  }

  private fitTextHeight(text: Phaser.GameObjects.Text, maxHeight: number, minFontSize = 15): void {
    let fontSize = Number.parseInt(String(text.style.fontSize), 10);
    while (text.height > maxHeight && fontSize > minFontSize) {
      fontSize -= 1;
      text.setFontSize(fontSize);
    }
  }
}
