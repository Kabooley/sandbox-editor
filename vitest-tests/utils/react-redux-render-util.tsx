/****
 * https://redux.js.org/usage/writing-tests#setting-up-a-reusable-test-render-function
 * 
 * Custom Render Functin:
 * 
 * - 呼び出されるたびに、初期値として使用できるオプションの preloadedState 値を使用して、新しい Redux ストア インスタンスを作成します。 
 * - すでに作成されている Redux ストア インスタンスを交互に渡します 
 * - 追加オプションを RTL の元のレンダリング関数に渡します。 
 * - テスト対象のコンポーネントを <Provider store={store}> で自動的にラップします。 
 * - テストでさらにアクションをディスパッチしたり状態をチェックしたりする必要がある場合は、ストア インスタンスを返します。

 * 
 * */
import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import type { AppStore, RootState } from '../../src/store';
import layoutSlice from '../../src/slices/layoutSlice';
import filesSlice from '../../src/slices/filesSlice';
import typingLibsSlice from '../../src/slices/typingLibsSlice';
import packageJsonSlice from '../../src/slices/packageJsonSlice';
import bundlerSlice from '../../src/slices/bundlerSlice';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

const rootReducer = combineReducers({
  layout: layoutSlice,
  files: filesSlice,
  typingLibs: typingLibsSlice,
  packageJson: packageJsonSlice,
  bundler: bundlerSlice,
});

const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
};

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  const Wrapper = ({ children }: PropsWithChildren<{}>): JSX.Element => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};
