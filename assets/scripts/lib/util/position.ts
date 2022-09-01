import { view } from 'cc';

export function getWorldPosFromUIPos(x: number, y: number) {
  const { width, height } = view.getVisibleSize();
  return {
    x: x - width * 0.5,
    y: y - height * 0.5,
  };
}
