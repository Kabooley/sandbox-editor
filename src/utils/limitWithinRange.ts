/***
 * Limit given variable within specified range.
 *
 * @param {number} val - Subject number to find if it is within the given range.
 * @param {number} _min - Minimum number of range.
 * @param {number} _max - Maximum number of range.
 * @returns {number} - Returns val if given val is within range. Returns the nearest minimum or maximum value if the given number is out of range.
 *
 * 関数名を`ClampToRange`や`ClampValue`にしたらとAIに提案されました。
 * */
export const limitWithinRange = (val: number, _min: number, _max: number) => {
  return Math.max(_min, Math.min(val, _max));
};
