import Phaser from 'phaser';
import { AchievementManager, type AchievementId } from '../systems/AchievementManager';

export class AchievementToast {
  static show(scene: Phaser.Scene, ids: AchievementId[]): void {
    if (ids.length === 0) {
      return;
    }

    const achievements = AchievementManager.list().filter((item) => ids.includes(item.id));
    achievements.forEach((achievement, index) => {
      this.showOne(scene, achievement.title, achievement.description, index);
    });
  }

  private static showOne(scene: Phaser.Scene, title: string, description: string, index: number): void {
    const startX = -360;
    const targetX = 24;
    const baseY = scene.scene.key === 'StoryScene' ? 292 : 394;
    const y = baseY - index * 78;

    const container = scene.add.container(startX, y).setScrollFactor(0).setDepth(5000);
    const bg = scene.add
      .rectangle(0, 0, 330, 64, 0x121417, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xd7bd6a);
    const iconKey = scene.textures.exists('ui_achievement_badge') ? 'ui_achievement_badge' : 'icon_page';
    const icon = scene.add.image(34, 32, iconKey).setDisplaySize(38, 38);
    const titleText = scene.add.text(64, 10, `成就解锁：${title}`, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '15px',
      color: '#ffe08a',
      fixedWidth: 250
    });
    const descText = scene.add.text(64, 34, description, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '12px',
      color: '#efe2c5',
      fixedWidth: 250
    });

    container.add([bg, icon, titleText, descText]);
    scene.tweens.add({
      targets: container,
      x: targetX,
      duration: 280,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        scene.time.delayedCall(2600, () => {
          scene.tweens.add({
            targets: container,
            x: startX,
            alpha: 0,
            duration: 260,
            ease: 'Cubic.easeIn',
            onComplete: () => container.destroy(true)
          });
        });
      }
    });
  }
}
