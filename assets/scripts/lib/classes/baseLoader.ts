import { DEFAULT_MAX_ASSET_RETRY } from './../util/constant';
import {
  _decorator,
  Component,
  assetManager,
  resources,
  Asset,
  ImageAsset,
  SpriteFrame,
  math,
  Texture2D,
} from 'cc';
import { ASSET_EXTENSION, ASSET_TYPE } from '../enum/asset';
import { ASSET_LOADER_EVENT } from '../enum/assetLoader';
import { AssetConfig } from '../interface/asset';
import { AssetOptions } from '../type/asset';
import { getAssetKey, getKeyEnum } from '../util/asset';
import { getSpriteFrameKey } from '../util/spritesheet';
import { RETRY_STATUS } from '../enum/retry';
const { ccclass } = _decorator;

@ccclass('BaseLoader')
export class BaseLoader<T> extends Component {
  private assetsToLoad = new Array<AssetConfig<T>>();

  private loadCount = 0;

  private allowLocalAsset = true;

  private maxConcurrency = 1;

  constructor() {
    super('AssetLoader');
    this.setupDownloader();
  }

  private setupDownloader() {
    const { maxConcurrency } = this;

    assetManager.downloader.maxConcurrency = maxConcurrency;
  }

  private addAssetsToLoad(assets: Array<AssetConfig<T>>) {
    this.assetsToLoad = [...this.assetsToLoad, ...assets];
  }

  public startAssetsLoad(assets: Array<AssetConfig<T>>) {
    this.addAssetsToLoad(assets);
    const { allowLocalAsset } = this;

    this.node.emit(ASSET_LOADER_EVENT.START, this.getProgress());
    this.assetsToLoad.forEach((asset) => {
      const { key, type, url, ext, localUrl, config } = asset;
      const keyStr = getKeyEnum(key);
      const options: AssetOptions = {
        maxRetry: DEFAULT_MAX_ASSET_RETRY,
        retryStatus: RETRY_STATUS.NONE,
        ...config,
      };
      if (allowLocalAsset && localUrl) {
        this.loadLocalAsset(keyStr, type, localUrl, options);
      } else {
        this.loadRemoteAsset(keyStr, type, url, ext, options);
      }
    });
  }

  private loadLocalAsset(
    key: string,
    type: ASSET_TYPE,
    url: string,
    config?: AssetOptions,
    retry = 0,
  ) {
    resources.load(url, (e, data) => {
      if (e) {
        const nextRetry = retry + 1;
        let maxRetry = DEFAULT_MAX_ASSET_RETRY;
        if (config) {
          config.retryStatus = RETRY_STATUS.RETRYING;
          if (typeof config.maxRetry === 'number') {
            maxRetry = config.maxRetry;
          }
        }

        if (nextRetry > maxRetry) {
          if (config) {
            config.retryStatus = RETRY_STATUS.FAILED;
          }
        } else {
          this.scheduleOnce(() => {
            this.loadLocalAsset(key, type, url, config, nextRetry);
          }, 1);
        }
      }

      this.handleLoadedAsset(key, type, url, e, data, config);
    });
  }

  private loadRemoteAsset(
    key: string,
    type: ASSET_TYPE,
    url: string,
    ext?: ASSET_EXTENSION,
    config?: AssetOptions,
    retry = 0,
  ) {
    assetManager.loadRemote(url, { ext }, (e, data) => {
      if (e) {
        const nextRetry = retry + 1;
        let maxRetry = DEFAULT_MAX_ASSET_RETRY;
        if (config) {
          config.retryStatus = RETRY_STATUS.RETRYING;
          if (typeof config.maxRetry === 'number') {
            maxRetry = config.maxRetry;
          }
        }

        if (nextRetry > maxRetry) {
          if (config) {
            config.retryStatus = RETRY_STATUS.FAILED;
          }
        } else {
          this.scheduleOnce(() => {
            this.loadRemoteAsset(key, type, url, ext, config, nextRetry);
          }, 1);
        }
      }

      this.handleLoadedAsset(key, type, url, e, data, config);
    });
  }

