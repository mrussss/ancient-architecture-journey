import Phaser from 'phaser';
import type { StoryPage } from '../data/story';

export class DialogueBox {
  private panel: Phaser.GameObjects.Rectangle;
  private speakerText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private fullText = '';
  private visibleChars = 0;
  private elapsed = 0;
  private readonly charsPerSecond = 34;

  constructor(private scene: Phaser.Scene) {
    this.panel = scene.add.rectangle(480, 434, 840, 160, 0x11181c, 0.82).setStrokeStyle(2, 0xd7bd6a).setDepth(30);
    this.speakerText = scene.add.text(90, 370, '', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '22px',
      color: '#ffe08a'
    }).setDepth(31);
    this.bodyText = scene.add.text(90, 405, '', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '22px',
      color: '#fff8e8',
      wordWrap: { width: 780 }
    }).setDepth(31);
    scene.add.text(720, 492, '空格 / 回车 / 点击', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '14px',
      color: '#cdd8c9'
    }).setDepth(31);
  }

  setPage(page: StoryPage): void {
    this.speakerText.setText(page.speaker ?? '');
    this.fullText = page.text;
    this.visibleChars = 0;
    this.elapsed = 0;
    this.bodyText.setText('');
  }

  update(delta: number): void {
    if (this.visibleChars >= this.fullText.length) {
      return;
    }
    this.elapsed += delta;
    this.visibleChars = Math.min(this.fullText.length, Math.floor((this.elapsed / 1000) * this.charsPerSecond));
    this.bodyText.setText(this.fullText.slice(0, this.visibleChars));
  }

  completeInstantly(): boolean {
    if (this.visibleChars >= this.fullText.length) {
      return false;
    }
    this.visibleChars = this.fullText.length;
    this.bodyText.setText(this.fullText);
    return true;
  }
}
