import { useDispatch, useSelector, useStore } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState, AppStore } from '.';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// withTypes<T>を使えばuseDispatchを呼び出したらAppDispatchの型を基にしたdispatchを生成させることができる
//
// withTypesの機能はv9.1.0からの模様で、v8にダウングレードしたので使用をあきらめる
// export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
// export const useAppSelector = useSelector.withTypes<RootState>();

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;

/***
 * https://react-redux.js.org/using-react-redux/usage-with-typescript#recommendations
 *
 * https://redux.js.org/tutorials/typescript-quick-start#use-typed-hooks-in-components
 * */
