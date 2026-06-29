import Phaser from 'phaser';
import type { LevelData } from '../data/levels';

export class Hud {
  private container: Phaser.GameObjects.Container;
  private hpText: Phaser.GameObjects.Text;
  private pagesText: Phaser.GameObjects.Text;
  private levelText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, level: LevelData) {
    const panel = scene.add.rectangle(0, 0, 270, 100, 0x11181c, 0.72).setOrigin(0).setStrokeStyle(1, 0xd7bd6a);
    this.hpText = scene.add.text(16, 14, '', { fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#fff0d0' });
    this.pagesText = scene.add.text(16, 42, '', { fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#fff0d0' });
    this.levelText = scene.add.text(16, 70, level.title, { fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#dce6d6' });
    this.container = scene.add.container(14, 12, [panel, this.hpText, this.pagesText, this.levelText]).setScrollFactor(0).setDepth(1000);
  }

  update(hp: number, pages: number, totalPages: number): void {
    this.hpText.setText(`HP: ${'♥ '.repeat(Math.max(0, hp))}`);
    this.pagesText.setText(`Pages: ${pages} / ${totalPages}`);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
