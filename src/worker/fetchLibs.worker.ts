/************************************************************************************************
 * Fetches requested npm package module from jsdelvr
 *
 * - resolver呼出時の引数version番号は解決プロセス中に正確なバージョン番号`correctVersion`に更新されて返されます。
 *
 *
 * NOTE:
 * - importしたいモジュールが`window`グローバルスコープを必要としないかどうか予めチェックすること
 * - `import { preProcessFile } from 'typescript'`をすると`ts`って何？
 *    というエラーが発生するので結局すべてtypescriptをimportしている
 ************************************************************************************************/

import { valid } from 'semver';
import {
    getFileTreeForModuleByVersion,
    getFileForModuleByFilePath,
    getNPMVersionForModuleByReference,
    getNPMVersionsForModule,
} from './fetcher';
import { mapModuleNameToModule } from './edgeCases';
import {
    createStore,
    set as setItem,
    get as getItem,
    del as deleteItem,
} from 'idb-keyval';
import {
    iTreeMeta,
    iConfig,
    iRequestFetchLibs,
    iResponseFetchLibs,
} from './types';
import ts, { textChangeRangeIsUnchanged } from 'typescript';

// --- types ---

// types for ts.preProcessFile() method.
enum ModuleKind {
    None = 0,
    CommonJS = 1,
    AMD = 2,
    UMD = 3,
    System = 4,
    ES2015 = 5,
    ES2020 = 6,
    ES2022 = 7,
    ESNext = 99,
    Node16 = 100,
    NodeNext = 199,
}
type ResolutionMode = ModuleKind.ESNext | ModuleKind.CommonJS | undefined;
interface TextRange {
    pos: number;
    end: number;
}
interface FileReference extends TextRange {
    fileName: string;
    resolutionMode?: ResolutionMode;
}
interface PreProcessedFileInfo {
    referencedFiles: FileReference[];
    typeReferenceDirectives: FileReference[];
    libReferenceDirectives: FileReference[];
    importedFiles: FileReference[];
    ambientExternalModules?: string[];
    isLibFile: boolean;
}

type iTree =
    | iTreeMeta
    | { error: Error; message: string }
    | {
          error: {
              version: string | null;
          };
          message: string;
      };

// Type of `.d.ts` file from `iTreeMeta.files`.
interface iDTSFile {
    moduleName: string;
    moduleVersion: string;
    vfsPath: string;
    path: string;
}

// --- IndexedDB interfaces ---

/***
 * 以下のように依存関係名称と`依存関係@バージョン`のマップデータを保存する
 * e.g. {key: "react", value: "react@18.2.0"}
 * e.g. {key: "semver", value: "semver@7.5.4"}
 * */
type iStoreModuleNameVersionValue = string;
const storeModuleNameVersion = createStore(
    'sandbox-editor--modulename-n-version--cache-v1-db',
    'sandbox-editor--modulename-n-version--cache-v1-store'
);

/**
 * 以下のように`依存関係@バージョン`と、その依存関係に必要な依存関係一覧の組み合わせのMapデータを保存する
 * いわば依存関係の依存関係
 * key: react-dom@18.2.0"
 * value: Map(20) {'/node_modules/@types/react-dom/package.json' => '{\n  "name": "...}
 * */
type iStoreSetOfDependencyValue = Map<string, string>;
const storeSetOfDependency = createStore(
    'sandbox-editor--set-of-dependency--cachde-v1-db',
    'sandbox-editor--set-of-dependency--cachde-v1-store'
);

// --- Methods ---

/***
 * Fetch to get npm module package file lists.
 * fetch(`https://data.jsdelivr.com/v1/package/npm/${moduleName}@${version}/flat`).
 *
 * @param {iConfig} config -
 * @param {string} moduleName - Name of npm module package.
 * @param {string} version - Version of npm module package.
 * @returns {Promise<{moduleName: string; version: string; default: string; files: Array<{name: string;}>;} | {error: Error; message: string;}>} - Object that contains file list of package or fetching error.
 *
 * This will fix version when `version` is incorrect if possible.
 * `response` contains its modules's correct version.
 * */
