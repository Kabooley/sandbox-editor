/***
 * Alternative of Node.js Path.join() method.
 * https://nodejs.dev/en/api/v16/path/#pathjoinpaths
 *
 *  https://stackoverflow.com/questions/29855098/is-there-a-built-in-javascript-function-similar-to-os-path-join
 *
 * https://gist.github.com/creationix/7435851
 *  */
export const join = (...str: string[]) => {
    // Split the inputs into a list of path commands.
    var parts: string[] = [];
    for (var i = 0, l = str.length; i < l; i++) {
      parts = parts.concat(str[i].split("/"));
    }
    // Interpret the path commands to get the new resolved path.
    var newParts = [];
    for (i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];
      // Remove leading and trailing slashes
      // Also remove "." segments
      if (!part || part === ".") continue;
      // Interpret ".." to pop the last segment
      if (part === "..") newParts.pop();
      // Push new path segments.
      else newParts.push(part);
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === "") newParts.unshift("");
    // Turn back into a single string path.
    return newParts.join("/") || (newParts.length ? "/" : ".");
  };
  
  // --- usage ---
  //
  // const sample1 = [
  //   '/foo', 'bar', 'baz/asdf', 'quux', '..'
  // ];
  
  // function join(...str: string[]) {
  //   // Split the inputs into a list of path commands.
  //   var parts: string[] = [];
  //   for (var i = 0, l = str.length; i < l; i++) {
  //     parts = parts.concat(str[i].split("/"));
  //   }
  //   // Interpret the path commands to get the new resolved path.
  //   var newParts = [];
  //   for (i = 0, l = parts.length; i < l; i++) {
  //     var part = parts[i];
  //     // Remove leading and trailing slashes
  //     // Also remove "." segments
  //     if (!part || part === ".") continue;
  //     // Interpret ".." to pop the last segment
  //     if (part === "..") newParts.pop();
  //     // Push new path segments.
  //     else newParts.push(part);
  //   }
  //   // Preserve the initial slash if there was one.
  //   if (parts[0] === "") newParts.unshift("");
  //   // Turn back into a single string path.
  //   return newParts.join("/") || (newParts.length ? "/" : ".");
  // }
  
  // console.log(join(...sample1));
  