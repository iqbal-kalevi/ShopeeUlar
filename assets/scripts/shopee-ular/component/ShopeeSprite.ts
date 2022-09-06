import { BaseSprite } from '../../lib/classes/baseSprite';

import { _decorator, Component, Node, Enum } from 'cc';
import { ASSET_KEY } from '../enum/asset';
const { ccclass, property } = _decorator;

@ccclass('ShopeeSprite')
export class ShopeeSprite extends BaseSprite<ASSET_KEY> {
  @property({ type: ASSET_KEY, visible: true, override: true })
  assetKey = ASSET_KEY.NONE;
}
