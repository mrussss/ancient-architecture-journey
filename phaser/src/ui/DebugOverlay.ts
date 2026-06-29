import Phaser from 'phaser';
import type { LevelData } from '../data/levels';
import type { LevelValidationReport } from '../utils/levelValidation';

export class DebugOverlay {
  private graphics: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private visible = false;

  constructor(
    private scene: Phaser.Scene,
    private level: LevelData,
    private report: LevelValidationReport,
    private player: Phaser.Physics.Arcade.Sprite,
    private goal: Phaser.Physics.Arcade.StaticImage
  ) {
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(1000);
    this.graphics.setVisible(false);
    this.text = scene.add
      .text(14, 14, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.58)',
        padding: { x: 8, y: 6 }
      })
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);
  }

  toggle(): void {
    this.visible = !this.visible;
    this.graphics.setVisible(this.visible);
    this.text.setVisible(this.visible);
    this.render();
  }

  update(): void {
    if (this.visible) {
      this.render();
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  private render(): void {
    this.graphics.clear();
    if (!this.visible) {
      return;
    }

    this.graphics.lineStyle(2, 0x35e66b, 0.88);
    for (const platform of this.level.platforms) {
      this.graphics.strokeRect(platform.x, platform.y, platform.w, platform.h);
    }

    this.graphics.lineStyle(2, 0xff4545, 0.9);
    for (const trap of this.level.traps) {
      this.graphics.strokeRect(trap.x, trap.y, trap.w, trap.h);
    }

    this.graphics.lineStyle(2, 0xffd84a, 0.95);
    for (const enemy of this.level.enemies) {
      const y = enemy.y + enemy.h - 5;
      this.graphics.lineBetween(enemy.leftLimit, y, enemy.rightLimit, y);
      this.graphics.fillStyle(0xffd84a, 0.95);
      this.graphics.fillTriangle(enemy.leftLimit, y, enemy.leftLimit + 8, y - 5, enemy.leftLimit + 8, y + 5);
      this.graphics.fillTriangle(enemy.rightLimit, y, enemy.rightLimit - 8, y - 5, enemy.rightLimit - 8, y + 5);
      this.graphics.lineStyle(2, 0xff9c35, 0.95);
      this.graphics.strokeRect(enemy.x - enemy.w / 2, enemy.y, enemy.w, enemy.h);
      this.graphics.lineStyle(2, 0xffd84a, 0.95);
    }

    this.graphics.fillStyle(0x4aa3ff, 0.9);
    for (const page of this.level.pages) {
      this.graphics.fillCircle(page.x, page.y, 7);
    }

    this.graphics.lineStyle(2, 0xffffff, 0.95);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.graphics.strokeRect(playerBody.x, playerBody.y, playerBody.width, playerBody.height);

    this.graphics.lineStyle(2, 0xc95cff, 0.95);
    const goalBody = this.goal.body as Phaser.Physics.Arcade.StaticBody;
    this.graphics.strokeRect(goalBody.x, goalBody.y, goalBody.width, goalBody.height);

    this.text.setText([
      `F2 Debug Overlay | F3 Validation Report`,
      `${this.report.levelTitle}`,
      `platforms=${this.report.platformCount} traps=${this.report.trapCount} enemies=${this.report.enemyCount} pages=${this.report.pageCount}`,
      `warnings=${this.report.warnings.length}`,
      ...this.report.warnings.slice(0, 5).map((warning) => `${warning.code}: ${warning.message}`)
    ]);
  }
}
