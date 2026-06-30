import Phaser from 'phaser';
import { audioAssets, imageAssets, spriteSheetAssets } from '../data/assets';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const barBg = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 520, 20, 0x30363d);
    const bar = this.add.rectangle(WINDOW_WIDTH / 2 - 260, WINDOW_HEIGHT / 2, 0, 20, 0xd7bd6a).setOrigin(0, 0.5);
    this.add.text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 - 58, '正在展开古建图卷', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '24px',
      color: '#fff3d0'
    }).setOrigin(0.5);

    this.load.on('progress', (progress: number) => {
      bar.width = 520 * progress;
    });
    this.load.on('complete', () => {
      barBg.destroy();
      bar.destroy();
    });

    for (const asset of imageAssets) {
      this.load.image(asset.key, asset.path);
    }
    for (const asset of spriteSheetAssets) {
      this.load.spritesheet(asset.key, asset.path, {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight
      });
    }
    for (const asset of audioAssets) {
      this.load.audio(asset.key, asset.path);
    }
  }

  create(): void {
    if (!this.anims.exists('xiaoyan-walk')) {
      this.anims.create({
        key: 'xiaoyan-walk',
        frames: this.anims.generateFrameNumbers('xiaoyan_sheet', { start: 1, end: 4 }),
        frameRate: 8,
        repeat: -1
      });
    }
    this.scene.start('MainMenuScene');
  }
}
