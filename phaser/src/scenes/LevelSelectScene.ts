import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { levels } from '../data/levels';
import { Button } from '../ui/Button';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create(): void {
    const bg = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 'bg_huizhou_wide').setAlpha(0.78);
    this.coverImage(bg);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x050607, 0.34);
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 8, 'ui_menu_panel').setDisplaySize(870, 486).setAlpha(0.92);
    this.add.text(WINDOW_WIDTH / 2, 70, '选择关卡', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '34px',
      color: '#ffe08a'
    }).setOrigin(0.5);

    const positions = [
      [286, 194],
      [674, 194],
      [286, 346],
      [674, 346]
    ];
    levels.forEach((level, index) => {
      const [x, y] = positions[index];
      const card = this.add.container(x, y);
      const cardPanel = this.add.image(0, 0, 'ui_level_card').setDisplaySize(340, 132).setAlpha(0.96);
      const thumb = this.add.image(0, -28, level.backgroundKey).setDisplaySize(292, 58).setAlpha(0.72);
      const title = this.add.text(-140, -4, level.title, {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '17px',
        color: '#ffe08a',
        fixedWidth: 280
      }).setOrigin(0, 0.5);
      const subtitle = this.add.text(-140, 23, level.subtitle, {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '13px',
        color: '#dce6d6',
        fixedWidth: 190
      }).setOrigin(0, 0.5);
      const progress = this.add.text(-140, 47, `残页：0 / ${level.pages.length}`, {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '12px',
        color: '#fff3d0',
        fixedWidth: 120
      }).setOrigin(0, 0.5);
      const enter = new Button(this, 88, 44, 116, 34, '进入章节', () => {
        this.scene.start('StoryScene', { levelId: level.id, storyType: 'intro', nextScene: 'GameScene' });
      }, 'small');
      card.add([cardPanel, thumb, title, subtitle, progress, enter]);
    });

    new Button(this, WINDOW_WIDTH / 2, 492, 220, 42, '返回主菜单', () => this.scene.start('MainMenuScene'));
    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('MainMenuScene'));
  }

  private coverImage(image: Phaser.GameObjects.Image): void {
    const source = image.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(WINDOW_WIDTH / source.width, WINDOW_HEIGHT / source.height);
    image.setDisplaySize(source.width * scale, source.height * scale);
  }
}
