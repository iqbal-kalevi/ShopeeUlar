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
  Label,
  game,
  color,
} from "cc";
import { GAME_EVENT } from "../../lib/enum/game";
import {
  getHighscoreFromLocalStorage,
  updateLocalStorageHighscore,
} from "../../lib/util/localStorage";
import {
  getInvalidLevel,
  getRandomLevel,
  LevelConfig,
  levelConfigs,
  Position,
  SnakeInterval,
} from "../config/level";
import { ASSET_KEY } from "../enum/asset";
import {
  AlertDialogButtonOption,
  AlertDialogOption,
  displayAlertDialog,
} from "../util/AlertDialog/AlertDialogHandler";
import { AudioHandler } from "./AudioHandler";
import { HighscoreLoader } from "./HighscoreLoader";
import { ShopeeSprite } from "./ShopeeSprite";
const { ccclass, property } = _decorator;

enum SNAKE_SPRITE_TYPE {
  HEAD = 0,
  BLOAT = 1,
  TAIL = 2,
  BODY = 3,
}

@ccclass("GameplayManager")
export class GameplayManager extends Component {
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

  @property({ type: Label })
  private currentScoreLabel: Label;
  @property({ type: HighscoreLoader })
  private highscoreLoader: HighscoreLoader;

  @property({ type: Node })
  private pressToStartLabel: Node;
  @property({ type: Node })
  private scoreIcons: Node;

  private tileSize = 26;
  private initialYPosition = 0;
  private initialXPosition = 0;
  private currentTileLayout: Array<Array<number>>;
  private snakeInterval: SnakeInterval;
  private accelerateCount: number = 0;
  private moveDir: Position = { x: 0, y: 0 };
  private pendingMoveDir: Position;
  private isSnakeScheduleAllowed: boolean;
  private isSnakeScheduled = false;
  private snakeSchedule: () => void;
  private fruit: Node = null;
  private fruitTilePos: Position = { x: -1, y: -1 };
  private eatenFruitCount: number = 0;
  private eatenFruitSnakePartIndexes: Array<number> = []; //Index position of fruit in snake part array.
  private snakeScheduleUpdateInterval: number;
  private snakePartTilePos: Array<Position> = []; //Tile position of snake parts.
  private currentScore = 0;

  onLoad() {
    //Based on fixed board width of 12 tiles and (0.5, 0.5) anchor point.
    this.initialXPosition = this.tileSize * -5.5;

    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    this.initSnakeScheduleCallback();
  }

  onKeyDown(event: EventKeyboard) {
    this.onMoveInput(event.keyCode);
  }

  public onKeypadDown(event: Event = null, keyCodeStr: string) {
    const keyCode = parseInt(keyCodeStr);
    if (keyCode >= 37 && keyCode <= 40) {
      this.onMoveInput(keyCode);
    }
  }

  onMoveInput(keyCode) {
    let prevMoveDir = this.moveDir;
    let newMoveDir: Position;
    switch (keyCode) {
      case KeyCode.ARROW_LEFT:
        newMoveDir = { x: -1, y: 0 };
        break;
      case KeyCode.ARROW_UP:
        newMoveDir = { x: 0, y: -1 };
        break;
      case KeyCode.ARROW_RIGHT:
        newMoveDir = { x: 1, y: 0 };
        break;
      case KeyCode.ARROW_DOWN:
        newMoveDir = { x: 0, y: 1 };
        break;
      case KeyCode.KEY_P:
        this.onWin();
        return;
      default:
        return;
    }

    if (
      (prevMoveDir.x + newMoveDir.x == 0 &&
        prevMoveDir.y + newMoveDir.y == 0) ||
      (prevMoveDir.x == newMoveDir.x && prevMoveDir.y == newMoveDir.y)
    ) {
      this.pendingMoveDir = prevMoveDir;
    } else {
      AudioHandler.instance.play(ASSET_KEY.SOUNDTRACK_TURN);
      this.pendingMoveDir = newMoveDir;
    }

    if (this.isSnakeScheduleAllowed && !this.isSnakeScheduled) {
      this.scheduleSnake();
    }
  }

  start() {
    this.setupLevel(getRandomLevel());
  }

