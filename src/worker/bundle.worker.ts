import * as esbuild from 'esbuild-wasm';
// import { fetchPlugins, unpkgPathPlugin } from '../Bundle';
import { virtualTreePlugin } from '../Bundle/plugins/virtualTreePlugin';
import type { iOrderBundle } from './types';

/**
 * This must be same as
 * iBundledState.payload object.
 * */
interface iBuildResult {
    bundledCode: string;
    err: Error | null;
}

const initializeOptions: esbuild.InitializeOptions = {
    // wasmURL:  '/esbuild.wasm',
    worker: true,
    wasmURL: 'http://unpkg.com/esbuild-wasm@0.18.17/esbuild.wasm',
};

let isInitialized: boolean = false;

/**
 * @param { Record<string, string> } tree - File tree that about to bundled.
 *
 * */
const bundler = async (
    entryPoint: string,
    tree: Record<string, string>
): Promise<iBuildResult> => {
    try {
        // 必ずesbuildAPIを使い始める前に一度だけ呼出す
        if (!isInitialized) {
            await esbuild.initialize(initializeOptions);
            isInitialized = true;
            console.log('initialized');
        }

        const buildOptions: esbuild.BuildOptions = {
            entryPoints: [entryPoint],
            // explicitly specify bundle: true
            bundle: true,
            // To not to write result in filesystem.
            write: false,
            // To use plugins which solves import modules.
            // plugins: [fetchPlugins(rawCode), unpkgPathPlugin()],
            plugins: [virtualTreePlugin(tree)],
        };

        const result = await esbuild.build(buildOptions);

        if (result === undefined) throw new Error();

        // DEBUG:
        console.log('[bundle.worker] result:');
        console.log(result);

        return {
            bundledCode: result.outputFiles![0].text,
            err: null,
        };
    } catch (e) {
        if (e instanceof Error) {
            return {
                bundledCode: '',
                err: e,
            };
        } else throw e;
    }
};

/***
 * NOTE: Validate MessageEvent.origin is unavailable because origin is always empty string...
 *
 * */
self.onmessage = (e: MessageEvent<iOrderBundle>): void => {
    if (e.data.order !== 'bundle') return;

    // DEBUG:
    console.log('[bundle.worker.ts] start bundle process...');

    const { entryPoint, tree } = e.data;

    if (entryPoint && tree) {
        bundler(entryPoint, tree)
            .then((result: iBuildResult) => {
                if (result.err instanceof Error) throw result.err;

                // DEBUG:
                console.log('[budle.worker.ts] sending bundled code');

                // NOTE: Follow iOrderBundleResult type
                // which defined in `./types.ts`.
                self.postMessage({
                    bundledCode: result.bundledCode,
                    err: null,
                });
            })
            .catch((e) => {
                // DEBUG:
                console.log('[budle.worker.ts] sending Error');

                self.postMessage({
                    bundledCode: '',
                    err: e,
                });
            });
    }
};
