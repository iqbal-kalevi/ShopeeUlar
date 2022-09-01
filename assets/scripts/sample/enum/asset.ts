import { convertEnum, setAssetEnum } from '../../lib/util/asset';
import { Enum } from 'cc';

export enum ASSET_KEY {
    NONE,
    SPRITE_LOGO,
    SPRITE_KEYPAD,
    SPRITE_APPLE,
    SPRITE_SOUND_ON,
    SPRITE_SOUND_OFF,
    SPRITE_TILE,
    SPRITE_TROPHY,
    SPRITE_WALL,
    SPRITE_SNAKE,
    SOUNDTRACK_BGM,
    SOUNDTRACK_BUTTON,
    SOUNDTRACK_CRASH,
    SOUNDTRACK_EAT,
    SOUNDTRACK_TURN,
    FONT_SHP21_BLACK,
    FONT_SHP21_BOLD,
    FONT_SHP21_XBOLD,
    FONT_SHP21_LIGHT,
    FONT_SHP21_MEDIUM,
    FONT_SHP21_REGULAR,
    FONT_SHP21_SBOLD,
}

// convert enum
convertEnum(ASSET_KEY);
setAssetEnum(ASSET_KEY);
Enum(ASSET_KEY);
