import Phaser from 'phaser';

export type ButtonVariant = 'primary' | 'secondary' | 'small';

export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  private hitZone: Phaser.GameObjects.Zone;
  private label: Phaser.GameObjects.Text;
  private visual: Phaser.GameObjects.Container;
  private selected = false;
  private onClick: () => void;
  private readonly baseTint = 0xffffff;
  private readonly variant: ButtonVariant;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    onClick: () => void,
    variant: ButtonVariant = 'secondary'
  ) {
    super(scene, x, y);
    this.setSize(width, height);
    this.onClick = onClick;
    this.variant = variant;

    const textureKey = this.getTextureKey(scene, variant);
    if (textureKey) {
      this.background = scene.add.image(0, 0, textureKey).setDisplaySize(width, height);
    } else {
      this.background = scene.add.rectangle(0, 0, width, height, 0x25323b, 0.88).setStrokeStyle(2, 0xd7bd6a);
    }

    const fontSize = Math.max(14, Math.min(22, Math.floor(height * (variant === 'small' ? 0.42 : 0.38))));
    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: `${fontSize}px`,
        color: this.getTextColor(variant),
        align: 'center'
      })
      .setOrigin(0.5);
    this.label.setStroke(variant === 'primary' ? '#fff1b8' : '#1a1208', variant === 'primary' ? 1 : 2);
    this.fitLabelToWidth(width - 36);
    scene.time.delayedCall(0, () => this.fitLabelToWidth(width - 36));
    this.hitZone = scene.add.zone(0, 0, width, height).setOrigin(0.5);
    this.hitZone.setInteractive({ useHandCursor: true });
    this.visual = scene.add.container(0, 0, [this.background, this.label]);

    this.add([this.visual, this.hitZone]);
    scene.add.existing(this);

    this.hitZone
      .on('pointerover', () => this.setSelected(true))
      .on('pointerout', () => this.setSelected(false))
      .on('pointerdown', () => this.press());
  }

  setSelected(value: boolean): this {
    this.selected = value;
    if (this.background instanceof Phaser.GameObjects.Rectangle) {
      this.background.setFillStyle(value ? 0x7a5d2a : 0x25323b, value ? 0.96 : 0.88);
      this.background.setStrokeStyle(2, value ? 0xffe08a : 0xd7bd6a);
    } else {
      this.background.setTint(value ? 0xffefbf : this.baseTint);
      this.background.setAlpha(value ? 1 : 0.96);
    }
    this.label.setColor(this.getTextColor(this.variant, value));
    this.scene.tweens.killTweensOf(this.visual);
    this.scene.tweens.add({ targets: this.visual, scale: value ? 1.03 : 1, duration: 80 });
    return this;
  }

  isSelected(): boolean {
    return this.selected;
  }

  press(): void {
    this.scene.tweens.add({
      targets: this.visual,
      scale: 0.97,
      duration: 45,
      yoyo: true
    });
    this.onClick();
  }

  private getTextureKey(scene: Phaser.Scene, variant: ButtonVariant): string | undefined {
    if (variant === 'primary' && scene.textures.exists('ui_button_primary')) {
      return 'ui_button_primary';
    }
    if (variant === 'secondary' && scene.textures.exists('ui_button_secondary')) {
      return 'ui_button_secondary';
    }
    if (variant === 'small' && scene.textures.exists('ui_button_secondary')) {
      return 'ui_button_secondary';
    }
    if (scene.textures.exists('ui_button')) {
      return 'ui_button';
    }
    return undefined;
  }

  private getTextColor(variant: ButtonVariant, selected = false): string {
    if (variant === 'primary') {
      return selected ? '#2b1b08' : '#3a260c';
    }
    return selected ? '#ffe08a' : '#fff3d0';
  }

  private fitLabelToWidth(maxWidth: number): void {
    let fontSize = Number.parseInt(String(this.label.style.fontSize), 10);
    while (this.label.width > maxWidth && fontSize > 13) {
      fontSize -= 1;
      this.label.setFontSize(fontSize);
    }
  }
}
