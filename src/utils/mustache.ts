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
    console.log(`[mustache] replacements: match: ${_match}`);
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

    console.log(replacedInsideMustache);

    // replacedInsideMustacheがパターン/[\w\.\/]+/に一致しないとrはnullになる
    const r = replacedInsideMustache.match(/[\w\.\/]+/);
    if (r) {
      const replacedString = replacedInsideMustache.match(/[\w\.\/]+/)![0];
      return replacedString ? replacedString : _match;
    } else {
      return _match;
    }
  });
};

/*
`target.replace()`はtarget文字列のうち、第一引数の正規表現（`{{` と `}}` に挟まれた文字列）に一致する文字列が見つかるたびに、この関数が呼び出される

例：以下の例だと'{{FILENAME}}', '{{FOLDERNAME}}'がマッチするので、第二引数の関数は計2回呼び出される

target: "The file '{{FILENAME}}' will be removed from '{{FOLDERNAME}}'"
_match: '{{FILENAME}}', '{{FOLDERNAME}}'

`_match.replace()`では`target.replace()`でマッチした文字列（`_match`）から、
パターン（`/`とalphanumericの文字列）に一致する文字列を返す

_match: '{{FILENAME}}' -> match: FILENAME

あとは`match`と一致するkey名を引数`replacements`から探して一致すればそのreplacementsのpropertyの値と置換して返す

一致するものがなかった場合`_match`の値を返す
つまり、最終的に`{{FILENAME}}`と`{{FILENAME}}`の置換になるのでその個所の文字列は変更されずに返る。
*/
