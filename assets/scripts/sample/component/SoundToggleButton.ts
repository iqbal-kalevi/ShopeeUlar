import { _decorator, Component, Node, Button } from 'cc';
import { getSoundStateFromLocalStorage, updateLocalStorageSoundState } from '../../lib/util/localStorage';
import { ASSET_KEY } from '../enum/asset';
import { ShopeeSprite } from './ShopeeSprite';
const { ccclass, property } = _decorator;

@ccclass('SoundToggleButton')
export class SoundToggleButton extends Button {

  private soundButtonSprite?: ShopeeSprite;

  private readonly soundButtonOffKey = ASSET_KEY.SPRITE_SOUND_OFF;
  private readonly soundButtonOnKey = ASSET_KEY.SPRITE_SOUND_ON;

  start() {
    this.soundButtonSprite = this.getComponent(ShopeeSprite);
    this.syncButtonSprite();

    this.node.on(
      Node.EventType.TOUCH_END,
      () => {
        this.toggleSoundState();
      },
      this,
    );
  }

  /**
   * Toggle sound (audio) on/off for entire game audio related.
   * @param shouldOn Value for toggling sound manually, set `true` to turn it on (`false` to turn off)
   * or leave it empty to automatically toggle from the previous state.
   */
  public toggleSoundState(shouldOn?: boolean) {
    const currentSoundState = getSoundStateFromLocalStorage();
    updateLocalStorageSoundState(shouldOn || !currentSoundState);
    this.syncButtonSprite();
  }

  /**
   * Synchronize current sound/audio state with the button texture
   */
  private syncButtonSprite() {
    const isSoundStateOn = getSoundStateFromLocalStorage();
    this.soundButtonSprite?.setTexture(isSoundStateOn ? this.soundButtonOnKey : this.soundButtonOffKey);
  }
}


