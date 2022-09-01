import { _decorator, Component, Node, Sprite, Color, color, tween, UIOpacity, game, director, EventHandler } from 'cc';
import { GAME_EVENT } from '../../lib/enum/game';
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
        game.on(GAME_EVENT.SCENE_CHANGE, (scene) => {this.changeScene(null, scene)}, this, true);
    }

    fade(duration, opacity, callback = () => {}){
        if(this.isFading) return;

        this.isFading = true;
        tween()
        .target(this.uIOpacity)
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

   
}

