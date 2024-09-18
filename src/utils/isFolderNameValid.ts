// https://stackoverflow.com/questions/6222215/regex-for-validating-folder-name-file-name

const foldernmaeRegexp = /^[^\\\/?%*:|"'<>\.]+$/;

/****
 * Checks if passed name includes any invalid characters.
 * Only `-` and `_`, `.` can be allowed. 
 *
 * Filename should not contain...
 * \ / ? % * : | " < >
 *
 * NOTE: 改行抜きの文字列が渡されることが前提となっている。
 ****/
export const isFolderNameValid = (name: string): boolean => {
    return foldernmaeRegexp.test(name);
};