const getFileTreeForModule = async (
    config: iConfig,
    moduleName: string,
    version: string
) => {
    let _version = version;
    if (!_version.length) _version = 'latest';

    // Update version if passed version is like "18.0".
    if (version.split('.').length < 2) {
        // The jsdelivr API needs a _version_ not a tag. So, we need to switch out
        // the tag to the version via an API request.
        const response = await getNPMVersionForModuleByReference(
            moduleName,
            _version
        );
        if (response instanceof Error) {
            return {
                error: response,
                message: `Could not go from a tag to version on npm for ${moduleName} - possible typo?`,
            };
        }

        const neededVersion = response.version;
        if (!neededVersion) {
            const versions = await getNPMVersionsForModule(moduleName);
            if (versions instanceof Error) {
                return {
                    error: response,
                    message: `Could not get versions on npm for ${moduleName} - possible typo?`,
                };
            }

            const tags = Object.entries(versions.tags).join(', ');
            return {
                error: new Error('Could not find tag for module'),
                message: `Could not find a tag for ${moduleName} called ${_version}. Did find ${tags}`,
            };
        }

        _version = neededVersion;
    }

    const response = await getFileTreeForModuleByVersion(
        config,
        moduleName,
        _version
    );
    if (response instanceof Error) {
        return {
            error: response,
            message: `${response.message} Please make sure module name or version is correct.`,
        };
    }

    // // DEBUG:
    // console.log('[fetchLibs.worker] getFileTreeForModule response:');
    // console.log(response);

    return response;
};

// --- helpers ---

/***
 *  0:  exact match
 *  -1: `moduleName`@`version` < `compareWith`
 *  1:  `moduleName`@`version` > `compareWith`
 * */
const compareTwoModuleNameAndVersion = (
    moduleName: string,
    version: string,
    compareWith = ''
) =>
    compareWith
        .toLocaleLowerCase()
        .localeCompare((moduleName + '@' + version).toLocaleLowerCase());


/***
 * Return true if same module name but different version.
 *
 * @param {string} moduleName - Module's name to be compared.
 * @param {string} version - Version to be compared.
 * @param {string} module - String concist of module name and version and `@` to be sandwiched. e.g. `react@18.2.0`.
 * */
const isSameNameAnotherVersion = (
    moduleName: string,
    version: string,
    module: string
  ) => {
    if (module.indexOf('@') === 0) {
      const sub = module.slice(1).split('@');
      return `@` + sub[0] === moduleName && sub[sub.length - 1] !== version;
    } else {
      const sub = module.split('@');
      return sub[0] === moduleName && sub[1] !== version;
    }
  };

/***
 * Check if parameter string includes any whitespaces.
 * */
const isIncludingWhiteSpaces = (str: string) => {
    return /\s/g.test(str);
};

/***
 * Exclude invalid module name.
 *
 * https://docs.npmjs.com/package-name-guidelines
 * https://github.com/npm/validate-npm-package-name#naming-rules
 *
 * Module name begins with '.', '_' is not allowed.
 * Module name includes any whitespace is not allowed.
 * package name should not contain any of the following characters: ~)('!*
 * */
const excludeInvalidModuleName = (moduleName: string) => {
    let result = true;
    result = !moduleName.startsWith('.') && result;
    result = !moduleName.startsWith('_') && result;
    result = !isIncludingWhiteSpaces(moduleName) && result;
    // TODO: use regext to exlude name including invalid character
    return result;
};

/***
 * Exclude invalid npm package version string.
 *
 * @param {string} version - Version string that will be checked by semver.valid().
 * @returns {string|null} - Returns result of semver.valid(version).
 *
 * https://semver.org/
 * https://www.npmjs.com/package/semver
 * https://semver.org/#backusnaur-form-grammar-for-valid-semver-versions
 *
 * NOTE: semver does not allows `latest` as correct versioning.
 * 厳密なバージョン指定でないと受け付けない。つまり、`X.Y.Z`
 * */
const validateModuleVersion = (version: string) => {
    return valid(version);
};

