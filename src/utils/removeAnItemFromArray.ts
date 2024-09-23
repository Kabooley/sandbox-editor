/***
 * 引数`arr`から引数`value`に一致する要素を抜き取った配列を返す
 * - 戻り値の配列は元の配列（引数の配列）であるので新しい配列は作成されない
 * - 一致する要素を探すのにindexOfを使っているので「初めに一致した要素」が取り除かれることになる
 *
 *
 * 参考：
 * https://stackoverflow.com/a/5767357/22007575
 * */
export const removeAnItemFromArray = <T>(arr: Array<T>, value: T) => {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
};
