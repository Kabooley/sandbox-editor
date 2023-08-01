export type { TypingsResult } from './fetchLibs.worker';

export enum OrderTypes {
    Bundle = 'bundle',
    JsxHighlight = 'jsxhighlight',
    FetchLibs = 'fetch-libs',
}

type iOrder = 'order' | 'bundle' | 'jsxhighlight' | 'eslint' | 'fetch-libs';

/***
 * Common property which must be included in any messages.
 * */
interface iRequest {
    order: iOrder;
}

export interface iResponse {
    err: Error | null;
}

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
    rawCode: string;
}

// Message through bundle.worker.ts to main thread
// must be follow interface.
export interface iOrderBundleResult extends iBuildResult {}

export interface iFetchedOutput {
    [modulePath: string]: string;
}

// export interface iResultFetchTypings extends iResponse, TypingsResult {};