/**
 * Retrieve referenced files which has `.d.ts` extension from tree object.
 *
 * @param {iTreeMeta} tree - Tree object which was fetched by its module name and contains files which are referenced from the module.
 * @param {string} vfsPrefix - Virtual file path for `.d.ts` file.
 * @returns {Array<iDTSFile>}
 * */
const getDTSFilesFromTree = (tree: iTreeMeta, vfsPrefix: string) => {
    const dtsFiles: iDTSFile[] = [];

    for (const file of tree.files) {
        if (file.name.endsWith('.d.ts')) {
            dtsFiles.push({
                moduleName: tree.moduleName,
                moduleVersion: tree.version,
                vfsPath: `${vfsPrefix}${file.name}`,
                path: file.name,
            } as iDTSFile);
        }
    }

    return dtsFiles;
};

// `react-dom/client`を`react-dom__client`にしてくれたりする
// Taken from dts-gen: https://github.com/microsoft/dts-gen/blob/master/lib/names.ts
function getDTName(s: string) {
    if (s.indexOf('@') === 0 && s.indexOf('/') !== -1) {
        // we have a scoped module, e.g. @bla/foo
        // which should be converted to   bla__foo
        s = s.substr(1).replace('/', '__');
    }
    return s;
}

/***
 * Parse passed code and returns list of imported module name and version set.
 *
 * @param {import("typescript")} ts - TypeScript library.
 * @param {string} code - Code that will be parsed what modules are imported in this code.
 * @return {Array<{module: string, version: string}>} - `code`から読み取ったimportモジュールのうち、
 * `.d.ts`拡張子ファイルでないもの、TypeScriptライブラリでないものをリスト化して返す。
 * */
const retrieveImportedModulesByParse = (
    ts: typeof import('typescript'),
    code: string
) => {
    // ts: typescript
    const meta = ts.preProcessFile(code);
    // const meta = ts.preProcessFile(code) as PreProcessedFileInfo;
    // Ensure we don't try download TypeScript lib references
    // @ts-ignore - private but likely to never change
    const libMap: Map<string, string> = ts.libMap || new Map();

    // meta.referencedFiles, meta.importedFiles, meta.libReferenceDirectives
    // をいったん一つの配列にまとめて、
    //`.d.ts`拡張子ファイルでないもの、かつすでに取得済でないモジュールを抽出する
    const references = meta.referencedFiles
        .concat(meta.importedFiles)
        .concat(meta.libReferenceDirectives)
        .filter((f) => !f.fileName.endsWith('.d.ts'))
        .filter((d) => !libMap.has(d.fileName));

    return references.map((r) => {
        let version = undefined;
        if (!r.fileName.startsWith('.')) {
            version = 'latest';
            const line = code.slice(r.end).split('\n')[0]!;
            if (line.includes('// types:'))
                version = line.split('// types: ')[1]!.trim();
        }

        return {
            module: r.fileName,
            version,
        };
    });
};

// --- Main ---

/***
 * Agent resolves module's type definition files.
 *
 * @param {iConfig} config - Config for this agent.
 * @param {string} moduleName - Module name to be resolved.
 * @param {string} version - Module's version to be resolved.
 * @returns {Promise<{vfs: Map<string, string>; moduleName: string; version: string;}>} - Resolved type definition files for the module and its code. Version number may have been updated since the time of the call.
 *
 * */
