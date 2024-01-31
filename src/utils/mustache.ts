/***
 * @param {string} target -
 * @param {{ [key: string]: string }} replacements -
 *
 * In case parameters are like below:
 * target: "The file '{{FILENAME}}' will be removed from '{{FOLDERNAME}}'"
 * replacements: {FILENAME: "Counter.ts", FOLDERNAME: "Counter/"}
 *
 *  _match: {{FILENAME}}
 *  match: FILENAME
 *  _result: {{Counter.ts}}
 *  r: Counter.ts
 *
 * Result: "The file 'Counter.ts' will be removed from 'Counter/'"
 *
 * Pattern /[\w\.\/]+/g は半角英数字、ピリオド、スラッシュの文字列にマッチする。
 *
 * 参考：
 * https://stackoverflow.com/a/15502875
 * https://stackoverflow.com/a/17304898
 * */
export const mustache = (
  target: string,
  replacements: { [key: string]: string }
) => {
  return target.replace(/\{\{(.*?)\}\}/g, function (_match, ..._args) {
    const replacedInsideMustache = _match.replace(
      /[\w\.\/]+/g,
      function (match, ...args) {
        for (const key in replacements) {
          if (key === match) {
            return replacements[key];
          }
        }
        return match;
      }
    );
    const r = replacedInsideMustache.match(/[\w\.\/]+/)![0];
    return r ? r : _match;
  });
};
