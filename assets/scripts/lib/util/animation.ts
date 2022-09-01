import {
  Animation,
  animation,
  AnimationClip,
  AnimationState,
  AssetManager,
  SpriteFrame,
} from 'cc';
import { getSpriteFrameKey } from './spritesheet';

export function generateAnimationClip(
  assetManager: AssetManager,
  textureKey: string,
  frameIndexes: Array<number>,
  frameRate: number,
  wrapMode = AnimationClip.WrapMode.Default,
) {
  const frames = new Array<SpriteFrame>();
  frameIndexes.forEach((frameIndex) => {
    frames.push(
      assetManager.assets.get(
        getSpriteFrameKey(textureKey, frameIndex),
      ) as SpriteFrame,
    );
  });
  const animationClip = AnimationClip.createWithSpriteFrames(frames, frameRate);
  if (animationClip) {
    animationClip.wrapMode = wrapMode;
  }
  return animationClip;
}

export function mergeAnimationClips(animationClips: Array<AnimationClip>) {
  return animationClips.reduce((res, clip) => {
    const { duration, curves, keys } = clip;

    res.duration = Math.max(res.duration, duration);
    res.curves.push(...curves);
    res.keys.push(...keys);

    return res;
  }, new AnimationClip());
}

export function addHierarchyPathToCurves(
  curves: Array<AnimationClip.ICurve>,
  path: string,
) {
  return curves.reduce((res, curve) => {
    const { modifiers } = curve;

    res.push({
      ...curve,
      modifiers: [new animation.HierarchyPath(path), ...modifiers],
    });

    return res;
  }, new Array<AnimationClip.ICurve>());
}

export function getActiveAnimationState(
  animation: Animation,
): AnimationState | undefined {
  const { _nameToState: states } = animation as unknown as {
    _nameToState: { [key: string]: AnimationState };
  };
  const stateKeys = Object.keys(states);

  return stateKeys.reduce((res, key) => {
    const state = states[key];
    const { isPlaying } = state;

    if (isPlaying) {
      return state;
    }

    return res;
  }, undefined as unknown as AnimationState);
}
