// import type { TypingsResult } from './fetchLibs.worker';

export enum OrderTypes {
    Bundle = 'bundle',
    JsxHighlight = 'jsxhighlight',
    FetchLibs = 'fetch-libs',
}

type iOrder = 'order' | 'bundle' | 'jsxhighlight' | 'eslint' | 'fetch-libs';

interface iRequest {
    order: iOrder;
}

interface iResponse {
    err: Error | null;
}

// --- BUNDLE ---

export interface iBuildResult extends iResponse {
    bundledCode: string;
}

/***
 * Message through Main thread to bundle.worker.ts must be follow interface below.
 *
 * @property {string} rawCode - Code sent from main thread and about to be bundled.
 * @property {string} bundledCode - Bundled code to be send to main thread.
 * @property {Error | null} err - Error occured during bundling.
 * */
export interface iOrderBundle extends iRequest {
    entryPoint: string;
    tree: Record<string, string>;
}

// Message through bundle.worker.ts to main thread
// must be follow interface.
export interface iOrderBundleResult extends iBuildResult {}

// --- FetchLibsWorker ---

export interface iFetchRequest extends iRequest {
    name: string;
    version: string;
}

// export interface iFetchResponse extends TypingsResult, iResponse {}

// export interface iFetchedOutput {
//     [modulePath: string]: string;
// }

// export interface iResultFetchTypings extends iResponse, TypingsResult {};
