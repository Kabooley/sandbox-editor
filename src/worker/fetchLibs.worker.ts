/************************************************************************************************
 * Fetches requested npm package module from jsdelvr
 *
 * NOTES:
 * - NOTE: Comlinkを使うことを前提としている。
 *
 * TODOS:
 * - エラーハンドリングについて調査。無視するエラーと対応するエラーを区別して対応するエラーはどうするのか決めること
 ************************************************************************************************/

/*************************************************************
 旧onmessage()では何をしていたのか：
 - getItem(e.data.payload.moduleName, e.data.payload.version)
     IndexedDB storeModuleNameVersion からリクエストのモジュールがキャッシュされているか確認
     IF 同名同バージョンがキャッシュされていた
         キャッシュされているものを返す
     ELSE キャッシュされていなかったら新規取得
 - 新規取得
     IF 同名別バージョンがキャッシュされていた
         キャッシュされている同名別バージョンをいったん変数に保存する
     キャッシュ済の同名依存関係を削除する(deleteItem(moduleName, storeModuleNameVersion))。これは実際にキャッシュされているか否か関係なく実施される
     新規取得する（fetchTypeAgent(moduleName, version)）
         新規取得の過程でstoreModuleNameVersionに取得した依存関係が保存される
     IF 無事新規取得
         IndexedDBのstoreSetOfDependencyへ依存関係の依存関係を保存する
         レスポンスを返す
     ELSE 取得失敗
         同名既存依存関係はすでに先の処理で削除されているので、変数によけておいた同依存関係を
         再度storeModuleNameVersionへ保存する
         レスポンスを返す（エラー付き）
 
 *************************************************************/

import ts from 'typescript';
import * as Comlink from 'comlink';
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
import { iTreeMeta, iConfig } from './types';

// --- types ---

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
 * @param {iConfig} config
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
 * @returns {number} - Passed modulename and version pair is exact matched to compareWth param.
 *                     If not, they are not matched with compareWith param.
 *
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

// --- API ---

export interface iFetchLibsApi {
    // Check if passed modulename module is already downloaded and cached by searching storeModuleNameVersion.
    isAlreadyExist: (moduleName: string, version: string) => Promise<boolean>;
    // Download requested module and pass them.
    fetchLibs: (
        moduleName: string,
        version: string
    ) => Promise<{
        moduleName: string;
        version: string;
        vfs: Map<string, string>;
    }>;
    //
    getCachedModule: (
        moduleName: string,
        version: string
    ) => Promise<{
        moduleName: string;
        version: string;
        vfs: iStoreSetOfDependencyValue;
        notCached: boolean;
    }>;
    // Delete requested module from cache.
    removeLibs: (moduleName: string, version: string) => Promise<Array<string>>;
    // Terminate worker itself.
    // terminateWorker: () => void;
    getModuleDependenciesPath: (
        moduleName: string,
        version: string
    ) => Promise<Array<string>>;
}

interface iResponseFetchedModule {
    moduleName: string;
    version: string;
    vfs: Map<string, string>;
}

/***
 * Agent who resolves module's type definition files.
 *
 * @param {iConfig} config - Config for this agent.
 * @param {string} moduleName - Module name to be resolved.
 * @param {string} version - Module's version to be resolved.
 * @returns {Promise<iResponseFetchedModule>} - Resolved type definition files for the module. Version may be fixed since the time of the call.
 *
 *
 * NOTE: 同名別バージョンのモジュールをリクエストされてもこの関数ではチェックしない。
 *       必要がある場合、fetchLibs()を呼び出す前に確認すること。
 * */
