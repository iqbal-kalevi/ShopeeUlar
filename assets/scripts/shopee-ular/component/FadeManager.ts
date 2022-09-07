import { _decorator, Component, Node, Sprite, Color, color, tween, UIOpacity, game, director, EventHandler } from 'cc';
import { GAME_EVENT } from '../../lib/enum/game';
import { ASSET_KEY } from '../enum/asset';
import { AudioHandler } from './AudioHandler';
const { ccclass, property, requireComponent } = _decorator;
const eventTarget = new EventTarget();

@ccclass('FadeManager')
@requireComponent(UIOpacity)
export class FadeManager extends Component {
    
    @property({type: Number})
    private fadeInDuration;
    @property({type: Number})
    private fadeOutDuration;

    private uIOpacity: UIOpacity;
    private inOpacity = 0;
    private outOpacity = 255;

    private isFading;

    onLoad(){
        this.isFading = false;
        this.uIOpacity = this.getComponent(UIOpacity);
        this.fade(this.fadeInDuration ,this.inOpacity);
    }

    start(){
        //@ts-ignore
        game.on(GAME_EVENT.SCENE_CHANGE, (scene) => {this.changeScene(null, scene)}, this);
        //@ts-ignore
        game.on(GAME_EVENT.FADE_IN, (delay, callback) => {this.fade(this.fadeInDuration, this.inOpacity, callback, delay)}, this);
        //@ts-ignore
        game.on(GAME_EVENT.FADE_OUT, (delay, callback) => {this.fade(this.fadeOutDuration, this.outOpacity, callback, delay)}, this);
    }

    fade(duration, opacity, callback = () => {}, delay = 0){
        if(this.isFading) return;

        this.isFading = true;
        tween(this.uIOpacity)
        .delay(delay)
        .to(duration, {opacity: opacity})
        .call(
            () => {
                this.isFading = false;
                callback();
            }
        )
        .start();
    }

    changeScene (event: Event = null, scene: string) {
        this.fade(this.fadeOutDuration, this.outOpacity, () => {
            director.loadScene(scene);
        })
    }

   changeSceneClick (event: Event = null, scene: string){
        AudioHandler.instance.play(ASSET_KEY.SOUNDTRACK_BUTTON);
        this.changeScene(event, scene);
   }
}

