import { _decorator, Component, Node } from 'cc';
import { BaseAudio } from '../../lib/classes/baseAudio';
import { ASSET_KEY } from '../enum/asset';
const { ccclass, property } = _decorator;

@ccclass('ShopeeAudio')
export class ShopeeAudio extends BaseAudio<ASSET_KEY> {
  @property({ type: ASSET_KEY, visible: true, override: true })
  assetKey = ASSET_KEY.NONE;
}
