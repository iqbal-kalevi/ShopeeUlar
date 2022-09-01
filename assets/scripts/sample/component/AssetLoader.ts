import { _decorator, Component, Node, assetManager, resources, Asset, ImageAsset, SpriteFrame, math, Texture2D } from 'cc';
import { getAssets } from '../config/asset';
import { ASSET_KEY } from '../enum/asset';
import { BaseLoader } from '../../lib/classes/baseLoader';
const { ccclass, property } = _decorator;

@ccclass('AssetLoader')
export class AssetLoader extends BaseLoader<ASSET_KEY> {
    
    onLoad(){
        this.startAssetsLoad(getAssets());
    }
}
