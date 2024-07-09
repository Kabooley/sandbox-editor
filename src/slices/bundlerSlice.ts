/****************************************************************
 * TODOs:
 * - TODO: contextの方ではバンドル済の値を受け取るだけであったが、comlinkによる
 * workerの恩恵もあるので、バンドル処理の一切を管理するようにしてもいいのでは？
 * **************************************************************/
import {
    createSlice,
    createAsyncThunk,
    SerializedError,
} from '@reduxjs/toolkit';
import type { RootState } from '../store';
import * as Comlink from 'comlink';
import { iBundlerApi } from '../worker/bundle.worker';

interface iBundleState {
    bundledCode: string;
    bundling: boolean;
    error: SerializedError | null;
}

// src/worker/types.ts
interface iRequestBundlePayload {
    entryPoint: string;
    tree: Record<string, string>;
}

const initialState: iBundleState = {
    bundledCode: '',
    bundling: false,
    error: null,
};

const worker = new Worker(
    new URL('../worker/bundle.worker.ts', import.meta.url),
    { type: 'module' }
);
const bundleApi = Comlink.wrap<iBundlerApi>(worker);

// -- helper --

const terminateBundleWorker = () => {
    bundleApi[Comlink.releaseProxy]();
    worker.terminate();
};

// --- Redux Logic ---

/***
 * Requests bundle.worker to bundle passed tree codes.
 *
 * */
export const bundler = createAsyncThunk(
    'bundler/bundler',
    async ({ entryPoint, tree }: iRequestBundlePayload) => {
        return bundleApi.bundler(entryPoint, tree);
    }
);

const bundlerSlice = createSlice({
    name: 'bundler',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(bundler.pending, (state) => {
                state.bundling = true;
            })
            .addCase(bundler.fulfilled, (state, action) => {
                state.bundledCode = action.payload;
                state.bundling = false;
            })
            .addCase(bundler.rejected, (state, action) => {
                state.bundling = false;
                state.error = action.error;
                console.error(action.error);
            });
    },
});

export { terminateBundleWorker };
export const bundleActions = bundlerSlice.actions;
export const selectBundledCode = (state: RootState) => state.bundler;
export default bundlerSlice.reducer;