const fetchTypeAgent = (
    config: iConfig,
    moduleName: string,
    version: string
) => {
    // const moduleMap = new Map<string, ModuleMeta>();
    const fsMap = new Map<string, string>();
    // moduleNameのモジュールの正確なバージョンを記憶する
    let correctVersion = '';

    let downloading = 0;
    let downloaded = 0;

    // DEBUG:
    const fetchingModuleTitle = `${moduleName}@${version}`;

    const resolver = async (
        _moduleName: string,
        version: string,
        depth: number
    ) => {
        // // DEBUG:
        // console.log(`[fetching ${fetchingModuleTitle}] depth: ${depth}`);

        // Exclude invalid module name and invalid version.
        if (!excludeInvalidModuleName(_moduleName)) {
            if (depth > 0) return;
            throw new Error(
                'Error: Invalid module name. You might input incorrect module name.'
            );
        }
        if (version !== 'latest' && !validateModuleVersion(version)) {
            if (depth > 0) return;
            throw new Error(
                'Error: Invalid semantic version. You might input incorrect module version.'
            );
        }

        // Converts some of the known global imports to node so that we grab the right info.
        // And strip module filepath e.g. react-dom/client --> react-dom
        const moduleName = mapModuleNameToModule(_moduleName);

        // // DEBUG:
        // console.log(
        //   `[fetching ${fetchingModuleTitle}] depsToGet: ${_moduleName}@${version}`
        // );

        // Return if it's already downloaded.
        const isAlreadyExists = await getItem(
            moduleName,
            storeModuleNameVersion
        );
        if (isAlreadyExists) {
            // console.log(
            //   `[fetching ${fetchingModuleTitle}] Module ${moduleName} is already downloaded.`
            // );
            return;
        }

        // Find where the .d.ts file at.
        // moduleMap.set(moduleName, { state: "loading" });
        await setItem(
            moduleName,
            `${moduleName}@${version}`,
            storeModuleNameVersion
        );

        const _tree: iTree = await getFileTreeForModule(
            config,
            moduleName,
            version
        );
        if (_tree.hasOwnProperty('error')) {
            config.logger?.error(
                (_tree as { error: Error; message: string }).message
            );
            throw (_tree as { error: Error; message: string }).error;
        }
        const tree = _tree as iTreeMeta;

        // Update requested module's version.
        if (depth === 0) {
            correctVersion = tree.version;
        }

        const hasDtsFile = tree.files.find((f) => f.name.endsWith('.d.ts'));

        // // DEBUG:
        // console.log(`[fetching ${fetchingModuleTitle}] hasDtsFile:`);
        // console.log(hasDtsFile);

        let DTSFiles1: iDTSFile[] = [];
        let DTSFiles2: iDTSFile[] = [];

        if (hasDtsFile !== undefined) {
            // Retrieve .d.ts file directly.
            DTSFiles1 = getDTSFilesFromTree(
                tree,
                `/node_modules/${tree.moduleName}`
            );
        } else {
            // Look for DT file instead.
            const _dtTree: iTree = await getFileTreeForModule(
                config,
                `@types/${getDTName(moduleName)}`,
                version
            );
            if (_dtTree.hasOwnProperty('error')) {
                config.logger?.error(
                    (_dtTree as { error: Error; message: string }).message
                );
                throw (_dtTree as { error: Error; message: string }).error;
            }
            const dtTree = _dtTree as iTreeMeta;

            // // DEBUG:
            // console.log(`[fetching ${fetchingModuleTitle}] dtTreesOnly:`);
            // console.log(dtTree);

            DTSFiles2 = getDTSFilesFromTree(
                dtTree,
                `/node_modules/@types/${getDTName(moduleName).replace(
                    'types__',
                    ''
                )}`
            );

            // // DEBUG:
            // console.log(`[fetching ${fetchingModuleTitle}] dtsFilesFromDT:`);
            // console.log(DTSFiles2);
        }

        const downloadListOfDTSFiles = DTSFiles1.concat(DTSFiles2);
        downloading = downloadListOfDTSFiles.length;

        // // DEBUG:
        // console.log(`[fetching ${fetchingModuleTitle}] allDTSFiles:`);
        // console.log(downloadListOfDTSFiles);

        // downloadListOfDTSFilesの長さがゼロの時はそのまま戻るので特に

        // Get package.json for module.
        await resolverOfPackageJson(tree);

        // Download all .d.ts files
        await Promise.all(
            downloadListOfDTSFiles.map(async (dtsFile) => {
                const dtsFileCode = await getFileForModuleByFilePath(
                    config,
                    dtsFile.moduleName,
                    dtsFile.moduleVersion,
                    dtsFile.path
                );
                downloaded++;
                if (dtsFileCode instanceof Error) {
                    config.logger?.error(
                        `Had an issue getting ${dtsFile.path} for ${dtsFile.moduleName}`
                    );
                } else {
                    fsMap.set(dtsFile.vfsPath, dtsFileCode);
                    // NOTE: ファイルを一つダウンロードする度に何かしたい場合このタイミング
                    // 例えば進行状況とかログに出したいとか。

                    // Retrieve all imported module names
                    const modules = retrieveImportedModulesByParse(
                        config.typescript,
                        dtsFileCode
                    );
                    // Recurse through deps

                    await Promise.all(
                        modules.map((m) => {
                            const _version: string =
                                m.version === undefined ? 'latest' : m.version;
                            return resolver(m.module, _version, depth + 1);
                        })
                    );
                }
            })
        );
    };

    // Get package.json for the dependency.
    const resolverOfPackageJson = async (tree: iTreeMeta) => {
        let prefix = `/node_modules/${tree.moduleName}`;
        if (tree.files.find((f) => f.name.endsWith('.d.ts')) === undefined) {
            prefix = `/node_modules/@types/${getDTName(tree.moduleName).replace(
                'types__',
                ''
            )}`;
        }
        const path = prefix + '/package.json';
        const pkgJSON = await getFileForModuleByFilePath(
            config,
            tree.moduleName,
            tree.version,
            '/package.json'
        );

        if (typeof pkgJSON == 'string') {
            fsMap.set(path, pkgJSON);
            // NOTE: ファイルを一つダウンロードする度に何かしたい場合このタイミング
            // 例えば進行状況とかログに出したいとか。
        } else {
            config.logger?.error(
                `Could not download package.json for ${tree.moduleName}`
            );
        }
    };

    return resolver(moduleName, version, 0).then(() => {
        // TODO: download数がゼロだった場合の処理を決める

        return {
            vfs: fsMap,
            moduleName: moduleName,
            // version: version,
            version: correctVersion,
        };
    });
};

