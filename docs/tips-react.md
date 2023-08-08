# Tips of React.js

## Too much ContextProvider

別に問題はないとのこと。

すっきりさせたいなら次の方法を試せばいいとのこと。

https://stackoverflow.com/questions/51504506/too-many-react-context-providers

## custom hooks は ReactComponent のなかからしか呼び出せないよ

なので例えば custom context のなかで、

```TypeScript
import usePackage from '../hooks/usePackage';

// outside of React component...
const package = usePackage();       // ERROR!
```

```
Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.
const packageJson = usePackageJson();
const packageJsonCode = JSON.parse(packageJson.getValue());
```
