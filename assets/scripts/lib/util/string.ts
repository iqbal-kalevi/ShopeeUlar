export function toHex(num: number) {
  return getZeroPaddedString(num.toString(16), 2);
}

export function getZeroPaddedString(
  str: string,
  zeroPad: number,
  zeroPadChar = '0',
) {
  const missingZeros = zeroPad - str.length;

  let zeros = '';
  for (let i = 0; i < missingZeros; i++) {
    zeros = `${zeros}${zeroPadChar}`;
  }

  return `${zeros}${str}`;
}
