import { _decorator, Component, Node, random, instantiate, Prefab, Vec3, input, Input } from 'cc';
import { getRandomLevel, LevelConfig, levelConfigs } from '../config/level';
import { ShopeeSprite } from './ShopeeSprite';
const { ccclass, property } = _decorator;

@ccclass('GameplayManager')
export class GameplayManager extends Component {

    @property({type: Node})
    private tileParent;
    @property({type: Prefab})
    private tilePrefab;
    @property({type: Prefab})
    private wallPrefab;
    @property({type: Number})
    private initialPosition = -120;
    private tileSize = 24;

    start() {
        this.generateLevel(getRandomLevel());
        //input.on(Input.EventType.TOUCH_START, () => this.generateLevel(getRandomLevel()), this);
    }

    update(deltaTime: number) {
        
    }

    generateLevel(levelConfig: LevelConfig){
        console.log(levelConfig);
        
        let rowIndex = 0;
        let tileFrame = 0;
        for(let row = levelConfig.boardConfig.tiles.length-1; row >= 0; row--){
            for(let col = 0; col < levelConfig.boardConfig.tiles[row].length; col++){

                const tile: Node = instantiate(levelConfig.boardConfig.tiles[row][col] == 0 ? this.tilePrefab : this.wallPrefab);
                tile.setParent(this.tileParent);
                tile.position = new Vec3(this.initialPosition + (col * this.tileSize), this.initialPosition + (rowIndex * this.tileSize));
                tileFrame = this.toggleFrame(tileFrame, 0, 2);

                if(levelConfig.boardConfig.tiles[row][col] == 0){
                    tile.getComponent(ShopeeSprite).setFrame(tileFrame);
                }
            }
            tileFrame = this.toggleFrame(tileFrame, 0, 2);
            rowIndex++;
        }
    }

    toggleFrame(frame, a, b){
        return frame == a ? b : a;
    }
}

