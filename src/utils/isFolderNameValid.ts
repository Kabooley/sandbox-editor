// const foldernmaeRegexp = /^[^\\\/?%*:|"'<>\.]+$/;
const foldernmaeRegexp = /^[^\\\/\r\s\n\0]+$/;

/**
 * @param {string} name - Folder name.
 * @returns {boolean} - True as valid foldername.
 *
 * Foldername must not include `/` (slash), `\` (back slash), `\0` (null character)
 * Additionally the method does not allow `\s` (whitespace).
 *
 * Other special characters and alphanumeric should be allowed.
 *
 * Ref:
 * https://stackoverflow.com/questions/6222215/regex-for-validating-folder-name-file-name
 * */
export const isFolderNameValid = (name: string): boolean => {
  return foldernmaeRegexp.test(name);
};
