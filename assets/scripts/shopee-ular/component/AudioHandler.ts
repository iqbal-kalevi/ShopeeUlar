import { _decorator, Component, Node, AudioSource, instantiate, Prefab, game } from "cc";
import { GAME_EVENT } from "../../lib/enum/game";
import { getSoundStateFromLocalStorage } from "../../lib/util/localStorage";
import { ASSET_KEY } from "../enum/asset";
import { ShopeeAudio } from "./ShopeeAudio";
const { ccclass, property } = _decorator;

export interface IAudio {
  key: ASSET_KEY;
  source: AudioSource;
  isLoop: Boolean;
}

@ccclass("Audio")
class Audio {
  @property({ type: ASSET_KEY })
  public key: ASSET_KEY;
  @property({ type: Boolean })
  public isLoop: boolean;
  @property({ type: Number })
  public volume: number;
  public source: AudioSource;
  public shopeeAudio: ShopeeAudio;
}

@ccclass("AudioHandler")
export class AudioHandler extends Component {
  public static instance: AudioHandler;
  @property({type: Prefab})
  public audioPrefab
  @property({ type: Audio })
  public audios: Array<Audio> = [];

  private audioMap = new Map();

  onLoad() {
    if ((AudioHandler.instance === undefined)) {
      AudioHandler.instance = this;
    } else {
      this.node.destroy();
      return;
    }

    game.addPersistRootNode(this.node);

    this.audios.forEach((audio) => {
        const audioItem = instantiate(this.audioPrefab);
        audioItem.setParent(this.node);

        audio.source = audioItem.getComponent(AudioSource);
        audio.shopeeAudio = audioItem.getComponent(ShopeeAudio);
        audio.shopeeAudio.audioKey = audio.key;
        audio.source.loop = audio.isLoop;

        //To change if there's in-game volume control;
        audio.source.volume = audio.volume;

        this.audioMap.set(audio.key, audio);
    });

    //@ts-ignore
    game.on(GAME_EVENT.SOUND_STATE_CHANGE, (state) => {
        this.audios.forEach((audio) =>{
            audio.source.volume = audio.volume * state;
        })
    })
  }

  public play(audioKey: ASSET_KEY){
    const audio: Audio = this.audioMap.get(audioKey);
    const volume = audio.volume * this.isMuted();
    audio.shopeeAudio.play(volume);
  }

  public playAfterFinish(audioKey: ASSET_KEY){
    const audio: Audio = this.audioMap.get(audioKey);

    if(audio.source.playing) return;
    this.play(audioKey);
  }

  private isMuted(){
    return getSoundStateFromLocalStorage ? 1 : 0;
  }
}
