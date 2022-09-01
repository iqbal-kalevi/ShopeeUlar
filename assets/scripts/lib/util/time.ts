/**
 * Format time into `00m 00s`
 * @param {number} ms - time to be formatted in miliseconds
 * @returns {string} formatted time
 */
export const formatTime = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);

  const MINUTE_SYMBOL = 'm';
  const SECOND_SYMBOL = 's';

  if (minutes <= 0) {
    return `${seconds}${SECOND_SYMBOL}`;
  }

  return `${minutes}${MINUTE_SYMBOL} ${seconds}${SECOND_SYMBOL}`;
};
