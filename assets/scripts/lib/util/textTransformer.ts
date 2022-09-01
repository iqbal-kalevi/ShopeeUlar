/**
 * Format number to have period delimiters (.) in each thousand
 * @param val Number to be formatted
 * @returns Formatted number
 */
export const formatNumberDelimiter = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Convert number (cardinal number) to ordinal number, e.g first, second, etc.
 * @param val Number to be converted
 */
export const getOrdinalNumber = (val: number) => {
  if (val === 1) return 'first';

  const digits = [val % 10, val % 100],
    ordinals = ['st', 'nd', 'rd', 'th'],
    oPattern = [1, 2, 3, 4],
    tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];

  return oPattern.indexOf(digits[0]) > -1 && tPattern.indexOf(digits[1]) === -1
    ? val + ordinals[digits[0] - 1]
    : val + ordinals[3];
};
