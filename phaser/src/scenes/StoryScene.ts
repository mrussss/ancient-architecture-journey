import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '../constants';
import { getLevel } from '../data/levels';
import { getStoryPages, type StoryPage, type StoryType } from '../data/story';
import { DialogueBox } from '../ui/DialogueBox';

interface StoryInitData {
  levelId: number;
  storyType: StoryType;
  nextScene: string;
}

export class StoryScene extends Phaser.Scene {
  private levelId = 1;
  private storyType: StoryType = 'intro';
  private nextScene = 'GameScene';
  private pages: StoryPage[] = [];
  private pageIndex = 0;
  private dialogue?: DialogueBox;
  private backgroundLayer?: Phaser.GameObjects.Image;
  private shadeLayer?: Phaser.GameObjects.Rectangle;
  private portrait?: Phaser.GameObjects.Image;

  constructor() {
    super('StoryScene');
  }

  init(data: StoryInitData): void {
    this.levelId = data.levelId;
    this.storyType = data.storyType;
    this.nextScene = data.nextScene;
    this.pages = getStoryPages(this.levelId, this.storyType);
    this.pageIndex = 0;
  }

  create(): void {
    this.renderPageArt(this.pages[this.pageIndex]);
    this.dialogue = new DialogueBox(this);
    this.dialogue.setPage(this.pages[this.pageIndex]);

    this.input.keyboard!.on('keydown-SPACE', () => this.nextPage());
    this.input.keyboard!.on('keydown-ENTER', () => this.nextPage());
    this.input.on('pointerdown', () => this.nextPage());
    this.cameras.main.fadeIn(220, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    this.dialogue?.update(delta);
  }

  private nextPage(): void {
    if (this.dialogue?.completeInstantly()) {
      return;
    }
    this.pageIndex += 1;
    if (this.pageIndex >= this.pages.length) {
      this.scene.start(this.nextScene, { levelId: this.levelId });
      return;
    }
    const page = this.pages[this.pageIndex];
    this.renderPageArt(page);
    this.dialogue?.setPage(page);
  }

  private renderPageArt(page: StoryPage): void {
    this.backgroundLayer?.destroy();
    this.shadeLayer?.destroy();
    this.portrait?.destroy();

    if (page.comicKey) {
      if (this.textures.exists(page.comicKey)) {
        this.backgroundLayer = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, page.comicKey);
        this.coverImage(this.backgroundLayer);
        this.backgroundLayer.setDepth(0);
        this.backgroundLayer.setAlpha(0);
        this.tweens.add({ targets: this.backgroundLayer, alpha: 1, duration: 180 });
      } else {
        console.warn(`Missing comic texture: ${page.comicKey}`);
        const level = getLevel(this.levelId);
        this.backgroundLayer = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, level.backgroundKey);
        this.backgroundLayer.setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT).setDepth(0);
      }
      this.shadeLayer = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x000000, 0.1).setDepth(1);
      return;
    }

    const level = getLevel(this.levelId);
    this.backgroundLayer = this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, level.backgroundKey).setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT).setDepth(0);
    this.shadeLayer = this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x000000, 0.28).setDepth(1);
    this.portrait = this.add.image(122, 352, 'player_idle').setDisplaySize(126, 168).setDepth(2);
  }

  private coverImage(image: Phaser.GameObjects.Image): void {
    const texture = image.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.max(WINDOW_WIDTH / texture.width, WINDOW_HEIGHT / texture.height);
    image.setDisplaySize(texture.width * scale, texture.height * scale);
  }
}
