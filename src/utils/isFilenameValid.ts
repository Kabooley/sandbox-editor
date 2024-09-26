const filenameRegexp = /^([A-Za-z0-9\-\_\.]+)\.([a-zA-Z0-9]{1,9})$/;
const filenameWithoutExtension = /^([A-Za-z0-9\-\_]+)$/;

/***
 * Check if passed filename path is valid.
 *
 * https://google.github.io/styleguide/jsguide.html#file-name
 *
 * NOTE: Linuxでは受け付けているけどピリオドで終了する文字列は受け付けない
 * */
export const isFilenameValid = (path: string): boolean => {
  const result = filenameRegexp.test(path);
  if (result) return result;
  // in case passed path without period.
  if (path.split('.').length === 1) {
    return filenameWithoutExtension.test(path);
  }
  return false;
};
