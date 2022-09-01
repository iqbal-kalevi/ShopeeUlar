/**
 * Events for BaseAudio
 */
export enum BASE_AUDIO_EVENT {
  /**
   * Emitted when play an audio clip.
   *
   * callback: (audioKey: string) => void;
   */
  PLAY = 'audio_play',

  /**
   * Emitted when pause the clip.
   *
   * callback: (audioKey: string) => void;
   */
  PAUSE = 'audio_pause',

  /**
   * Emitted when stop the clip.
   *
   * callback: (audioKey: string) => void;
   */
  STOP = 'audio_stop',
}
