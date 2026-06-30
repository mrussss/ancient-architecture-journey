import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';

export class ParallaxBackground {
  private image: Phaser.GameObjects.Image;
  private shade: Phaser.GameObjects.Rectangle;
  private displayWidth = WINDOW_WIDTH;

  constructor(private scene: Phaser.Scene, textureKey: string, private worldWidth: number) {
    this.image = scene.add.image(0, 0, textureKey).setOrigin(0, 0).setScrollFactor(0).setDepth(-20);
    const source = this.image.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(WINDOW_WIDTH / source.width, WINDOW_HEIGHT / source.height);
    this.displayWidth = source.width * scale;
    this.image.setDisplaySize(this.displayWidth, source.height * scale);
    this.shade = scene.add
      .rectangle(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT, 0x10202c, 0.08)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-19);
  }

  update(camera: Phaser.Cameras.Scene2D.Camera): void {
    const maxOffset = Math.max(0, this.displayWidth - WINDOW_WIDTH);
    const scrollRange = Math.max(1, this.worldWidth - WINDOW_WIDTH);
    const scrollRatio = Phaser.Math.Clamp(camera.scrollX / scrollRange, 0, 1);
    this.image.x = -maxOffset * scrollRatio;
    this.shade.setPosition(0, 0);
  }
}
