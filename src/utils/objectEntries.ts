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

// /**
//  * Polyfill of Object.entires
//  *
//  * Ref:
//  * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
//  * https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.entries.js
//  * */
// export const objectEntries = (obj: any) => {
//   var ownProps = Object.keys(obj),
//     i = ownProps.length,
//     resArray = new Array(i);
//   while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

//   return resArray;
// };

// // ChatGpt version
// // Polyfill for Object.entries
// if (!Object.entries) {
//   Object.entries = function <T>(obj: { [key: string]: T }): [string, T][] {
//     const result: [string, T][] = [];

//     // Loop through the object properties
//     for (const key in obj) {
//       if (obj.hasOwnProperty(key)) {
//         result.push([key, obj[key]]);
//       }
//     }

//     return result;
//   };
// }

export function objectEntries<T>(obj: { [key: string]: T }): [string, T][] {
  const result: [string, T][] = [];

  // Loop through the object properties
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result.push([key, obj[key]]);
    }
  }

  return result;
}

/*
== How to add polyfills to project

When working with a web application that needs to support older ECMAScript environments (browsers that don’t support the latest JavaScript features), you can add polyfills to ensure compatibility. Here’s how you can manage and add polyfills to your project using JavaScript and TypeScript:

### 1. **Manual Polyfills (Inline or External File)**

You can manually add polyfills in your code for specific features like `Object.entries()` or others that aren't supported.

#### Steps:
- Create a file (e.g., `polyfills.ts` or `polyfills.js`).
- Add all necessary polyfills inside that file.
- Import the polyfill file in your main entry point (e.g., `main.ts` or `index.js`).

**Example:**

`src/polyfills.ts`

```typescript
// Polyfill for Object.entries()
if (!Object.entries) {
  Object.entries = function (obj: object) {
    return Object.keys(obj).map(key => [key, obj[key]]);
  };
}

// Add other polyfills if needed...
```

In your entry point file (e.g., `index.ts` or `main.ts`):

```typescript
import './polyfills'; // Import the polyfill file early in the app
```

### 2. **Using Polyfill Libraries (e.g., core-js)**

A popular way to handle polyfills for missing features is using a library like `core-js`, which provides a comprehensive set of polyfills for different ECMAScript features.

#### Steps:
1. Install `core-js`:

```bash
npm install core-js
```

2. Import the necessary polyfills in your entry point file (`main.ts` or `index.js`).

**Example:**

```typescript
// Import specific polyfills from core-js
import 'core-js/es/object/entries'; // For Object.entries()
import 'core-js/es/promise';        // For Promise
import 'core-js/es/array/includes'; // For Array.includes()
```

3. In TypeScript, make sure `tsconfig.json` is set to target the older ECMAScript version you're supporting (e.g., `ES5`, `ES6`), and include `lib` if needed.

```json
{
  "compilerOptions": {
    "target": "ES5", // Specify the ECMAScript version
    "lib": ["es2015", "dom"], // Include necessary libs
    "module": "commonjs"
  }
}
```

### 3. **Babel with Polyfill**

If you're using Babel as part of your build pipeline, Babel can automatically include polyfills for missing features based on your target environment.

#### Steps:
1. Install `@babel/preset-env` and `core-js`:

```bash
npm install @babel/preset-env core-js
```

2. Configure Babel to use the `preset-env` with polyfills.

`babel.config.js`

```javascript
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: "> 0.25%, not dead", // Specify target environments
        useBuiltIns: "entry",          // Use 'entry' to include polyfills
        corejs: 3                      // Use core-js version 3
      }
    ]
  ]
};
```

3. In your entry point file (e.g., `index.js` or `main.ts`), import the polyfills:

```javascript
import "core-js/stable";
import "regenerator-runtime/runtime";
```

This setup ensures that necessary polyfills are automatically added based on your target browsers.

### 4. **Using `tsconfig` and `browserlist` for Targeting Specific Browsers**

When you're using TypeScript or JavaScript in modern frameworks (e.g., React, Angular, etc.), they often use a file called `.browserslistrc` to define the browsers your application supports. Tools like Babel and `@babel/preset-env` can use this file to determine what polyfills are necessary.

`.browserslistrc` example:

```
> 1%, last 2 versions, Firefox ESR, not dead
```

By configuring this, tools like Babel will handle most polyfill management automatically.

### Summary:
- **Manual Polyfills**: Write them directly if you only need a few specific features.
- **Polyfill Libraries**: Use libraries like `core-js` for more comprehensive support.
- **Babel**: Automatically inject polyfills based on your target environment.



*/
