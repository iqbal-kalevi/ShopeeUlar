export function getSpriteFrameKey(
  textureKey: string,
  frameKey?: number | string | null,
) {
  if (typeof frameKey === 'number' || frameKey) {
    return `${textureKey}_${frameKey}`;
  }
  return textureKey;
}
