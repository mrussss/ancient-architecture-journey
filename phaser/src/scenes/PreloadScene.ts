import Phaser from 'phaser';
import { imageAssets } from '../data/assets';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const barBg = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, 520, 20, 0x30363d);
    const bar = this.add.rectangle(WINDOW_WIDTH / 2 - 260, WINDOW_HEIGHT / 2, 0, 20, 0xd7bd6a).setOrigin(0, 0.5);
    this.add.text(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 - 58, 'Loading Ancient Architecture Journey', {
      fontFamily: 'Arial, sans-serif',
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
  }

  create(): void {
    if (!this.anims.exists('xiaoyan-walk')) {
      this.anims.create({
        key: 'xiaoyan-walk',
        frames: [
          { key: 'player_walk_1' },
          { key: 'player_walk_2' },
          { key: 'player_walk_3' },
          { key: 'player_walk_4' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }
    this.scene.start('MainMenuScene');
  }
}
