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
    const level = getLevel(this.levelId);
    this.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, level.backgroundKey).setDisplaySize(WINDOW_WIDTH, WINDOW_HEIGHT);
    this.add.rectangle(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT, 0x000000, 0.28);
    this.add.image(122, 352, 'player_idle').setDisplaySize(126, 168);

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
    this.dialogue?.setPage(this.pages[this.pageIndex]);
  }
}
