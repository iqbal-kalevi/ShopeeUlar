import { _decorator, Component, Node, SliderComponent, Slider, ProgressBar, RichText, Input, director, Sprite, assetManager, Label, game } from 'cc';
import { ASSET_LOADER_EVENT } from '../../lib/enum/assetLoader';
import { GAME_EVENT } from '../../lib/enum/game';
import { getKeyEnum } from '../../lib/util/asset';
import { ASSET_KEY } from '../enum/asset';
import { ShopeeLabel } from './ShopeeLabel';
import { ShopeeSprite } from './ShopeeSprite';
const { ccclass, property } = _decorator;

@ccclass('ProgressManager')
export class ProgressManager extends Component {
    
    @property({type: ProgressBar})
    private progressBar;
    @property({type: ShopeeLabel})
    private loadingLabel;
    @property({type: ShopeeSprite})
    private logo;

    onLoad(){
        this.node.on(ASSET_LOADER_EVENT.START, (val) => {
            this.progressBar.progress = 0;
        }, this);

        this.node.on(ASSET_LOADER_EVENT.ASSET_LOAD_SUCCESS, (progress, key) => {
            this.loadingLabel.setText(`${Math.round(progress*100)}%`);
            this.progressBar.progress = progress;

            if(key == getKeyEnum(ASSET_KEY.SPRITE_LOGO)){
                this.logo.reload();
            }
            if(key == getKeyEnum(ASSET_KEY.FONT_SHP21_REGULAR)){
                this.loadingLabel.reload();
            }
        }, this);

        this.node.on(ASSET_LOADER_EVENT.COMPLETE, () => {
            this.progressBar.progress = 1;
            game.emit(GAME_EVENT.SCENE_CHANGE, "landing");
        }, this);
    }
}

