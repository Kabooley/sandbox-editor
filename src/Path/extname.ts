/**
 *
 * https://nodejs.dev/en/api/v16/path/#pathextnamepath
 *
 * https://stackoverflow.com/a/680982/22007575
 *  */

const re = /(?:\.([^.]+))?$/;

export const extname = (path: string) => {
  const ex = re.exec(path);
  return ex ? ex[1] : "";
};

// --- usage ---
//
// const dummy = [
//   "file.name.with.dots.txt",
//   "file.txt",
//   "file",
//   ".file",    // これは解決できないみたい
//   ".file.md",
//   ""
// ];

// dummy.forEach((d, index) => console.log(`${index}: ${extname(d)}`));
