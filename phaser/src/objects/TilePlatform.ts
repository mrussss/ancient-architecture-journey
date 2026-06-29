import Phaser from 'phaser';
import { materialForTile } from '../data/materials';
import type { RectData } from '../data/levels';

export class TilePlatform {
  readonly collider: Phaser.Physics.Arcade.StaticImage;
  readonly visual: Phaser.GameObjects.TileSprite;
  readonly rim: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.StaticGroup, rect: RectData, fallbackTileKey: string) {
    const tileKey = rect.textureKey ?? fallbackTileKey;
    const material = materialForTile(tileKey);
    const centerX = rect.x + rect.w / 2;
    const centerY = rect.y + rect.h / 2;

    this.visual = scene.add.tileSprite(centerX, centerY, rect.w, rect.h, material.textureKey);
    this.visual.setOrigin(0.5);
    this.visual.setTint(material.topTint);
    this.visual.setTileScale(0.12, 0.12);
    this.visual.setDepth(2);

    const rimHeight = Math.min(6, Math.max(3, rect.h * 0.18));
    this.rim = scene.add.rectangle(centerX, rect.y + rimHeight / 2, rect.w, rimHeight, material.edgeTint, 0.72);
    this.rim.setOrigin(0.5);
    this.rim.setDepth(3);

    const shadow = scene.add.rectangle(centerX, rect.y + rect.h - 4, rect.w, 8, material.sideTint, 0.45);
    shadow.setOrigin(0.5);
    shadow.setDepth(3);

    this.collider = group.create(centerX, centerY, tileKey) as Phaser.Physics.Arcade.StaticImage;
    this.collider.setDisplaySize(rect.w, rect.h);
    this.collider.setVisible(false);
    this.collider.refreshBody();
  }
}
