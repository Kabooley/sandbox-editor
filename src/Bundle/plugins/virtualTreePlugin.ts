/************************************************************************
 * https://github.com/evanw/esbuild/issues/1952#issuecomment-1020006960
 *
 *
 * NOTE:
 * This plugin is slow.
 * esbuild method's filter needs Golang regular expression,
 * So to filter them
 *
 * TODO:
 * unpkgで取得するモジュールはキャッシュできていると思うけれど、どの程度できていればいいのかわからないのでそのまま。
 * **********************************************************************/
import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import { createDBInstance } from '../../Storage';
import * as Path from '../../Path';

// Specifies npm package if matched
const reLibrary = /^(?!\.)(?!.*\.$)(?!.*\.\.)[a-zA-Z0-9_.\/\-_$@]+$/;

const chacheDB: LocalForage = createDBInstance({
    name: 'sandbox-editor-cache-db',
});

/**
 * Polyfill of Object.entires
 *
 * MDN:
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#%E3%83%9D%E3%83%AA%E3%83%95%E3%82%A3%E3%83%AB
 * */
const objectEntries = (obj: any) => {
    var ownProps = Object.keys(obj),
        i = ownProps.length,
        resArray = new Array(i);
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
};

export function virtualTreePlugin(
    tree: Record<string, string>
): esbuild.Plugin {
    const map = new Map<string, string>(objectEntries(tree));

    return {
        name: 'example',

        setup: (build: esbuild.PluginBuild) => {
            /****
             * Solves related path
             * - Related path on virtual filesystem
             * - Related path in npm library.
             ***/
            build.onResolve(
                { filter: /^\.+\// },
                (args: esbuild.OnResolveArgs) => {
                    // DEBUG:
                    console.log('[virtualTreePlugin][onResolve /^.+//]');
                    console.log(args.path);

                    // In case resolving related path in library module
                    if (args.namespace === 'npm') {
                        // DEBUG:
                        console.log(
                            '[resolveVirtualFile][onresolve /^.+//] npm'
                        );
                        console.log(args);

                        return {
                            namespace: 'npm',
                            path: new URL(
                                args.path,
                                'https://unpkg.com' + args.resolveDir + '/'
                            ).href,
                        };
                    }
                }
            );

            // Any other path
            build.onResolve({ filter: /.*/ }, (args: esbuild.OnResolveArgs) => {
                // In case entry point
                if (args.kind === 'entry-point') {
                    return {
                        path: 'src/' + args.path,
                        namespace: 'virtual-file',
                    };
                }

                // In case path is library.
                else if (reLibrary.test(args.path)) {
                    // DEBUG:
                    console.log('[virtualTreePlugin][onresolve /.*/] npm');
                    console.log(args);

                    return {
                        path: `https://unpkg.com/${args.path}`,
                        namespace: 'npm',
                    };
                }

                // In case path is virtual tree
                else {
                    // DEBUG:
                    console.log(
                        '[virtualTreePlugin][onresolve /.*/] import-statement'
                    );
                    console.log(args);

                    const dirname = Path.dirname(args.importer);
                    const path = Path.join(dirname, args.path);

                    // In case path is not including extension
                    let fullpath: string = '';
                    if (!Path.extname(path)) {
                        if (map.has(path + '.tsx')) {
                            fullpath = path + '.tsx';
                        } else if (map.has(path + '.ts')) {
                            fullpath = path + '.ts';
                        }
                    } else {
                        fullpath = path;
                    }

                    return { path: fullpath, namespace: 'virtual-file' };
                }
            });

            // CSS Modules will be embeded to HTML as style tag
            build.onLoad(
                { filter: /\S+\.css$/ },
                async (args: esbuild.OnLoadArgs) => {
                    if (!map.has(args.path)) {
                        console.log(`[onLoad] Error on loading ${args.path}`);
                        throw Error('not loadable');
                    }

                    const escaped = map
                        .get(args.path)!
                        .replace(/\n/g, '')
                        .replace(/"/g, '\\"')
                        .replace(/'/g, "\\'");
                    const content = `
            const style = document.createElement("style");
            style.innerText = '${escaped}';
            document.head.appendChild(style);
          `;

                    return {
                        loader: 'jsx',
                        contents: content,
                        resolveDir: Path.dirname(args.path),
                    };
                }
            );

            // `src/*`
            build.onLoad(
                { filter: /^src\/[a-zA-Z0-9.-_$]+$/ },
                // { filter: /.*/ },
                async (args: esbuild.OnLoadArgs) => {
                    // NOTE: コード上のimport文は拡張子が省略されている
                    // なので拡張子を戻さないといけない
                    let fullpath = '';
                    if (!Path.extname(args.path)) {
                        if (map.has(args.path + '.tsx')) {
                            fullpath = args.path + '.tsx';
                        } else if (map.has(args.path + '.ts')) {
                            fullpath = args.path + '.ts';
                        }
                    } else {
                        fullpath = args.path;
                    }

                    if (!map.has(fullpath)) {
                        console.log(`[onLoad] Error on loading ${args.path}`);
                        throw Error('not loadable');
                    }

                    const ext = Path.extname(args.path);
                    const contents = map.get(args.path)!;
                    const loader =
                        ext === '.ts'
                            ? 'ts'
                            : ext === '.tsx'
                            ? 'tsx'
                            : ext === '.js'
                            ? 'js'
                            : ext === '.jsx'
                            ? 'jsx'
                            : ext === '.css'
                            ? 'css'
                            : 'default';

                    return {
                        contents: contents,
                        loader: loader,
                        resolveDir: Path.dirname(args.path),
                    };
                }
            );

            build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
                if (args.namespace === 'npm') {
                    // DEBUG:
                    console.log('[virtualTreePlugin][onload /.*/] npm');
                    console.log(args);

                    const cachedModule =
                        await chacheDB.getItem<esbuild.OnLoadResult>(args.path);

                    if (cachedModule) {
                        // DEBUG:
                        console.log('[virtualTreePlugin] cached');
                        console.log(cachedModule);
                        return cachedModule;
                    }

                    const { data, request } = await axios.get(args.path);

                    console.log(request.responseURL);
                    console.log(new URL('./', request.responseURL).pathname);

                    const result: esbuild.OnLoadResult = {
                        loader: 'jsx',
                        contents: data,
                        resolveDir: new URL('./', request.responseURL).pathname,
                    };

                    chacheDB.setItem<esbuild.OnLoadResult>(args.path, result);
                    return result;
                }

                // NOTE: コード上のimport文は拡張子が省略されている
                // なので拡張子を戻さないといけない
                let fullpath = '';
                if (!Path.extname(args.path)) {
                    if (map.has(args.path + '.tsx')) {
                        fullpath = args.path + '.tsx';
                    } else if (map.has(args.path + '.ts')) {
                        fullpath = args.path + '.ts';
                    }
                } else {
                    fullpath = args.path;
                }

                if (!map.has(fullpath)) {
                    console.log(`[onLoad] Error on loading ${args.path}`);
                    throw Error('not loadable');
                }

                const ext = Path.extname(args.path);
                const contents = map.get(fullpath)!;
                const loader =
                    ext === '.ts'
                        ? 'ts'
                        : ext === '.tsx'
                        ? 'tsx'
                        : ext === '.js'
                        ? 'js'
                        : ext === '.jsx'
                        ? 'jsx'
                        : ext === '.css'
                        ? 'css'
                        : 'default';

                return { contents: contents, loader: loader };
            });
        },
    };
}

// -----------------------------------------------------------
// Example というかusage
// コードは確かmonaco-editorのissueより。
// -----------------------------------------------------------

// await esbuild.initialize({ wasmURL: 'esbuild.wasm' })

// const tree = {

//     '/util/encode.ts': `

//         export function encode(data: string): Uint8Array {

//             return new Uint8Array(1)
//         }
//     `,
//     '/lib/foo.ts': `

//         import { encode } from '../util/encode.ts'

//         export function foo() {

//            return encode('foo')
//         }
//     `,
//     '/lib/bar.ts': `

//         import { encode } from '../util/encode.ts'

//         export function bar() {

//            return encode('bar')
//         }
//     `,
//     '/lib/index.ts': `

//         export * from './foo.ts'

//         export * from './bar.ts'
//     `,
//     '/index.ts': `

//         import { foo, bar } from './lib/index.ts'

//         foo()

//         bar()
//     `
// }

// const result = await esbuild.build({
//     entryPoints: ['index.ts'],
//     plugins: [virtualTreePlugin(tree)],
//     bundle: true,
//     write: false,
// })

// const decoder = new TextDecoder()

// console.log(decoder.decode(result.outputFiles[0].contents));

// // outputs: (() => {
// //     // util/encode.ts
// //     function encode(data) {
// //         return new Uint8Array(1);
// //     }

// //     // lib/foo.ts
// //     function foo() {
// //         return encode("foo");
// //     }

// //     // lib/bar.ts
// //     function bar() {
// //         return encode("bar");
// //     }

// //     // index.ts
// //     foo();
// //     bar();
// // })();
