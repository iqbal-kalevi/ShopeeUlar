import { ASSET_KEY } from "../enum/asset";
import { ASSET_EXTENSION, ASSET_TYPE } from "../../lib/enum/asset";
import { AssetConfig } from "../../lib/interface/asset";

function getShopeeAssetUrl(url: string) {
    return `https://cf.shopee.co.id/file/${url}`;
}

export function getAssets() {
    const assets = new Array<AssetConfig<ASSET_KEY>>();
    
    //priority
    assets.push({
        key: ASSET_KEY.SPRITE_LOGO,
        type: ASSET_TYPE.IMAGE,
        url: '',
        localUrl: 'image/title',
    });

    assets.push({
        key: ASSET_KEY.FONT_SHP21_BOLD,
        type: ASSET_TYPE.FONT,
        url: '',
        localUrl: 'font/Shopee2021/Shopee2021-Bold',
    });

    //Game UI
    assets.push({
        key: ASSET_KEY.SPRITE_KEYPAD,
        type: ASSET_TYPE.SPRITESHEET,
        url: '',
        localUrl: 'image/keypad',
        config: {
            frameWidth: 137,
            frameHeight: 137,
        },
    });

    assets.push({
        key: ASSET_KEY.SPRITE_APPLE,
        type: ASSET_TYPE.IMAGE,
        url: '',
        localUrl: 'image/sprite_apple',
    });

    assets.push({
        key: ASSET_KEY.SPRITE_SOUND_ON,
        type: ASSET_TYPE.IMAGE,
        url: '',
        localUrl: 'image/sprite_sound_on',
    });

    assets.push({
        key: ASSET_KEY.SPRITE_SOUND_OFF,
        type: ASSET_TYPE.IMAGE,
        url: '',
        localUrl: 'image/sprite_sound_off',
    });

    assets.push({
        key: ASSET_KEY.SPRITE_TILE,
        type: ASSET_TYPE.SPRITESHEET,
        url: '',
        localUrl: 'image/sprite_tile',
        config: {
            frameWidth: 24,
            frameHeight: 24,
        }
    });

    assets.push({
        key: ASSET_KEY.SPRITE_TROPHY,
        type: ASSET_TYPE.IMAGE,
        url: '',
        localUrl: 'image/sprite_trophy',
    });

    assets.push({
        key: ASSET_KEY.SPRITE_WALL,
        type: ASSET_TYPE.IMAGE,
        url: '',
        localUrl: 'image/sprite_wall',
    }); 

    assets.push({
        key: ASSET_KEY.SPRITE_SNAKE,
        type: ASSET_TYPE.SPRITESHEET,
        url: '',
        localUrl: 'image/spritesheet_round',
        config: {
            frameWidth: 96,
            frameHeight: 96,
        }
    });

    //Soundtrack
    assets.push({
        key: ASSET_KEY.SOUNDTRACK_BGM,
        type: ASSET_TYPE.AUDIO,
        url: '',
        localUrl: 'audio/bg-music',
    });

    assets.push({
        key: ASSET_KEY.SOUNDTRACK_BUTTON,
        type: ASSET_TYPE.AUDIO,
        url: '',
        localUrl: 'audio/button-sfx',
    });

    assets.push({
        key: ASSET_KEY.SOUNDTRACK_CRASH,
        type: ASSET_TYPE.AUDIO,
        url: '',
        localUrl: 'audio/crash',
    });

    assets.push({
        key: ASSET_KEY.SOUNDTRACK_EAT,
        type: ASSET_TYPE.AUDIO,
        url: '',
        localUrl: 'audio/eat',
    });

    assets.push({
        key: ASSET_KEY.SOUNDTRACK_TURN,
        type: ASSET_TYPE.AUDIO,
        url: '',
        localUrl: 'audio/turn',
    });

    //Font
    assets.push({
        key: ASSET_KEY.FONT_SHP21_BLACK,
        type: ASSET_TYPE.FONT,
        url: '',
        localUrl: 'font/Shopee2021/Shopee2021-Black',
    });

    assets.push({
        key: ASSET_KEY.FONT_SHP21_REGULAR,
        type: ASSET_TYPE.FONT,
        url: '',
        localUrl: 'font/Shopee2021/Shopee2021-Regular',
    });

    assets.push({
        key: ASSET_KEY.FONT_SHP21_LIGHT,
        type: ASSET_TYPE.FONT,
        url: '',
        localUrl: 'font/Shopee2021/Shopee2021-Light',
    });

    assets.push({
        key: ASSET_KEY.FONT_SHP21_MEDIUM,
        type: ASSET_TYPE.FONT,
        url: '',
        localUrl: 'font/Shopee2021/Shopee2021-Medium',
    });

    assets.push({
        key: ASSET_KEY.FONT_SHP21_SBOLD,
        type: ASSET_TYPE.FONT,
        url: '',
        localUrl: 'font/Shopee2021/Shopee2021-SemiBold',
    });

    assets.push({
        key: ASSET_KEY.FONT_SHP21_XBOLD,
        type: ASSET_TYPE.FONT,
        url: '',
        localUrl: 'font/Shopee2021/Shopee2021-ExtraBold',
    });

    return assets;
}