import Phaser from 'phaser';

export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private selected = false;
  private onClick: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, text: string, onClick: () => void) {
    super(scene, x, y);
    this.setSize(width, height);
    this.onClick = onClick;

    this.background = scene.add.rectangle(0, 0, width, height, 0x3d5260, 0.9).setStrokeStyle(2, 0xd7bd6a);
    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '20px',
        color: '#fff3d0',
        align: 'center'
      })
      .setOrigin(0.5);

    this.add([this.background, this.label]);
    scene.add.existing(this);

    this.background
      .setInteractive({
        hitArea: new Phaser.Geom.Rectangle(-width / 2 - 8, -height / 2 - 8, width + 16, height + 16),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true
      })
      .on('pointerover', () => this.setSelected(true))
      .on('pointerout', () => this.setSelected(false))
      .on('pointerdown', () => this.press());
  }

  setSelected(value: boolean): this {
    this.selected = value;
    this.background.setFillStyle(value ? 0xb88743 : 0x3d5260, 0.95);
    this.background.setStrokeStyle(2, value ? 0xffe08a : 0xd7bd6a);
    this.label.setColor(value ? '#ffffff' : '#fff3d0');
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({ targets: this, scale: value ? 1.03 : 1, duration: 80 });
    return this;
  }

  isSelected(): boolean {
    return this.selected;
  }

  press(): void {
    this.scene.tweens.add({
      targets: this,
      scale: 0.97,
      duration: 45,
      yoyo: true
    });
    this.onClick();
  }
}