// self.addEventListener('message', (e: MessageEvent<iRequestFetchLibs>) => {
self.onmessage = (e: MessageEvent<iRequestFetchLibs>) => {
    const { payload, order } = e.data;
    if (order !== 'RESOLVE_DEPENDENCY') return;
    const { moduleName, version } = payload;
    let temporarilyEvacuateItem: { key: string; value: string } | null = null;

    // TODO: configは必要か検討
    const config = {
        typescript: ts,
        logger: console,
    };

    // DEBUG:
    console.log(`[fetchLibs.worker] Got request: ${moduleName}@${version}`);

    getItem<iStoreModuleNameVersionValue>(
        moduleName,
        storeModuleNameVersion
    ).then((existItem) => {
        // `moduleName`@`version`がキャッシュ済である場合：
        if (
            existItem !== undefined &&
            !compareTwoModuleNameAndVersion(moduleName, version, existItem)
        ) {
            console.log(
                `[fetchDependencies] return cached data of ${moduleName}@${version}`
                );
                
            // キャッシュ済のデータを返す
            return getItem<iStoreSetOfDependencyValue>(
                moduleName + '@' + version,
                storeSetOfDependency
            ).then((vfs) => {
                self.postMessage({
                    order: 'RESOLVE_DEPENDENCY',
                    payload: {
                        moduleName: moduleName,
                        version: version,
                        depsMap: vfs,
                    },
                } as iResponseFetchLibs);
            });
        }
        // 既存モジュール別バージョンリクエストの場合：
        else if(
            existItem !== undefined && isSameNameAnotherVersion(moduleName, version, existItem)
        )
        {
            return (
                // 既存モジュールをいったん退避しておいてから別バージョンの取得処理に移る
                // 取得中にエラーが発生した場合に備えて。
                // (storeSetOfDependencyに登録されているアイテムは削除要求されても残す)
                Promise.resolve(temporarilyEvacuateItem = { key: moduleName, value: existItem })
                .then(() => deleteItem(moduleName, storeModuleNameVersion))
                .then(() => fetchTypeAgent(config, moduleName, version))
                .then(
                    (r: {
                        vfs: Map<string, string>;
                        moduleName: string;
                        version: string;
                    }) => {
                        setItem(
                            r.moduleName + '@' + r.version,
                            r.vfs,
                            storeSetOfDependency
                        );
                        self.postMessage({
                            order: 'RESOLVE_DEPENDENCY',
                            payload: {
                                moduleName: r.moduleName,
                                version: r.version,
                                depsMap: r.vfs,
                            },
                        } as iResponseFetchLibs);
                    }
                )
                // 既存モジュール別バージョンリクエスト対応中にエラーが発生した場合：
                // 既存モジュールを再登録する
                // レスポンスには取得失敗を示す`error`と、既存モジュールを再登録したことを示す
                // `restoredModuleVersion`を含める
                .catch((e: Error) => {
                    const emptyMap = new Map<string, string>();
                    getItem<iStoreSetOfDependencyValue>(temporarilyEvacuateItem!.value, storeSetOfDependency)
                    .then((item) => {
                        if(item !== undefined) {
                            return deleteItem(moduleName, storeModuleNameVersion)
                            .then(() => setItem(moduleName, temporarilyEvacuateItem!.value))
                            .then(() => true);
                        }
                        return deleteItem(moduleName, storeModuleNameVersion).then(() => false);
                    })
                    .then((didRestoreExistItem) => {
                        if(didRestoreExistItem) {
                            const splittedModule = temporarilyEvacuateItem!.value.split('@');
                            const restoredModuleVersion = splittedModule[splittedModule.length - 1];
                            self.postMessage({
                                order: 'RESOLVE_DEPENDENCY',
                                payload: {
                                    moduleName: moduleName,
                                    version: version,
                                    depsMap: emptyMap,
                                },
                                error: e,
                                restoredModuleVersion: restoredModuleVersion
                            } as iResponseFetchLibs);
                        }
                        self.postMessage({
                            order: 'RESOLVE_DEPENDENCY',
                            payload: {
                                moduleName: moduleName,
                                version: version,
                                depsMap: emptyMap,
                            },
                            error: e,
                        } as iResponseFetchLibs);

                    });

                    console.error(e);

                    // self.postMessage({
                    //     order: 'RESOLVE_DEPENDENCY',
                    //     payload: {
                    //         moduleName: moduleName,
                    //         version: version,
                    //         depsMap: emptyMap,
                    //     },
                    //     error: e,
                    //     // TODO: 取得失敗したから既存バージョンに戻してのフラグ必要
                    // } as iResponseFetchLibs);
                })
            );
        }
    });
};
// // self.addEventListener('message', (e: MessageEvent<iRequestFetchLibs>) => {
// self.onmessage = (e: MessageEvent<iRequestFetchLibs>) => {
//     const { payload, order } = e.data;
//     if (order !== 'RESOLVE_DEPENDENCY') return;
//     const { moduleName, version } = payload;

