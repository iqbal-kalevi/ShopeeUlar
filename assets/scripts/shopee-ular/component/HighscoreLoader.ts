import { _decorator, Component, Node, game } from 'cc';
import { GAME_EVENT } from '../../lib/enum/game';
import { getHighscoreFromLocalStorage, updateLocalStorageHighscore } from '../../lib/util/localStorage';
import { ShopeeLabel } from './ShopeeLabel';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('HighscoreLoader')
@requireComponent(ShopeeLabel)
export class HighscoreLoader extends Component {
    
    private highscoreLabel: ShopeeLabel;

    onLoad(){
        this.highscoreLabel = this.getComponent(ShopeeLabel);
        game.on(GAME_EVENT.HIGHSCORE_CHANGE, this.loadHighscore, this);
    }

    start(){
        this.loadHighscore();
    }

    loadHighscore(){
        const score = getHighscoreFromLocalStorage();
        this.highscoreLabel.setText(score.toString());
    }
}

