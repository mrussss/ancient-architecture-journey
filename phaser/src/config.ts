import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { FinalScene } from './scenes/FinalScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameScene } from './scenes/GameScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { PreloadScene } from './scenes/PreloadScene';
import { StoryScene } from './scenes/StoryScene';
import { GRAVITY, WINDOW_HEIGHT, WINDOW_WIDTH } from './constants';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  backgroundColor: '#1b1d20',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    LevelSelectScene,
    StoryScene,
    GameScene,
    LevelCompleteScene,
    GameOverScene,
    FinalScene
  ]
};
