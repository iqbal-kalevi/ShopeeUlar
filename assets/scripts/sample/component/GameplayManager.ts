import { _decorator, Component, Node, random, instantiate, Prefab, Vec3, input, Input, math, Vec2, EventKeyboard, KeyCode, macro, tween, Sprite, Color } from 'cc';
import { getRandomLevel, LevelConfig, levelConfigs, Position, SnakeInterval } from '../config/level';
import { ShopeeSprite } from './ShopeeSprite';
const { ccclass, property } = _decorator;

@ccclass('GameplayManager')
export class GameplayManager extends Component {

    //initial config
    @property({type: Node})
    private snakeParent: Node;
    @property({type: Prefab})
    private snakePartPrefab;
    @property({type: Node})
    private tileParent;
    @property({type: Prefab})
    private tilePrefab;
    @property({type: Prefab})
    private wallPrefab;
    @property({type: Node})
    private fruitParent;
    @property({type: Prefab})
    private fruitPrefab;
    @property({type: Number})
    private initialXPosition = -120;
    @property({type: Number})
    private initialYPosition = 80;
    private tileSize = 24;
    private currentTileLayout: Array<Array<number>>;
    private currentSnakeTilePosition: Position;

    //gameplay config
    private snakeInterval: SnakeInterval;
    private accelerateCount: number = 0;
    private moveDir: Position = {x: 0, y: 0};
    private moveScheduleAllowed: boolean;
    private isMoveScheduled = false;
    private moveSchedule: () => void;
    private fruit: Node = null
    private fruitTilePos: Position;
    private eatenFruitCount: number = 0;
    private eatenFruitPosition: Array<number> = [];

    onLoad(){
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.moveSchedule = () => {
            if(this.moveDir.x == 0 && this.moveDir.y == 0) return;
            const newPos = {x: this.moveDir.x + this.currentSnakeTilePosition.x, y: this.moveDir.y + this.currentSnakeTilePosition.y};
            //this.currentTileLayout[newPos.y][newPos.x]
            
            if(this.fruitTilePos.x == newPos.x && this.fruitTilePos.y == newPos.y){
                this.onFruitEaten();
            }
            
            let lastPos: Vec3 = null;
            let haltedPartBloatIndex: Array<number> = [];
            this.snakeParent.children.forEach((snakePart, index) => {
                let hasFruit = false;
                let snakeSprite = snakePart.getComponentInChildren(ShopeeSprite);

                for(let i = 0; i < this.eatenFruitPosition.length; i++){
                    let snakePartIndex = this.eatenFruitPosition[i];

                    if(snakePartIndex == index && haltedPartBloatIndex.indexOf(index) === -1){
                        hasFruit = true;
                        this.eatenFruitPosition[i] = index+1;
                        haltedPartBloatIndex.push(this.eatenFruitPosition[i]);
                    }
                }

                if(hasFruit && index != 0){
                    snakeSprite.setFrame(1);
                    snakeSprite.setColor(Color.GRAY);
                }else if(snakeSprite.frameKey == '1'){
                    snakeSprite.setFrame(3);
                    snakeSprite.setColor(Color.WHITE);
                }

                //handle movement
                const premovePos = new Vec3(snakePart.position);
                this.moveAndRotateSnakePart(snakePart, snakePart.position, index == 0 ? this.tileToLocalPosition(newPos.x, newPos.y) : lastPos);
                lastPos = premovePos; 
            });

            if(this.eatenFruitPosition.length > 0){
                if(this.eatenFruitPosition[0] == this.snakeParent.children.length){
                    this.eatenFruitPosition.shift();
                    const snakePart: Node = instantiate(this.snakePartPrefab);
                    snakePart.setParent(this.snakeParent);
                    snakePart.getComponentInChildren(ShopeeSprite).setFrame(2);
                    snakePart.position = this.snakeParent.children[this.snakeParent.children.length-2].position;
                }
            }
            this.currentSnakeTilePosition = newPos;
        }
    }

    onKeyDown(event: EventKeyboard){
        switch(event.keyCode){
            case KeyCode.ARROW_LEFT:
                this.moveDir = {x: -1, y: 0};
                break;
            case KeyCode.ARROW_UP:
                this.moveDir = {x: 0, y: -1};
                break;
            case KeyCode.ARROW_RIGHT:
                this.moveDir = {x: 1, y: 0};
                break;
            case KeyCode.ARROW_DOWN:
                this.moveDir = {x: 0, y: 1};
                break;
            case KeyCode.SPACE:
                this.moveDir = {x: 0, y: 0};
                break;
        }
    }

    scheduleMove(){
        if(this.isMoveScheduled) return;
        this.isMoveScheduled = true;
        this.schedule(this.moveSchedule, this.getUpdateInterval());
    }

    start() {
        this.setupLevel(getRandomLevel());
        input.on(Input.EventType.TOUCH_START, () => this.setupLevel(getRandomLevel()), this);
    }

    getUpdateInterval(){
        let interval = this.snakeInterval.initial * Math.pow(this.snakeInterval.accelerateMultiplier, this.accelerateCount);
        interval = interval >= this.snakeInterval.minimum ? interval : this.snakeInterval.minimum
        return interval;
    }