  private handleLoadedAsset(
    key: string,
    type: ASSET_TYPE,
    url: string,
    e: Error | null,
    data: Asset,
    config?: AssetOptions,
  ) {
    if (!e) {
      this.loadCount += 1;
      this.handleLoadedAssetByType(key, data._uuid, type, config);
      this.node.emit(
        ASSET_LOADER_EVENT.ASSET_LOAD_SUCCESS,
        this.getProgress(),
        key,
        url,
      );
    } else {
      this.node.emit(
        ASSET_LOADER_EVENT.ASSET_LOAD_FAILURE,
        this.getProgress(),
        key,
        url,
        config?.retryStatus || RETRY_STATUS.NONE,
        e,
      );
    }

    if (this.loadCount === this.assetsToLoad.length) {
      this.node.emit(ASSET_LOADER_EVENT.COMPLETE, this.getProgress());
    }
  }

  private getProgress() {
    return this.loadCount / this.assetsToLoad.length;
  }

  private remapAssetManagerEntry(key: string, uuid: string) {
    const entry = assetManager.assets.get(uuid);

    if (!entry) return;

    assetManager.assets.add(key, entry);
    assetManager.assets.remove(uuid);
  }

  private handleLoadedAssetByType(
    key: string,
    uuid: string,
    type: ASSET_TYPE,
    config?: AssetOptions,
  ) {
    switch (type) {
      case ASSET_TYPE.SPRITESHEET: {
        this.remapAssetManagerEntry(getAssetKey(key), uuid);
        this.handleLoadedSpritesheet(getAssetKey(key), key, config);
        break;
      }

      case ASSET_TYPE.IMAGE: {
        this.remapAssetManagerEntry(getAssetKey(key), uuid);
        this.handleLoadedImage(getAssetKey(key), key);
        break;
      }

      case ASSET_TYPE.NINE_SLICE: {
        this.remapAssetManagerEntry(getAssetKey(key), uuid);
        this.handleLoadedNineSlice(getAssetKey(key), key, config);
        break;
      }

      case ASSET_TYPE.AUDIO: {
        this.remapAssetManagerEntry(key, uuid);
        break;
      }

      default: {
        this.remapAssetManagerEntry(key, uuid);
        break;
      }
    }
  }

  private handleLoadedSpritesheet(
    assetKey: string,
    key: string,
    config?: AssetOptions,
  ) {
    const imageAsset = assetManager.assets.get(assetKey) as ImageAsset;
    const { width, height } = imageAsset || {};
    const { frameWidth, frameHeight, paddingX, paddingY } = {
      paddingX: 0,
      paddingY: 0,
      ...config,
    };

    if (!width || !height || !frameWidth || !frameHeight) return;

    const texture = new Texture2D();
    texture.image = imageAsset;

    let frameIndex = 0;
    for (let row = 0; row < height; row += frameHeight + paddingY) {
      for (let col = 0; col < width; col += frameWidth + paddingX) {
        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = texture;
        spriteFrame.rect = math.rect(col, row, frameWidth, frameHeight);
        assetManager.assets.add(
          getSpriteFrameKey(key, frameIndex++),
          spriteFrame,
        );
      }
    }
  }

  private handleLoadedImage(assetKey: string, key: string) {
    const imageAsset = assetManager.assets.get(assetKey) as ImageAsset;

    if (!imageAsset) return;

    const spriteFrame = SpriteFrame.createWithImage(imageAsset);
    assetManager.assets.add(key, spriteFrame);
  }

  private handleLoadedNineSlice(
    assetKey: string,
    key: string,
    config?: AssetOptions,
  ) {
    const imageAsset = assetManager.assets.get(assetKey) as ImageAsset;

    if (!imageAsset) return;

    const spriteFrame = SpriteFrame.createWithImage(imageAsset);
    const {
      insetBottom = 0,
      insetLeft = 0,
      insetRight = 0,
      insetTop = 0,
    } = config || {};

    spriteFrame.insetBottom = insetBottom;
    spriteFrame.insetLeft = insetLeft;
    spriteFrame.insetRight = insetRight;
    spriteFrame.insetTop = insetTop;

    assetManager.assets.add(key, spriteFrame);
  }
}