  getSnakeScheduleUpdateInterval() {
    let interval =
      this.snakeInterval.initial *
      Math.pow(this.snakeInterval.accelerateMultiplier, this.accelerateCount);
    return interval > this.snakeInterval.minimum
      ? interval
      : this.snakeInterval.minimum;
  }

  setupLevel(levelConfig: LevelConfig, resetScore = true) {
    this.unscheduleSnake();

    //UI reset.
    this.pressToStartLabel.active = true;
    this.scoreIcons.active = false;

    //Variables reset.
    if (resetScore) this.setScore(0);
    this.snakePartTilePos = [];
    this.eatenFruitSnakePartIndexes = [];
    this.moveDir = { x: 0, y: 0 };
    this.isSnakeScheduleAllowed = true;
    this.accelerateCount = 0;
    this.eatenFruitCount = 0;

    //Initiate level.
    this.generateBoard(levelConfig);
    this.generateSnake(levelConfig);
    this.spawnFruit();
  }

  initSnakeScheduleCallback() {
    this.snakeSchedule = () => {
      this.moveDir = this.pendingMoveDir;
      if (this.moveDir.x == 0 && this.moveDir.y == 0) return;

      //Get next position based on move direction.
      const newPos = {
        x: this.moveDir.x + this.snakePartTilePos[0].x,
        y: this.moveDir.y + this.snakePartTilePos[0].y,
      };

      //Check if next position is invalid.
      if (
        newPos.y < 0 ||
        newPos.x < 0 ||
        this.currentTileLayout.length <= newPos.y ||
        this.currentTileLayout[0].length <= newPos.x
      ) {
        this.onHazardCollide("You went out of bounds!");
        return;
      } else if (this.currentTileLayout[newPos.y][newPos.x] == 1) {
        this.onHazardCollide("You hit a wall!");
        return;
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

          tailSprite.node.scale = new Vec3(0.7, 0.7, 0.7);
          tween(tailSprite.node)
            .to(
              this.snakeScheduleUpdateInterval,
              { scale: Vec3.ONE },
              { easing: "quadIn" }
            )
            .start();

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
      for (let i = this.snakeParent.children.length - 1; i >= 0; i--) {
        const currentAscIndex = this.snakeParent.children.length - 1 - i;
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
        this.snakePartTilePos[i] = i == 0 ? newPos : tilePos;

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
          const duration = this.snakeScheduleUpdateInterval / 2;
          tween(snakeSprite.node)
            .to(
              duration,
              {
                scale: new Vec3(1.3, 1.3, 1.3),
              },
              { easing: "quadIn" }
            )
            .call(() => {
              snakeSprite.setFrame(SNAKE_SPRITE_TYPE.BLOAT);
              tween(snakeSprite.node)
                .to(duration, { scale: Vec3.ONE }, { easing: "quadIn" })
                .call(() => {
                  snakeSprite.setFrame(SNAKE_SPRITE_TYPE.BODY);
                  snakeSprite.setColor(Color.WHITE);
                })
                .start();
            })
            .start();
        }
      }

      //Check if self-cannibalism occured after movement.
      if (this.snakeCollide(newPos, false)) {
        this.onHazardCollide("You commited self-cannibalism!");
        return;
      }
    };
  }

  onHazardCollide(message: string) {
    AudioHandler.instance.play(ASSET_KEY.SOUNDTRACK_CRASH);

    this.isSnakeScheduleAllowed = false;
    this.unscheduleSnake();

    displayAlertDialog(
      new AlertDialogOption("Your Score", this.currentScore.toString(), [
        new AlertDialogButtonOption("Cancel", undefined, true, () => {
          AudioHandler.instance.play(ASSET_KEY.SOUNDTRACK_BUTTON);
          game.emit(GAME_EVENT.SCENE_CHANGE, "landing");
        }),
        new AlertDialogButtonOption("Play Again", Color.RED, true, () => {
          AudioHandler.instance.play(ASSET_KEY.SOUNDTRACK_BUTTON);
          this.fadeAndSetupLevel();
        }),
      ])
    );
  }

  fadeAndSetupLevel(resetScore: boolean = true) {
    game.emit(GAME_EVENT.FADE_OUT, 1, () => {
      this.setupLevel(getRandomLevel(), resetScore);
      game.emit(GAME_EVENT.FADE_IN, 0.25);
    });
  }

