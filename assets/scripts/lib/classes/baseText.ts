import { BaseAsset } from './baseAsset';
import { _decorator, RichText, assetManager, TTFFont, Color } from 'cc';
import { getKeyEnum } from '../util/asset';
import { getTextWithColor } from '../util/richText';
const { ccclass, property, requireComponent } = _decorator;

/**
 * @deprecated currently RichText has no clear benefit compared to Label while being much more complicated to use, so use BaseLabel instead
 */
@ccclass('BaseText')
@requireComponent(RichText)
export class BaseText<T> extends BaseAsset<T> {
  @property(Color)
  public textColor = new Color(255, 255, 255);

  protected richText?: RichText | null;

  constructor(name: string, fontKey: T) {
    super(name);
    this.assetKey = fontKey;
  }

  get fontKey() {
    return this.assetKey;
  }

  onLoad() {
    this.reload();
    this.reloadTextWithAssignedColor();
  }

  public setText(text: string) {
    this.reload();
    const { richText, textColor } = this;
    if (richText) {
      richText.string = getTextWithColor(text, textColor);
    }
  }

  public reload() {
    if (!this.richText) {
      this.richText = this.getComponent(RichText);
    }
    this.setupFont();
  }

  protected reloadTextWithAssignedColor() {
    const { string } = this.richText || { string: '' };
    this.setText(string);
  }

  protected setupFont() {
    const { richText } = this;
    if (richText && !richText.font) {
      richText.font = this.getFont();
    }
  }

  protected getFont() {
    return assetManager.assets.get(getKeyEnum(this.fontKey)) as TTFFont;
  }
}