    setupLevel(levelConfig: LevelConfig){
        this.moveScheduleAllowed = true;
        this.accelerateCount = 0;
        this.generateBoard(levelConfig);
        this.generateSnake(levelConfig);
        this.spawnFruit();
        if(this.moveScheduleAllowed){
            this.scheduleMove();
        }
    }

    spawnFruit(){
        for(let y = Math.floor(Math.random() * this.currentTileLayout.length); y < this.currentTileLayout.length; y++){
            for(let x = Math.floor(Math.random() * this.currentTileLayout[0].length); x < this.currentTileLayout[0].length; x++){
                if(this.currentTileLayout[y][x] != 1){
                    if(this.fruit == null){
                        this.fruit = instantiate(this.fruitPrefab);
                        this.fruit.setParent(this.fruitParent);
                    }

                    this.fruit.position = this.tileToLocalPosition(x, y);
                    this.fruitTilePos = {x: x, y: y};
                    return;
                }
            }
        }
    }

    onFruitEaten(){
        this.eatenFruitCount++;

        this.eatenFruitPosition.push(0);

        if(this.eatenFruitCount % this.snakeInterval.accelerateEvery == 0){
            this.accelerateCount++;
            this.eatenFruitCount = 0;
            this.unschedule(this.moveSchedule);
            this.isMoveScheduled = false;
            this.scheduleMove();
        }

        this.spawnFruit();
    }

    generateBoard(levelConfig: LevelConfig){
        this.tileParent.removeAllChildren();

        let tileFrame = 0;
        this.currentTileLayout = levelConfig.boardConfig.tiles;
        for(let row = 0; row < this.currentTileLayout.length; row++){
            for(let col = 0; col < this.currentTileLayout[row].length; col++){

                const tile: Node = instantiate(this.currentTileLayout[row][col] == 0 ? this.tilePrefab : this.wallPrefab);
                tile.setParent(this.tileParent);
                tile.position = this.tileToLocalPosition(col, row);
                tileFrame = this.toggleFrame(tileFrame, 0, 2);

                if(this.currentTileLayout[row][col] == 0){
                    tile.getComponent(ShopeeSprite).setFrame(tileFrame);
                }
            }
            tileFrame = this.toggleFrame(tileFrame, 0, 2);
        }
    }

    instantiateSnakePart(){
        
    }

    generateSnake(levelConfig: LevelConfig){
        this.snakeParent.removeAllChildren();
        
        let prevSnakePos: Position = null;
        let headSprite: Node;
        for(let i = 0; i < levelConfig.snakeConfig.parts.length; i++){
            const snakePart: Node = instantiate(this.snakePartPrefab);
            snakePart.setParent(this.snakeParent);

            const snakePos = levelConfig.snakeConfig.parts[i];
            snakePart.position = this.tileToLocalPosition(snakePos.x, snakePos.y);

            const snakeSprite = snakePart.getComponentInChildren(ShopeeSprite);
            
            if(i == 0){
                headSprite = snakeSprite.node;
                this.currentSnakeTilePosition = snakePos;
            }

            if(prevSnakePos != null){
                const x = prevSnakePos.x - snakePos.x;
                const y = prevSnakePos.y - snakePos.y;

                if(x == 0 && y == 0){
                    this.onSnakeInvalid();
                    return;
                }

                const inverseYEuler = new Vec3(0, 0, x != 0 && x < 0 ? 90 : x != 0 && x > 0 ? -90 : y != 0 && y > 0 ? 180 : 0)
                snakeSprite.node.setRotationFromEuler(inverseYEuler);
                
                if(i == 1){
                    headSprite.setRotationFromEuler(inverseYEuler);
                }

                if(i == levelConfig.snakeConfig.parts.length-1){
                    snakeSprite.setFrame(2);
                }else{
                    snakeSprite.setFrame(3);
                }
            }

            prevSnakePos = snakePos;
        }

        this.snakeInterval = levelConfig.snakeConfig.interval;
    }

    moveAndRotateSnakePart(bodyNode: Node, currentPos: Vec3, nextPos: Vec3){
        const dir = {x: nextPos.x - currentPos.x, y: nextPos.y - currentPos.y};
        const euler = new Vec3(0, 0, dir.x != 0 && dir.x <= -1 ? 90 : dir.x != 0 && dir.x >= 1 ? -90 : dir.y != 0 && dir.y <= -1 ? 180 : 0);
        const spriteNode = bodyNode.getComponentInChildren(ShopeeSprite).node;
        spriteNode.setRotationFromEuler(euler);
        tween(bodyNode)
        .to(this.getUpdateInterval(), {position: nextPos})
        .start();
    }

    onSnakeInvalid(){
        this.moveScheduleAllowed = false;
        this.unschedule(this.moveSchedule);
        this.isMoveScheduled = false;
        this.snakeParent.removeAllChildren();
        console.log("Snake Invalid!");
    }

    tileToLocalPosition(x, y){
        return new Vec3(this.initialXPosition + (x * this.tileSize), this.initialYPosition - (y * this.tileSize));
    }

    localToTilePosition(x, y){
        return {x: (x / this.tileSize) - (this.initialXPosition/this.tileSize), y: -((y/this.tileSize) - (this.initialYPosition/this.tileSize))};
    }

    toggleFrame(frame, a, b){
        return frame == a ? b : a;
    }
}