//     // TODO: configは必要か検討
//     const config = {
//         typescript: ts,
//         logger: console,
//     };

//     // DEBUG:
//     console.log(`[fetchLibs.worker] Got request: ${moduleName}@${version}`);

//     getItem<iStoreModuleNameVersionValue>(
//         moduleName,
//         storeModuleNameVersion
//     ).then((existItem) => {
//         // もしもmoduleName@versionがキャッシュ済であるならば
//         if (
//             existItem !== undefined &&
//             !compareTwoModuleNameAndVersion(moduleName, version, existItem)
//         ) {
//             // キャッシュ済のデータを返す
//             console.log(
//                 `[fetchDependencies] return cached data of ${moduleName}@${version}`
//             );

//             return getItem<iStoreSetOfDependencyValue>(
//                 moduleName + '@' + version,
//                 storeSetOfDependency
//             ).then((vfs) => {
//                 self.postMessage({
//                     order: 'RESOLVE_DEPENDENCY',
//                     payload: {
//                         moduleName: moduleName,
//                         version: version,
//                         depsMap: vfs,
//                     },
//                 } as iResponseFetchLibs);
//             });
//         } else {
//             // キャッシュしていないならそのまま新規取得
//             // 新規モジュール取得、同名モジュール別バージョン取得の場合がある
//             return (
//                 deleteItem(moduleName, storeModuleNameVersion)
//                     // storeSetOfDependencyは削除要求されても残す
//                     .then(() => fetchTypeAgent(config, moduleName, version))
//                     .then(
//                         (r: {
//                             vfs: Map<string, string>;
//                             moduleName: string;
//                             version: string;
//                         }) => {
//                             // 新規取得モジュールのファイル群はこのタイミングで保存する
//                             setItem(
//                                 r.moduleName + '@' + r.version,
//                                 r.vfs,
//                                 storeSetOfDependency
//                             );
//                             self.postMessage({
//                                 order: 'RESOLVE_DEPENDENCY',
//                                 payload: {
//                                     moduleName: r.moduleName,
//                                     version: r.version,
//                                     depsMap: r.vfs,
//                                 },
//                             } as iResponseFetchLibs);
//                         }
//                     )
//                     .catch((e: Error) => {
//                         const emptyMap = new Map<string, string>();
//                         deleteItem(moduleName, storeModuleNameVersion)
//                             // DEBUG:
//                             .then(() => {
//                                 console.log(
//                                     `[fetchDependencies] deleted ${moduleName} from storeModuleNameVersion`
//                                 );
//                             });

