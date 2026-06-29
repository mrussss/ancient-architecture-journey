import Phaser from 'phaser';

export interface ControlState {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
  attackPressed: boolean;
  restartPressed: boolean;
  escapePressed: boolean;
}

export class Controls {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = scene.input.keyboard!.addKeys('A,D,W,S,J,R,SPACE,ENTER,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
  }

  read(): ControlState {
    return {
      left: this.cursors.left.isDown || this.keys.A.isDown,
      right: this.cursors.right.isDown || this.keys.D.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.cursors.up),
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keys.J),
      restartPressed: Phaser.Input.Keyboard.JustDown(this.keys.R),
      escapePressed: Phaser.Input.Keyboard.JustDown(this.keys.ESC)
    };
  }
}
