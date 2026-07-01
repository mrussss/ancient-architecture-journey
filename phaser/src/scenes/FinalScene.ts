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
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 12, 'ui_result_panel').setDisplaySize(760, 392).setAlpha(0.96);
    this.add.text(WINDOW_WIDTH / 2, 120, '古法重光', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '40px',
      color: '#ffe08a'
    }).setOrigin(0.5);
    const text = ['四章残页已归卷，完整古建图卷重现。', ...getStoryPages(4, 'final').map((page) => page.text)].join('\n\n');
    this.add.text(WINDOW_WIDTH / 2, 245, text, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '20px',
      color: '#fff8e8',
      align: 'center',
      wordWrap: { width: 650 },
      lineSpacing: 7
    }).setOrigin(0.5);
    new Button(this, WINDOW_WIDTH / 2 - 145, 438, 240, 48, '返回主菜单', () => this.scene.start('MainMenuScene'));
    new Button(this, WINDOW_WIDTH / 2 + 145, 438, 240, 48, '重新开始', () => {
      this.scene.start('StoryScene', { levelId: 1, storyType: 'intro', nextScene: 'GameScene' });
    }, 'primary');
  }

  private coverImage(image: Phaser.GameObjects.Image): void {
    const source = image.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(WINDOW_WIDTH / source.width, WINDOW_HEIGHT / source.height);
    image.setDisplaySize(source.width * scale, source.height * scale);
  }
}
