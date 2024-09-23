/********************************************************
 * 文字列の頭文字が`/`(slash)の時にその`/`を取り除いた文字列を返す
 *
 * 頭文字が`/`でなかった場合文字列はそのまま返される
 * *****************************************************/
const matchFirstSlashPattern = /^\//g;

export const removeFirstSlash = (str: string): string => {
  if (matchFirstSlashPattern.test(str))
    return str.replace(matchFirstSlashPattern, '');
  return str;
};
