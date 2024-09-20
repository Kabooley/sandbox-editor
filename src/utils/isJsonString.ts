/******************************************************
 * @param {string} str
 * @returns {string} - Returns JSON.parse(str) if passed str is valid JSON string.
 * @throws {SyntaxError} - If passed str is invalid JSON.
 * ****************************************************/
export const isJsonString = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    throw new Error('Passed string is not valid JSON');
  }
};
