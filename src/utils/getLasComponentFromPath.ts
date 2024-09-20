/**************************************************************
 * Returns last path compopnent as string if passed path is not end with slash.
 *
 * @param {string} path - path string.
 * @returns {string} - Last path components string end with no slash.
 *
 * getLasComponentFromPath
 ************************************************************/
// export const getFilenameFromPath = (path: string): string => {
export const getLasComponentFromPath = (path: string): string => {
  return path.replace(/^.*[\\\/]/, '');
};
