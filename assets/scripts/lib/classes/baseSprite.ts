import { BaseAsset } from './baseAsset';
import {
  _decorator,
  Sprite,
  assetManager,
  SpriteFrame,
  Animation,
  UITransform,
  Color,
  Vec3,
  color,
} from 'cc';
import { getKeyEnum } from '../util/asset';
import { getSpriteFrameKey } from '../util/spritesheet';
const { ccclass, requireComponent, property, string } = _decorator;

@ccclass('BaseSprite')
@requireComponent(Sprite)
export class BaseSprite<T> extends BaseAsset<T> {
  protected sprite?: Sprite | null;

  protected uiTransform?: UITransform | null;

  protected animation?: Animation | null;

  protected presetDimension = { width: 0, height: 0 };

  @property
  get frameKey() {
    return this._frameKey || '';
  }

  set frameKey(value: string | null) {
    this._frameKey = value;

    if (this.node) {
      this.reload();
    }
  }

  @property
  private _frameKey?: string | null = null;

  constructor(name: string, textureKey: T, frameKey?: number | string) {
    super(name);
    this.assetKey = textureKey;
    this.setFrame(frameKey);
  }

  get textureKey() {
    return getKeyEnum(this.assetKey);
  }

  onLoad() {
    this.reload();
  }

  public reload() {
    if (!this.sprite) {
      this.sprite = this.getComponent(Sprite);
    }

    if (!this.uiTransform) {
      this.uiTransform = this.getComponent(UITransform);
    }

    if (!this.animation) {
      this.animation = this.getComponent(Animation);
    }

    this.presetDimension = this.getPresetDimension();

    this.setupSprite();
    this.adjustSize();
  }

  /**
   * @param opacity 0 to 255
   */
  public setOpacity(opacity: number): void {
    const { r, g, b } = this.sprite?.color || { r: 255, g: 255, b: 255 };
    this.setColor(color(r, g, b, opacity));
  }

  public setColor(color: Color): void {
    this.reload();
    if (this.sprite) {
      this.sprite.color = color;
    }
  }

  public setRotation(rotation: Vec3): void {
    this.node.setRotationFromEuler(rotation);
  }

  public setActive(active: boolean): void {
    this.node.active = active;
  }

  public setFrame(frameKey?: number | string): void {
    if (typeof frameKey === 'number' || frameKey) {
      this.frameKey = frameKey.toString();
    } else {
      this.frameKey = null;
    }
  }

  public setTexture(textureKey: T, frameKey?: number | string): void {
    this.assetKey = textureKey;
    this.setFrame(frameKey);
  }

  protected getPresetDimension() {
    const { presetDimension, uiTransform } = this;

    if (!uiTransform) return presetDimension;

    const { width, height } = uiTransform;
    return { width, height };
  }

  protected getSpriteFrame() {
    return assetManager.assets.get(
      getSpriteFrameKey(getKeyEnum(this.assetKey), this.frameKey),
    ) as SpriteFrame;
  }

  protected setupSprite() {
    if (this.sprite) {
      this.sprite.spriteFrame = this.getSpriteFrame();
    }
  }

  protected adjustSize() {
    const { uiTransform, presetDimension } = this;
    const { width, height } = presetDimension;

    uiTransform?.setContentSize(width, height);
  }
}
