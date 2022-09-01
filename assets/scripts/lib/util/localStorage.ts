import { game, sys } from 'cc';
import { LOCAL_STORAGE_KEY } from '../enum/localStorage';
import { GAME_EVENT } from '../enum/game';

/**
 * Returns value stored in the given key in the localStorage (uses cocos' localStorage)
 * @param key
 * @returns
 */
export function getValueFromLocalStorage(key: string) {
  return sys.localStorage.getItem(key);
}

/**
 * Updates the value for the given key in the localStorage (uses cocos' localStorage)
 * @param key
 * @param value
 */
export function updateLocalStorageValue(key: string, value: string) {
  sys.localStorage.setItem(key, value);
}

export function getSoundStateFromLocalStorage() {
  const state = getValueFromLocalStorage(LOCAL_STORAGE_KEY.COCOS_SOUND_STATE);

  if (state === undefined || state === null) {
    return true;
  }

  return Boolean(Number(state));
}

export function updateLocalStorageSoundState(state: boolean) {
  const value = state ? 1 : 0;

  updateLocalStorageValue(
    LOCAL_STORAGE_KEY.COCOS_SOUND_STATE,
    value.toString(),
  );

  game?.emit(GAME_EVENT.SOUND_STATE_CHANGE, state);
}

export function getHighscoreFromLocalStorage() {
  const score = getValueFromLocalStorage(LOCAL_STORAGE_KEY.USER_HIGHSCORE);

  if (score === undefined || score === null) {
    return 0;
  }

  return parseInt(score);
}

export function updateLocalStorageHighscore(score: number){
  if(score <= getHighscoreFromLocalStorage()) return;

  updateLocalStorageValue(
    LOCAL_STORAGE_KEY.USER_HIGHSCORE,
    score.toString(),
  );

  game?.emit(GAME_EVENT.HIGHSCORE_CHANGE, score);
}
