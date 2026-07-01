import Phaser from 'phaser';
import type { StoryPage } from '../data/story';

export class DialogueBox {
  private panel: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  private speakerText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private promptText: Phaser.GameObjects.Text;
  private fullText = '';
  private visibleChars = 0;
  private elapsed = 0;
  private lastRenderedText = '';
  private readonly charsPerSecond = 34;

  constructor(private scene: Phaser.Scene) {
    const panelX = 480;
    const panelY = 432;
    const panelW = 850;
    const panelH = 176;
    const safeLeft = 200;
    const safeTop = 362;
    const safeWidth = 560;
    const bodyTop = 398;
    const bodyMaxHeight = 82;

    this.panel = scene.textures.exists('ui_dialog_panel')
      ? scene.add.image(panelX, panelY, 'ui_dialog_panel').setDisplaySize(panelW, panelH).setAlpha(0.95).setDepth(30)
      : scene.add.rectangle(panelX, panelY, 840, 160, 0x11181c, 0.82).setStrokeStyle(2, 0xd7bd6a).setDepth(30);
    this.speakerText = scene.add.text(safeLeft, safeTop, '', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '20px',
      color: '#ffe08a',
      fixedWidth: safeWidth
    }).setDepth(31);
    this.bodyText = scene.add.text(safeLeft, bodyTop, '', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '19px',
      color: '#efe2c5',
      wordWrap: { width: safeWidth },
      fixedWidth: safeWidth,
      fixedHeight: bodyMaxHeight,
      lineSpacing: 5,
    }).setDepth(31);
    this.promptText = scene.add.text(700, 500, '空格 / 回车 / 点击', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '13px',
      color: '#c9d2c5'
    }).setDepth(31);
  }

  setPage(page: StoryPage): void {
    this.speakerText.setText(page.speaker ?? '');
    this.fullText = page.text;
    this.visibleChars = 0;
    this.elapsed = 0;
    this.lastRenderedText = '';
    this.bodyText.setText('');
  }

  update(delta: number): void {
    if (this.visibleChars >= this.fullText.length) {
      return;
    }
    this.elapsed += delta;
    this.visibleChars = Math.min(this.fullText.length, Math.floor((this.elapsed / 1000) * this.charsPerSecond));
    this.renderBodyText(this.fullText.slice(0, this.visibleChars));
  }

  completeInstantly(): boolean {
    if (this.visibleChars >= this.fullText.length) {
      return false;
    }
    this.visibleChars = this.fullText.length;
    this.renderBodyText(this.fullText);
    return true;
  }

  private renderBodyText(text: string): void {
    if (text === this.lastRenderedText) {
      return;
    }
    this.lastRenderedText = text;
    this.bodyText.setText(text);
    this.fitBodyText();
  }

  private fitBodyText(): void {
    const maxHeight = 82;
    let fontSize = 19;
    this.bodyText.setFontSize(fontSize);
    while (this.bodyText.height > maxHeight && fontSize > 15) {
      fontSize -= 1;
      this.bodyText.setFontSize(fontSize);
    }
  }
}
