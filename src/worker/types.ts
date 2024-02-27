// import type { TypingsResult } from './fetchLibs.worker';

export enum OrderTypes {
    Bundle = 'bundle',
    JsxHighlight = 'jsxhighlight',
    FetchLibs = 'RESOLVE_DEPENDENCY',
}

type iOrder =
    | 'order'
    | 'bundle'
    | 'jsxhighlight'
    | 'eslint'
    | 'RESOLVE_DEPENDENCY';

interface iRequest {
    order: iOrder;
}

interface iResponse {
    error: Error | null;
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

// ---- fetchLibs.worker.ts  ---

export interface iRequestFetchLibs extends iRequest {
    order: 'RESOLVE_DEPENDENCY';
    payload: {
        moduleName: string;
        version: string;
    };
}

export interface iResponseFetchLibs extends iResponse {
    order: 'RESOLVE_DEPENDENCY';
    payload: {
        moduleName: string;
        version: string;
        depsMap: Map<string, string>;
    };
    restoredModuleVersion?: string | undefined;
}

interface Logger {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
    groupCollapsed: (...args: any[]) => void;
    groupEnd: (...args: any[]) => void;
}

// 正直いらないかも。ATAのconfigをひとまず模倣しただけ。この方法は便利そうですけどね。
export interface iConfig {
    typescript: typeof import('typescript');
    logger?: Logger;
    // delegate: {
    //   start: () => void;
    //   finished: () => void;
    // };
}

// Tree object that contained in response from fetching package module.
export interface iTreeMeta {
    default: string;
    files: Array<{ name: string }>;
    moduleName: string;
    version: string;
}
