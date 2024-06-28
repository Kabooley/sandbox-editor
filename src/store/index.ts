import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import layoutSlice from '../slices/layoutSlice';
import filesSlice from '../slices/filesSlice';
import typingLibsSlice from '../slices/typingLibsSlice';
import packageJsonSlice from '../slices/packageJsonSlice';

export const store = configureStore({
    reducer: {
        layout: layoutSlice,
        files: filesSlice,
        typingLibs: typingLibsSlice,
        packageJson: packageJsonSlice
    },
});

//
export type AppDispatch = typeof store.dispatch;
// RootStateとAppDispatchの型を推測させる
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
export type AppStore = typeof store;
