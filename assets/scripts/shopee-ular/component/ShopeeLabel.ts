import { _decorator, Component, Node } from 'cc';
import { BaseLabel } from '../../lib/classes/baseLabel';
import { ASSET_KEY } from '../enum/asset';
const { ccclass, property } = _decorator;

@ccclass('ShopeeLabel')
export class ShopeeLabel extends BaseLabel<ASSET_KEY> {
  @property({ type: ASSET_KEY, visible: true, override: true })
  assetKey = ASSET_KEY.NONE;
}


