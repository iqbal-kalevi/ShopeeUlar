import { BaseAsset } from './baseAsset';
import {
  _decorator,
  Node,
  AudioSource,
  AudioClip,
  assetManager,
  game,
} from 'cc';
import { BASE_AUDIO_EVENT } from '../enum/audio';
import { GAME_EVENT } from '../enum/game';
import { getKeyEnum } from '../util/asset';
import { getSoundStateFromLocalStorage } from '../util/localStorage';
import { ASSET_LOADER_EVENT } from '../enum/assetLoader';
const { ccclass, requireComponent, property, boolean: cBoolean } = _decorator;

@ccclass('BaseAudio')
@requireComponent(AudioSource)
export class BaseAudio<T> extends BaseAsset<T> {
  private audioSource?: AudioSource | null;

  private audioClip: AudioClip | null = null;

  constructor(name: string, audioKey: T, protected volume = 1) {
    super(name);
    this.assetKey = audioKey;
  }

  get audioKey() {
    return this.assetKey;
  }

  set audioKey(value: T | null) {
    this.assetKey !== value && this.audioSource?.stop();
    this.assetKey = value;
    this.audioClip = this.getAudioClip();
    this.setupAudio();
  }

  get loop() {
    return this.audioSource?.loop || false;
  }

  set loop(value: boolean) {
    if (this.node && !this.audioSource) {
      this.audioSource = this.getComponent(AudioSource);
    }

    if (this.audioSource) {
      this.audioSource.loop = value;
    }
  }

  onLoad() {
    game.on(GAME_EVENT.SOUND_STATE_CHANGE, this.onSoundStateChange, this);

    this.node.once(Node.EventType.NODE_DESTROYED, () => {
      game.off(GAME_EVENT.SOUND_STATE_CHANGE, this.onSoundStateChange, this);
    });
    this.reload(this.volume);
  }

  /**
   * Play the clip. Resume if paused.
   * @param vol Set new volume for audio source.
   */
  public play(vol?: number): void {
    this.reload();
    if (this.audioSource) {
      if (vol) this.setVolume(vol);
      this.audioSource.play();
      this.node.emit(BASE_AUDIO_EVENT.PLAY, this.audioKey);
    }
  }

  /**
   * Pause the clip.
   */
  public pause(): void {
    this.reload();
    if (this.audioSource) {
      this.audioSource.pause();
      this.node.emit(BASE_AUDIO_EVENT.PAUSE, this.audioKey);
    }
  }

  /**
   * Stop the clip.
   */
  public stop(): void {
    this.reload();
    if (this.audioSource) {
      this.audioSource.stop();
      this.node.emit(BASE_AUDIO_EVENT.STOP, this.audioKey);
    }
  }

  /**
   * Stop and play the clip.
   * @param vol Set new volume for audio source.
   */
  public replay(vol?: number): void {
    this.stop();
    this.play(vol);
  }

  public reload(vol?: number) {
    if (!this.audioSource?.clip) {
      this.audioSource = this.getComponent(AudioSource);
      this.audioClip = this.getAudioClip();
      this.setupAudio(vol);
    }
  }

  private onSoundStateChange() {
    this.setVolume(this.volume);
  }

  private isMuted() {
    return !getSoundStateFromLocalStorage();
  }

  private setVolume(volume: number) {
    const { audioSource } = this;

    if (!audioSource) return;

    if (this.isMuted()) {
      audioSource.volume = 0;
    } else {
      audioSource.volume = volume;
    }

    this.volume = volume;
  }

  private getAudioClip() {
    return assetManager.assets.get(getKeyEnum(this.assetKey)) as AudioClip;
  }

  private setupAudio(vol?: number) {
    const { audioSource, audioClip, volume } = this;

    if (!audioSource || !audioClip) return;

    audioSource.clip = audioClip;
    this.setVolume(vol ?? volume);
  }
}
