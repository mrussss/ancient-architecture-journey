import Phaser from 'phaser';

const BGM_KEY = 'bgm_pavilion';
const DEFAULT_VOLUME = 0.3;
const VOLUME_STORAGE_KEY = 'ancient_architecture_bgm_volume';
const MUTED_STORAGE_KEY = 'ancient_architecture_bgm_muted';

export class AudioManager {
  private static instance?: AudioManager;
  private bgm?: Phaser.Sound.BaseSound;
  private volume = DEFAULT_VOLUME;
  private muted = false;

  private constructor(private scene: Phaser.Scene) {
    this.loadSettings();
    this.applySettings();
  }

  static get(scene: Phaser.Scene): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager(scene);
    } else {
      AudioManager.instance.scene = scene;
      AudioManager.instance.applySettings();
    }
    return AudioManager.instance;
  }

  playBgm(): void {
    if (!this.scene.cache.audio.exists(BGM_KEY)) {
      console.warn(`Missing BGM audio asset: ${BGM_KEY}`);
      return;
    }

    if (!this.bgm || this.bgm.pendingRemove) {
      this.bgm = this.scene.sound.add(BGM_KEY, { loop: true, volume: 1 });
    }

    this.applySettings();
    if (!this.bgm.isPlaying) {
      this.bgm.play({ loop: true, volume: 1 });
    }
  }

  setVolume(value: number): void {
    this.volume = Phaser.Math.Clamp(Number(value.toFixed(2)), 0, 1);
    this.saveSettings();
    this.applySettings();
  }

  getVolume(): number {
    return this.volume;
  }

  toggleMute(): void {
    this.muted = !this.muted;
    this.saveSettings();
    this.applySettings();
  }

  isMuted(): boolean {
    return this.muted;
  }

  private applySettings(): void {
    this.scene.sound.volume = this.muted ? 0 : this.volume;
  }

  private loadSettings(): void {
    const storedVolume = this.readStorage(VOLUME_STORAGE_KEY);
    const parsedVolume = storedVolume === null ? Number.NaN : Number.parseFloat(storedVolume);
    if (Number.isFinite(parsedVolume)) {
      this.volume = Phaser.Math.Clamp(parsedVolume, 0, 1);
    }
    this.muted = this.readStorage(MUTED_STORAGE_KEY) === 'true';
  }

  private saveSettings(): void {
    this.writeStorage(VOLUME_STORAGE_KEY, this.volume.toFixed(2));
    this.writeStorage(MUTED_STORAGE_KEY, String(this.muted));
  }

  private readStorage(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // localStorage can be unavailable in privacy modes; audio still works for the session.
    }
  }
}