const fetchLibs = (
    moduleName: string,
    version: string
): Promise<iResponseFetchedModule> => {
    // DEBUG:
    console.log(`[fetchLibs.worker] start fetching ${moduleName}@${version}`);

    // const moduleMap = new Map<string, ModuleMeta>();
    const fsMap = new Map<string, string>();
    //
    const config = {
        typescript: ts,
        logger: console,
    };
    // moduleNameのモジュールの正確なバージョンを記憶する
    let correctVersion = '';

    let downloading = 0;
    let downloaded = 0;

    /****
     * @param {number} depth: Number of this resolver() called recursively.
     *
     * 1. Check modulename and version are valid
     * 2. Store corrected moduleName + @ + corrected version to setOfModuleNameVersion
     * 3. get requested module's file list which files are .d.ts or @types/moduleName
     * 4. download files from the file list and store data to `fsMap`.
     * 5. also download requested module's package.json file.
     * 6. Recursively call resolver if there are dependency's dependencies.
     *
     * - TODO: moduleNameとversionのvalidationはここでやらなくてもいい気がする。resolverを呼び出す前にやればいいかも。
     *          結局file listを取得してからのresolver()呼び出し時に渡すversionはfile listの情報をもとに渡しているので検査の必要がない
     * */
    const resolver = async (
        _moduleName: string,
        version: string,
        depth: number
    ) => {
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

        // Find where the .d.ts file at.
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
        // Store if requested module and version are valid.
        if (!depth) {
            correctVersion = tree.version;
            await setItem(
                `${moduleName}@${correctVersion}`,
                `${moduleName}@${correctVersion}`,
                storeModuleNameVersion
            );
        }

        const hasDtsFile = tree.files.find((f) => f.name.endsWith('.d.ts'));

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

            DTSFiles2 = getDTSFilesFromTree(
                dtTree,
                `/node_modules/@types/${getDTName(moduleName).replace(
                    'types__',
                    ''
                )}`
            );
        }

        const downloadListOfDTSFiles = DTSFiles1.concat(DTSFiles2);
        downloading = downloadListOfDTSFiles.length;

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

    return resolver(moduleName, version, 0)
        .then(() =>
            setItem(
                moduleName + '@' + correctVersion,
                fsMap,
                storeSetOfDependency
            )
        )
        .then(() => ({
            vfs: fsMap,
            moduleName: moduleName,
            version: correctVersion,
        }))
        .catch((e) => {
            removeLibs(moduleName, version);
            throw e;
        });
};

/***
 * Check same `moduleName@version` has been cached in storeModuleNameVersion IndexedDB.
 * */
const isAlreadyExist = (moduleName: string, version: string) =>
    getItem<iStoreModuleNameVersionValue>(
        `${moduleName}@${version}`,
        storeModuleNameVersion
    ).then(
        (existItem: iStoreModuleNameVersionValue | undefined) =>
            existItem !== undefined &&
            !compareTwoModuleNameAndVersion(moduleName, version, existItem)
    );

/***
 * Get dependency of requested module from cache.
 * Doesn't check if not cached.
 * */
const getCachedModule = (moduleName: string, version: string) =>
    getItem<iStoreSetOfDependencyValue>(
        moduleName + '@' + version,
        storeSetOfDependency
    ).then((vfs: iStoreSetOfDependencyValue | undefined) => {
        return {
            moduleName: moduleName,
            version: version,
            vfs: vfs,
            notCached: vfs === undefined ? true : false,
        };
    });

/***
 * Get dependencies path of requested module for utility purpose.
 * */
const getModuleDependenciesPath = (moduleName: string, version: string) =>
    getItem<iStoreSetOfDependencyValue>(
        moduleName + '@' + version,
        storeSetOfDependency
    ).then((vfs: iStoreSetOfDependencyValue | undefined) => {
        if (vfs !== undefined) {
            const paths: string[] = [];
            for (const path of vfs.keys()) {
                paths.push(path);
            }
            return paths;
        }
        return [];
    });

/***
 * Delete requested dependency and its dependencies from cache.
 * @returns {Array<string>} - Array of deleted module's dependencies path.
 * */
const removeLibs = (moduleName: string, version: string) => {
    const deletedDependencies: string[] = [];
    return deleteItem(`${moduleName}@${version}`, storeModuleNameVersion)
        .then(() => getItem(moduleName + '@' + version, storeSetOfDependency))
        .then((dependencies: Map<string, string>) => {
            if (dependencies !== undefined) {
                for (const key of dependencies.keys()) {
                    deletedDependencies.push(key);
                }
            }
            return deleteItem(moduleName + '@' + version, storeSetOfDependency);
        })
        .then(() => deletedDependencies);
};

// const terminateWorker = () => {
//   self.close();
// };

Comlink.expose({
    fetchLibs,
    isAlreadyExist,
    getCachedModule,
    removeLibs,
    getModuleDependenciesPath,
} as iFetchLibsApi);
