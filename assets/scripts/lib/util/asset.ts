/**
 * Returns the cache key for the corresponding key's asset
 * @param key string
 * @returns assetKey (string)
 */
export function getAssetKey(key: string) {
  return `${key}_ASSET`;
}

var assetObject: any = {};

export function setAssetEnum<T extends object>(obj: T) {
  assetObject = obj;
}

export function getAssetEnum() {
  return assetObject;
}

export function getKeyEnum(key: any): string {
  return assetObject[key] || '';
}

export function hashCode(s: string | number) {
  const t = typeof s === 'number' ? s.toString() : s;
  for (var i = 0, h = 0; i < t.length; i++)
    h = (Math.imul(31, h) + t.charCodeAt(i)) | 0;
  return h;
}

export function checkDupeVal(obj: any, value: number) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === value) {
      throw new Error('Dupe value');
    }
  });
}

export function convertEnum(obj: any) {
  Object.keys(obj).forEach((key) => {
    const nan = Number.isNaN(Number(key));
    if (!nan) {
      delete obj[key];
      return;
    }

    const nanVal = Number.isNaN(Number(obj[key]));
    const hashVal = Number(hashCode(nanVal ? obj[key] : key));
    checkDupeVal(obj, hashVal);
    obj[key] = hashVal;
  });
}
