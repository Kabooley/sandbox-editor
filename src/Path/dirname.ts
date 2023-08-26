/***
 * Alternative of Node.js Path.dirname() method.
 *
 * */

export const dirname = (path: string): string => {
    const match = path.match(/(.*)[\/\/]/);
    return match ? match[1] : '';
};

// -- usage --
// const dummys = [
//   "foo/bar/fuga.js",
// "foo\bar\fuga.js",
// "C:foo/bar/fuga",
// "./bar/fuga.js",
// "./bar/fuga",
// ];
//
// dummys.forEach(d => console.log(dirname(d)));
