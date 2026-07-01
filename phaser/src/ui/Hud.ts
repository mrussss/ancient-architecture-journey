import Phaser from 'phaser';
import { MAX_HP } from '../constants';
import type { LevelData } from '../data/levels';

export class Hud {
  private container: Phaser.GameObjects.Container;
  private hearts: Phaser.GameObjects.Image[] = [];
  private pagesText: Phaser.GameObjects.Text;
  private levelText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, level: LevelData) {
    const panel = scene.textures.exists('ui_hud_panel')
      ? scene.add.image(0, 0, 'ui_hud_panel').setOrigin(0).setDisplaySize(354, 118).setAlpha(0.96)
      : scene.add.rectangle(0, 0, 354, 118, 0x11181c, 0.72).setOrigin(0).setStrokeStyle(1, 0xd7bd6a);

    for (let i = 0; i < MAX_HP; i += 1) {
      const key = scene.textures.exists('icon_heart_full') ? 'icon_heart_full' : 'ui_heart';
      const heart = scene.add.image(26 + i * 30, 28, key).setDisplaySize(24, 24);
      this.hearts.push(heart);
    }

    const pageIcon = scene.textures.exists('icon_page')
      ? scene.add.image(28, 62, 'icon_page').setDisplaySize(24, 24)
      : scene.add.image(28, 62, 'item_page').setDisplaySize(22, 26);

    this.pagesText = scene.add.text(48, 50, '', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#fff0d0'
    });
    this.levelText = scene.add.text(20, 84, `当前：${this.shortTitle(level.title)}`, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '14px',
      color: '#dce6d6',
      fixedWidth: 314
    });
    this.container = scene.add
      .container(24, 20, [panel, ...this.hearts, pageIcon, this.pagesText, this.levelText])
      .setScrollFactor(0)
      .setDepth(1000);
  }

  update(hp: number, pages: number, totalPages: number): void {
    this.hearts.forEach((heart, index) => {
      if (heart.scene.textures.exists('icon_heart_full') && heart.scene.textures.exists('icon_heart_empty')) {
        heart.setTexture(index < hp ? 'icon_heart_full' : 'icon_heart_empty');
      }
      heart.setAlpha(index < hp ? 1 : 0.48);
    });
    this.pagesText.setText(`残页：${pages} / ${totalPages}`);
  }

  destroy(): void {
    this.container.destroy(true);
  }

  private shortTitle(title: string): string {
    return title.split('：')[0] ?? title;
  }
}
