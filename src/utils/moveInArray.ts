/***
 * 配列の元の範囲を守ったうえでold_indexの要素をnew_indexへ移動した新しい配列を返す
 *
 * - new_indexが配列の範囲外だった場合渡された配列と同じ内容の新しい配列を返す
 * */
export const moveInArray = <T>(
  arr: T[],
  old_index: number,
  new_index: number
): T[] => {
  if (new_index >= arr.length || new_index < 0) return arr.map((a) => a);
  const _arr = arr.map((a) => a);
  // if (new_index >= arr.length) {
  //   var k = new_index - arr.length + 1
  //   while (k--) {
  //     _arr.push(undefined)
  //   }
  // }
  _arr.splice(new_index, 0, _arr.splice(old_index, 1)[0]);
  return _arr as T[];
};

// /***
//  * Thanks to https://stackoverflow.com/a/5306832/22007575
//  *
//  * Returns new array.
//  *  */

// export const moveInArray = <T>(
//     arr: T[],
//     old_index: number,
//     new_index: number
// ): T[] => {
//     const _arr = arr.map((a) => a);
//     if (new_index >= arr.length) {
//         var k = new_index - arr.length + 1;
//         while (k--) {
//             _arr.push(undefined);
//         }
//     }
//     _arr.splice(new_index, 0, _arr.splice(old_index, 1)[0]);
//     return _arr;
// };
