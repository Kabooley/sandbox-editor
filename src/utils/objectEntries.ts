/***************************************************
 * Pollyfil of `Object.entries()`
 *
 * MDNで`core-js`のライブラリを紹介している:
 *
 * https://stackoverflow.com/a/45851440/22007575
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#see_also
 * https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.entries.js
 * https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/object-to-array.js
 *
 * ただしcore-jsだと複雑すぎるので...
 * *************************************************/

// // const [key, value] = Object.entries(obj);
// const objectEntries = <T>(
//     obj: { [s: string]: T } | ArrayLike<T>
// ): [string, T][] => {
//     const ownProps = Object.keys(obj);
//     const length = ownProps.length;
//     const entries = new Array(length);
//     for (let i = 0; i < length; i++) {
//         entries[i] = [ownProps[i], obj[ownProps[i]]];
//     }
//     return entries;
// };

// Object.entriesの型情報
// /**
//  * Returns an array of key/values of the enumerable properties of an object
//  * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
//  */
// entries<T>(o: { [s: string]: T } | ArrayLike<T>): [string, T][];