//                         console.error(e);

//                         self.postMessage({
//                             order: 'RESOLVE_DEPENDENCY',
//                             payload: {
//                                 moduleName: moduleName,
//                                 version: version,
//                                 depsMap: emptyMap,
//                             },
//                             error: e,
//                         } as iResponseFetchLibs);
//                     })
//             );
//         }
//     });
// };

// /***
//  *
//  * NOTE: Stackblitz.comで動作確認するためワーカの代わりにagent関数を呼び出す。
//  *
//  * */
// const agent = (
//   moduleName: string,
//   version: string
// ): Promise<{
//   moduleName: string;
//   version: string;
//   depsMap: Map<string, string>;
//   error?: Error;
// }> => {
//   // TODO: configは必要か検討
//   const config = {
//     typescript: ts,
//     logger: console,
//   };

//   // DEBUG:
//   console.log(`[fetchLibs.worker] Got request: ${moduleName}@${version}`);

//   return getItem<iStoreModuleNameVersionValue>(
//     moduleName,
//     storeModuleNameVersion
//   ).then((existItem) => {
//     // もしもmoduleName@versionがキャッシュ済であるならば
//     if (
//       existItem !== undefined &&
//       !compareTwoModuleNameAndVersion(moduleName, version, existItem)
//     ) {
//       // キャッシュ済のデータを返す
//       console.log(
//         `[fetchDependencies] return cached data of ${moduleName}@${version}`
//       );

//       return getItem<iStoreSetOfDependencyValue>(
//         moduleName + '@' + version,
//         storeSetOfDependency
//       ).then((vfs) => {
//         return {
//           moduleName: moduleName,
//           // TODO: versionがコレクトされていないのでコレクトされたバージョンを返すこと
//           version: version,
//           depsMap: vfs,
//         };
//       });
//     } else {
//       // キャッシュしていないならそのまま新規取得
//       // 新規モジュール取得、同名モジュール別バージョン取得の場合がある
//       return (
//         deleteItem(moduleName, storeModuleNameVersion)
//           // NOTE: storeSetOfDependencyは削除要求されても残す
//           .then(() => fetchTypeAgent(config, moduleName, version))
//           .then(
//             (r: {
//               vfs: Map<string, string>;
//               moduleName: string;
//               version: string;
//             }) => {
//               // 新規取得モジュールのファイル群はこのタイミングで保存する
//               setItem(
//                 r.moduleName + '@' + r.version,
//                 r.vfs,
//                 storeSetOfDependency
//               );
//               return {
//                 moduleName: r.moduleName,
//                 version: r.version,
//                 depsMap: r.vfs,
//               };
//             }
//           )
//           .catch((e: Error) => {
//             const empty = new Map<string, string>();
//             deleteItem(moduleName, storeModuleNameVersion);
//             // // DEBUG:
//             // .then(() => {
//             //   console.log(
//             //     `deleted ${moduleName} from storeModuleNameVersion`
//             //   );
//             // });

//             console.log(
//               `[fetchDependencies] Failed to acquire ${moduleName}@${version}`
//             );

//             console.error(e);
//             return {
//               moduleName: moduleName,
//               version: version,
//               depsMap: empty,
//               error: e,
//             };
//           })
//       );
//     }
//   });
// };
