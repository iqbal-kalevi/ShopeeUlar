import { Vec2 } from "cc";

type BoardConfig = {
    tiles: Array<Array<number>>,
};

type SnakeConfig = {
    parts: Array<Position>,
    interval: SnakeInterval,
}

export type SnakeInterval = {
    initial: number,
    accelerateMultiplier: number,
    accelerateEvery: number,
    minimum: number,
}

export type Position = {
    x: number,
    y: number,
}

export interface LevelConfig {
    boardConfig: BoardConfig
    snakeConfig: SnakeConfig
}

export const levelConfigs = [
  // Classic
  {
      boardConfig: {
          tiles: [
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          ]
      }, 
      snakeConfig: {
          parts: [
              { x: 1, y: 7 },
              { x: 1, y: 8 },
              { x: 1, y: 9 },
              { x: 1, y: 10 },
          ],
          interval: {
              initial: 0.3,
              accelerateMultiplier: 0.9,
              accelerateEvery: 2,
              minimum: 0.12,
          }
      }
  },
  // Bird-Eye
  {
      boardConfig: {
          tiles: [
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
              [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
              [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
              [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
              [0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
              [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0],
              [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          ]
      }, 
      snakeConfig: {
          parts: [
              { x: 9, y: 5 },
              { x: 9, y: 4 },
              { x: 10, y: 4 },
              { x: 10, y: 3 },
              { x: 10, y: 2 },
              { x: 11, y: 2 },
              { x: 11, y: 1 },
          ],
          interval: {
              initial: 0.3,
              accelerateMultiplier: 0.9,
              accelerateEvery: 10,
              minimum: 0.2,
          }
      }
  },
  // Naruto
  {
      boardConfig: {
          tiles: [
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
              [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
              [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0],
              [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
              [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
              [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0],
              [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
              [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
              [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          ]
      }, 
      snakeConfig: {
          parts: [
              { x: 4, y: 7 },
              { x: 5, y: 7 },
              { x: 5, y: 6 },
              { x: 4, y: 6 },
              { x: 3, y: 6 },
              { x: 3, y: 7 },
          ],
          interval: {
              initial: 0.3,
              accelerateMultiplier: 0.9,
              accelerateEvery: 5,
              minimum: 0.2,
          }
      }
  },
  // Invalid level
  {
      boardConfig: {
          tiles: [
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          ]
      }, 
      snakeConfig: {
          parts: [
              { x: 1, y: 9 },
              { x: 1, y: 8 },
              { x: 1, y: 7 },
              { x: 1, y: 7 },
          ],
          interval: {
              initial: 0.3,
              accelerateMultiplier: 0.9,
              accelerateEvery: 2,
              minimum: 0.12,
          }
      }
  }
] as Array<LevelConfig>;

export function getRandomLevel (){
    return levelConfigs[Math.floor(Math.random() * levelConfigs.length)];
}

export function getInvalidLevel (){
    return levelConfigs[3];
}