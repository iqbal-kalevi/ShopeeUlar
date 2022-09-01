import { BaseAsset } from './baseAsset';
import { _decorator, assetManager, TTFFont, Label, Color } from 'cc';
import { getKeyEnum } from '../util/asset';
const { ccclass, requireComponent } = _decorator;

@ccclass('BaseLabel')
@requireComponent(Label)
export class BaseLabel<T> extends BaseAsset<T> {
  protected label?: Label | null;

  constructor(name: string, fontKey: T) {
    super(name);
    this.assetKey = fontKey;
  }

  get fontKey() {
    return this.assetKey;
  }

  onLoad() {
    this.reload();
  }

  public getText() {
    return this.label?.string;
  }

  public setText(text: string) {
    this.reload();
    const { label } = this;
    if (label) {
      label.string = text;
    }
  }

  public setColor(color: Color) {
    this.reload();
    if (this.label) {
      this.label.color = color;
    }
  }

  public reload() {
    if (!this.label) {
      this.label = this.getComponent(Label);
    }
    this.setupFont();
  }

  protected setupFont() {
    const { label } = this;
    if (label && !label.font) {
      label.font = this.getFont();
    }
  }

  protected getFont() {
    return assetManager.assets.get(getKeyEnum(this.fontKey)) as TTFFont;
  }
}