  scheduleSnake() {
    if (this.isSnakeScheduled) return;

    this.pressToStartLabel.active = false;
    this.scoreIcons.active = true;

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
    this.onWin();
  }

  onWin() {
    this.isSnakeScheduleAllowed = false;
    this.unscheduleSnake();
    this.fadeAndSetupLevel(false);
  }

  snakeCollide(pos: Position, includeHead = true) {
    for (let i = includeHead ? 0 : 1; i < this.snakePartTilePos.length; i++) {
      if (
        this.snakePartTilePos[i].x == pos.x &&
        this.snakePartTilePos[i].y == pos.y
      ) {
        return true;
      }
    }

    return false;
  }

  onFruitEaten() {
    AudioHandler.instance.play(ASSET_KEY.SOUNDTRACK_EAT);
    this.setScore(++this.currentScore);
    this.eatenFruitCount++;
    this.eatenFruitSnakePartIndexes.push(0);
    this.spawnFruit();
  }

  setScore(amount: number) {
    this.currentScore = amount;
    this.currentScoreLabel.string = this.currentScore.toString();

    if (this.currentScore > getHighscoreFromLocalStorage()) {
      updateLocalStorageHighscore(this.currentScore);
      this.highscoreLoader.loadHighscore();
    }
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

    if (levelConfig.snakeConfig.parts.length < 3) {
      this.onSnakeInvalid("Invalid length.");
      return;
    }

    for (let i = 0; i < levelConfig.snakeConfig.parts.length; i++) {
      const snakeTilePos = levelConfig.snakeConfig.parts[i];

      if (
        this.snakeCollide(snakeTilePos) ||
        this.currentTileLayout[snakeTilePos.y][snakeTilePos.x] != 0
      ) {
        this.onSnakeInvalid("Invalid spawn point.");
        return;
      }

      if (i > 0) {
        const prevTilePos = levelConfig.snakeConfig.parts[i - 1];
        const manhattanDist =
          Math.abs(snakeTilePos.x - prevTilePos.x) +
          Math.abs(snakeTilePos.y - prevTilePos.y);
        if (manhattanDist != 1) {
          this.onSnakeInvalid("Invalid distance.");
          return;
        }
      }

      const localSpawnPos = this.tileToLocalPosition(
        snakeTilePos.x,
        snakeTilePos.y
      );
      const snakeSprite = this.instantiateSnakePart(localSpawnPos);

      if (i == 0) {
        headSpriteNode = snakeSprite.node;
      }

      if (prevSnakePos != null) {
        this.rotateSnakePart(snakeSprite.node, localSpawnPos, prevSnakePos, 0);

        if (i == 1) {
          this.rotateSnakePart(headSpriteNode, localSpawnPos, prevSnakePos, 0);
          this.moveDir = {
            x: this.snakePartTilePos[0].x - snakeTilePos.x,
            y: this.snakePartTilePos[0].y - snakeTilePos.y,
          };
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
    const targetAngle =
      dir.x != 0 && dir.x <= -1
        ? 90
        : dir.y != 0 && dir.y <= -1
        ? 180
        : dir.x != 0 && dir.x >= 1
        ? 270
        : dir.x != 0 && dir.y >= 1
        ? 360
        : spriteNode.angle;

    const currentAngle = spriteNode.angle;
    let offset = targetAngle - currentAngle;
    offset = this.mod(offset + 180, 360) - 180;

    tween(spriteNode)
      .by(tweenDuration / 2, { angle: offset })
      .start();
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
      .to(
        this.snakeScheduleUpdateInterval,
        { position: nextPos }
        // { easing: "quadOut" }
      )
      .start();
  }

  onSnakeInvalid(msg) {
    console.log(msg);
    this.isSnakeScheduleAllowed = false;
    this.unscheduleSnake();
    this.snakeParent.removeAllChildren();

    displayAlertDialog(
      new AlertDialogOption("Invalid Snake", "", [
        new AlertDialogButtonOption("Cancel", undefined, true, () => {
          AudioHandler.instance.play(ASSET_KEY.SOUNDTRACK_BUTTON);
          game.emit(GAME_EVENT.SCENE_CHANGE, "landing");
        }),
      ])
    );
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

  //(a, n) -> a - floor(a/n) * n

  mod(a, n): number {
    return a - Math.floor(a / n) * n;
  }
}
