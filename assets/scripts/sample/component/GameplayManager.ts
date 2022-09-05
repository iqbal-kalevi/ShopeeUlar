import {
  _decorator,
  Component,
  Node,
  random,
  instantiate,
  Prefab,
  Vec3,
  input,
  Input,
  math,
  Vec2,
  EventKeyboard,
  KeyCode,
  macro,
  tween,
  Sprite,
  Color,
  Quat,
} from "cc";
import {
  getRandomLevel,
  LevelConfig,
  levelConfigs,
  Position,
  SnakeInterval,
} from "../config/level";
import { ShopeeSprite } from "./ShopeeSprite";
const { ccclass, property } = _decorator;

enum SNAKE_SPRITE_TYPE {
  HEAD = 0,
  BODY = 3,
  TAIL = 2,
}

@ccclass("GameplayManager")
export class GameplayManager extends Component {
  //initial config
  @property({ type: Node })
  private snakeParent: Node;
  @property({ type: Prefab })
  private snakePartPrefab;
  @property({ type: Node })
  private tileParent;
  @property({ type: Prefab })
  private tilePrefab;
  @property({ type: Prefab })
  private wallPrefab;
  @property({ type: Node })
  private fruitParent;
  @property({ type: Prefab })
  private fruitPrefab;
  @property({ type: Number })
  private initialXPosition = -120;
  @property({ type: Number })
  private initialYPosition = 80;
  private tileSize = 24;
  private currentTileLayout: Array<Array<number>>;
  private currentSnakeHeadTilePosition: Position;

  //gameplay config
  private snakeInterval: SnakeInterval;
  private accelerateCount: number = 0;
  private moveDir: Position = { x: 0, y: 0 };
  private snakeScheduleAllowed: boolean;
  private isSnakeScheduled = false;
  private snakeSchedule: () => void;
  private fruit: Node = null;
  private fruitTilePos: Position = {x: -1, y: -1};
  private eatenFruitCount: number = 0;
  private eatenFruitSnakePartIndexes: Array<number> = []; //Index position of fruit in snake part array.
  private snakeScheduleUpdateInterval;
  private snakePartTilePos: Array<Position> = []; //Tile position of snake parts.

  onLoad() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    this.initSnakeSchedule();
  }

  onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.ARROW_LEFT:
        this.moveDir = { x: -1, y: 0 };
        break;
      case KeyCode.ARROW_UP:
        this.moveDir = { x: 0, y: -1 };
        break;
      case KeyCode.ARROW_RIGHT:
        this.moveDir = { x: 1, y: 0 };
        break;
      case KeyCode.ARROW_DOWN:
        this.moveDir = { x: 0, y: 1 };
        break;
      case KeyCode.SPACE:
        this.moveDir = { x: 0, y: 0 };
        break;
    }
  }

  start() {
    this.setupLevel(getRandomLevel());
    input.on(
      Input.EventType.TOUCH_START,
      () => this.setupLevel(getRandomLevel()),
      this
    );
  }

  getSnakeScheduleUpdateInterval() {
    let interval =
      this.snakeInterval.initial *
      Math.pow(this.snakeInterval.accelerateMultiplier, this.accelerateCount);
    return interval > this.snakeInterval.minimum
      ? interval
      : this.snakeInterval.minimum;
  }

  setupLevel(levelConfig: LevelConfig) {
    this.unscheduleSnake();

    //Variables reset.
    this.snakePartTilePos = [];
    this.eatenFruitSnakePartIndexes = [];
    this.moveDir = { x: 0, y: 0 };
    this.snakeScheduleAllowed = true;
    this.accelerateCount = 0;
    this.eatenFruitCount = 0;

    //Initiate level.
    this.generateBoard(levelConfig);
    this.generateSnake(levelConfig);
    this.spawnFruit();
    if (this.snakeScheduleAllowed) {
      this.scheduleSnake();
    }
  }

  initSnakeSchedule() {
    this.snakeSchedule = () => {
      if (this.moveDir.x == 0 && this.moveDir.y == 0) return;

      //Get next position based on move direction.
      const newPos = {
        x: this.moveDir.x + this.currentSnakeHeadTilePosition.x,
        y: this.moveDir.y + this.currentSnakeHeadTilePosition.y,
      };

      //Check if next position is invalid.
      if (
        newPos.y < 0 ||
        newPos.x < 0 ||
        this.currentTileLayout.length <= newPos.y ||
        this.currentTileLayout[0].length <= newPos.x
      ) {
        console.log("Out of bounds!");
      } else if (this.currentTileLayout[newPos.y][newPos.x] == 1) {
        console.log("Wall hit!");
      } else if (this.snakeCollide(newPos)) {
        console.log("Self-cannibalism occured!");
      }

      //Check if fruit is eaten.
      if (this.fruitTilePos.x == newPos.x && this.fruitTilePos.y == newPos.y) {
        this.onFruitEaten();
      }

      //Handle new tail generation.
      if (this.eatenFruitSnakePartIndexes.length > 0) {
        //Check if fruit reached tail.
        if (
          this.eatenFruitSnakePartIndexes[0] == this.snakeParent.children.length
        ) {
          this.eatenFruitSnakePartIndexes.shift();

          //Generate new tail.
          const oldTail =
            this.snakeParent.children[this.snakeParent.children.length - 1];
          const oldTailSprite = oldTail.getComponentInChildren(ShopeeSprite);
          oldTailSprite.setFrame(SNAKE_SPRITE_TYPE.BODY);
          const oldTailAngle = oldTailSprite.node.angle;

          const localTailSpawnPos = oldTail.position;
          const tailSprite = this.instantiateSnakePart(localTailSpawnPos);
          tailSprite.node.angle = oldTailAngle;

          tailSprite.setFrame(SNAKE_SPRITE_TYPE.TAIL);

          //Check for speed-up.
          if (this.eatenFruitCount % this.snakeInterval.accelerateEvery == 0) {
            this.accelerateCount++;
            this.eatenFruitCount = 0;
            this.unscheduleSnake();
            this.scheduleSnake();
          }
        }
      }

      let pendingPartBloatIndexes: Array<number> = []; //Snake parts to be bloated next schedule iteration.

      //Iterate and process each snake part.
      let currentAscIndex = -1;
      for (let i = this.snakeParent.children.length - 1; i >= 0; i--) {
        currentAscIndex++;
        const snakePart = this.snakeParent.children[i];
        let hasFruit = false;
        let snakeSprite =
          this.snakeParent.children[currentAscIndex].getComponentInChildren(
            ShopeeSprite
          );

        //Handle movement.
        const nextPos =
          i == 0
            ? this.tileToLocalPosition(newPos.x, newPos.y)
            : this.snakeParent.children[i - 1].position;

        this.moveAndRotateSnakePart(snakePart, snakePart.position, nextPos);

        const tilePos = this.localToTilePosition(nextPos.x, nextPos.y);
        this.snakePartTilePos[i] = tilePos;

        //Handle eaten fruit's snake-part index position.
        for (let i = 0; i < this.eatenFruitSnakePartIndexes.length; i++) {
          let eatenFruitSnakePartIndex = this.eatenFruitSnakePartIndexes[i];

          //Make sure there's only 1 snake part to be bloated per eaten fruit per schedule iteration.
          if (
            eatenFruitSnakePartIndex == currentAscIndex &&
            pendingPartBloatIndexes.indexOf(currentAscIndex) === -1 //Check if current part index is not pending.
          ) {
            hasFruit = true;

            //Move eaten fruit index position to the next snake part and halt the bloat animation until the next schedule iteration.
            this.eatenFruitSnakePartIndexes[i] = currentAscIndex + 1;
            pendingPartBloatIndexes.push(this.eatenFruitSnakePartIndexes[i]);
          }
        }

        //Handle bloat/eating animation.
        if (hasFruit && currentAscIndex != 0) {
          snakeSprite.setColor(Color.fromHEX(new Color(), "80F3A9"));
          tween(snakeSprite.node)
            .to(this.snakeScheduleUpdateInterval, {
              scale: new Vec3(1.25, 1.25, 1.25),
            })
            .call(() => {
              tween(snakeSprite.node)
                .to(this.snakeScheduleUpdateInterval, { scale: Vec3.ONE })
                .start();
              snakeSprite.setColor(Color.WHITE);
            })
            .start();
        }
      }

      this.currentSnakeHeadTilePosition = newPos;
    };
  }

  scheduleSnake() {
    if (this.isSnakeScheduled) return;

    this.isSnakeScheduled = true;
    this.snakeScheduleUpdateInterval = this.getSnakeScheduleUpdateInterval();
    this.schedule(this.snakeSchedule, this.snakeScheduleUpdateInterval);
  }

  unscheduleSnake() {
    if (!this.isSnakeScheduled) return;

    this.unschedule(this.snakeSchedule);
    this.isSnakeScheduled = false;
  }

  spawnFruit() {
    //Pick random starting point.

    const prevPos = this.fruitTilePos;
    let yInit = Math.floor(Math.random() * this.currentTileLayout.length);
    let xInit = Math.floor(Math.random() * this.currentTileLayout[0].length);
    let yLimit = this.currentTileLayout.length;
    let xLimit = this.currentTileLayout[0].length;

    for (let i = 0; i < 2; i++) {
      //Iterate tile layout until valid fruit spawn position is found.
      for (let y = yInit; y < yLimit; y++) {
        for (let x = xInit; x < xLimit; x++) {
          if (
            this.currentTileLayout[y][x] != 1 &&
            !this.snakeCollide({ x: x, y: y }) &&
            !(prevPos.x == x && prevPos.y == y)
          ) {
            if (this.fruit == null) {
              this.fruit = instantiate(this.fruitPrefab);
              this.fruit.setParent(this.fruitParent);
            }

            this.fruit.position = this.tileToLocalPosition(x, y);
            this.fruitTilePos = { x: x, y: y };
            return;
          }
        }
      }

      //Restart iteration from initial starting point (0,0) to previous starting point.
      yLimit = yInit + 1;
      xLimit = xInit + 1;
      yInit = 0;
      xInit = 0;
    }

    //Handle no valid fruit spawn position here.
    console.log("You probably win the game.");
  }

  snakeCollide(pos: Position) {
    let result = false;
    this.snakePartTilePos.forEach((snakePartTilePos) => {
      if (snakePartTilePos.x == pos.x && snakePartTilePos.y == pos.y) {
        result = true;
        return;
      }
    });
    return result;
  }

  onFruitEaten() {
    this.eatenFruitCount++;
    this.eatenFruitSnakePartIndexes.push(0);
    this.spawnFruit();
  }

  generateBoard(levelConfig: LevelConfig) {
    this.tileParent.removeAllChildren();

    let tileFrame = 0;
    this.currentTileLayout = levelConfig.boardConfig.tiles;
    for (let row = 0; row < this.currentTileLayout.length; row++) {
      for (let col = 0; col < this.currentTileLayout[row].length; col++) {
        const tile: Node = instantiate(
          this.currentTileLayout[row][col] == 0
            ? this.tilePrefab
            : this.wallPrefab
        );
        tile.setParent(this.tileParent);
        tile.position = this.tileToLocalPosition(col, row);
        tileFrame = this.toggleFrame(tileFrame, 0, 2);

        if (this.currentTileLayout[row][col] == 0) {
          tile.getComponent(ShopeeSprite).setFrame(tileFrame);
        }
      }
      tileFrame = this.toggleFrame(tileFrame, 0, 2);
    }
  }

  instantiateSnakePart(position: Vec3) {
    const snakePart: Node = instantiate(this.snakePartPrefab);
    snakePart.setParent(this.snakeParent);
    snakePart.position = position;
    const tilePos = this.localToTilePosition(position.x, position.y);
    this.snakePartTilePos.push(tilePos);
    return snakePart.getComponentInChildren(ShopeeSprite);
  }

  generateSnake(levelConfig: LevelConfig) {
    this.snakeParent.removeAllChildren();

    let prevSnakePos: Vec3 = null;
    let headSpriteNode: Node;
    for (let i = 0; i < levelConfig.snakeConfig.parts.length; i++) {
      const snakeTilePos = levelConfig.snakeConfig.parts[i];
      const localSpawnPos = this.tileToLocalPosition(
        snakeTilePos.x,
        snakeTilePos.y
      );
      const snakeSprite = this.instantiateSnakePart(localSpawnPos);

      if (i == 0) {
        headSpriteNode = snakeSprite.node;
        this.currentSnakeHeadTilePosition = snakeTilePos;
      }

      if (prevSnakePos != null) {
        this.rotateSnakePart(snakeSprite.node, localSpawnPos, prevSnakePos, 0);

        if (i == 1) {
          this.rotateSnakePart(headSpriteNode, localSpawnPos, prevSnakePos, 0);
        }

        if (i == levelConfig.snakeConfig.parts.length - 1) {
          snakeSprite.setFrame(SNAKE_SPRITE_TYPE.TAIL);
        } else {
          snakeSprite.setFrame(SNAKE_SPRITE_TYPE.BODY);
        }
      }

      prevSnakePos = localSpawnPos;
    }

    this.snakeInterval = levelConfig.snakeConfig.interval;
  }

  rotateSnakePart(
    spriteNode: Node,
    currentPos: Vec3,
    nextPos: Vec3,
    tweenDuration = this.snakeScheduleUpdateInterval
  ) {
    const dir = { x: nextPos.x - currentPos.x, y: nextPos.y - currentPos.y };
    const angle =
      dir.x != 0 && dir.x <= -1
        ? 90
        : dir.y != 0 && dir.y <= -1
        ? 180
        : dir.x != 0 && dir.x >= 1
        ? -90
        : dir.x != 0 && dir.y >= 1
        ? 0
        : spriteNode.angle;

    // let quat = new Quat();
    // tween(spriteNode)
    //   .to(tweenDuration, { rotation: Quat.fromEuler(quat, 0, 0, angle) })
    //   .start();
    spriteNode.angle = angle;
  }

  moveAndRotateSnakePart(bodyNode: Node, currentPos: Vec3, nextPos: Vec3) {
    const spriteNode = bodyNode.getComponentInChildren(ShopeeSprite).node;
    this.rotateSnakePart(
      spriteNode,
      currentPos,
      nextPos,
      this.snakeScheduleUpdateInterval
    );

    tween(bodyNode)
      .to(this.snakeScheduleUpdateInterval, { position: nextPos })
      .start();
  }

  onSnakeInvalid() {
    this.snakeScheduleAllowed = false;
    this.unscheduleSnake();
    this.snakeParent.removeAllChildren();
    console.log("Snake Invalid!");
  }

  tileToLocalPosition(x, y) {
    return new Vec3(
      this.initialXPosition + x * this.tileSize,
      this.initialYPosition - y * this.tileSize
    );
  }

  localToTilePosition(x, y) {
    return {
      x: Math.round(x / this.tileSize - this.initialXPosition / this.tileSize),
      y: Math.round(
        -(y / this.tileSize - this.initialYPosition / this.tileSize)
      ),
    };
  }

  toggleFrame(frame, a, b) {
    return frame == a ? b : a;
  }
}
