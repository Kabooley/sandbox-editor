# Explorer Actions

## 開発ブランチ

`feat/explorer--actions`

## TODOs

-   TODO: Dependencies の Form にツールチップと検索アイコンをつける
-   TODO: Workspace selected ファイルを含むフォルダは自動的に開いたままにする

## Summary

[機能解説](#機能解説)
[実装しない機能](#実装しない機能)

## 実装しない機能

-   OpenEditor の PaneHeader アクション：すべて保存する
-   OpenEditor の PaneHeader アクション：無名ファイルを追加する
-   Workspace の PaneHeader アクション：フォルダをすべて閉じる

## 機能解説

-   [[Explorer/Workspace] File データから explorer データに変換する機能](#explorerworkspace-file-データから-explorer-データに変換する機能)
-   [[Explorer/Workspace] アイテムリネーム機能](#explorerworkspace-アイテムリネーム機能)
-   [[Explorer/Workspace] 新規アイテム追加機能](#explorerworkspace-新規アイテム追加機能)
-   [[Explorer/Workspace] folder の開閉](#explorerworkspace-folder-の開閉)
-   [[Explorer/Dependencies] 依存関係取得機能](#explorerdependencies-依存関係取得機能)
-   [[Explorer/Dependencies] 取得済依存関係削除機能](#explorerdependencies-取得済依存関係削除機能)
-   [他](#他)

## [Explorer/Workspace] File データから explorer データに変換する機能

`src/components/VSCodeExplorer/Workspace/generateTree.tsx`

オブジェクト配列のデータ（`File`）をツリー上のデータ（`iExplorer`）に変換する。

```TypeScript
import type { iExplorer } from '../../../data/types';
import { File } from '../../../data/files';

/**
 * Generate Explorer data based on File data.
 *
 * @param {Array<File>} entries - Explorer data will be generated based on this data.
 * @param {string} root - Name of Top entry of Explorer tree data.
 *
 * Process are concist of three part.
 * 1: Generate folders which has files inside of it.
 * 2: Generate files
 * 3: Generate empty folders.
 *
 * Generating folders should be done before generating files because files are belongs some folder.
 *
 * */
export const generateTreeNodeData = (
    entries: File[] = [],
    root: string = 'root'
): iExplorer => {
    entries.sort(function (a: File, b: File) {
        let aPath = a.getPath().toLowerCase(); // ignore upper and lowercase
        let bPath = b.getPath().toLowerCase(); // ignore upper and lowercase
        if (aPath < bPath) return -1;
        if (aPath > bPath) return 1;
        return 0;
    });

    let currentKey = 1;
    const rootNode = {
        id: `${currentKey}`,
        name: root,
        isFolder: true,
        items: [],
        path: '',
        isOpening: false,
        // NOTE: Experimental
        isSelected: false
    };

    /**
     * Generate folders which has some files.
     * */
    entries.forEach((entry: File) => {
        if (entry.isFolder()) return;

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;

        for (let i = 0; i < pathLen; i++) {
            let name = pathArr[i];
            let index = i;

            // If the child node doesn't exist, create it
            let child = current.items.find((item) => item.name === name);

            // if(child === undefined && index < ( pathLen - 1) && entry.isFolder()){
            if (child === undefined && index < pathLen - 1) {
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: true,
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/'),
                    isOpening: false,
                };
                current.items.push(child);
            }
            current = child!;
        }
    });

    /**
     * Generate files.
     *
     * Assuming that Generating folders have been completed before this process.
     * */
    entries.forEach((entry: File) => {
        if (entry.isFolder()) return;

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;

        // Generate files which is belongs top of explorer tree data.
        if (pathLen === 1) {
            let name = pathArr[0];
            currentKey = currentKey += 1;
            let node = {
                id: `${currentKey}`,
                name: name,
                isFolder: false,
                items: [],
                path: pathArr[0],
                isOpening: entry.isOpening(),
            };
            current.items.push(node);
            return;
        }

        // Generate files which is under some folders
        pathArr.forEach((name, index) => {
            let child = current.items.find((item) => item.name === name);

            if (child === undefined && index === pathLen - 1) {
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: false,
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/'),
                    isOpening: entry.isOpening(),
                };
                current.items.push(child);
            } else if (child === undefined) {
                return;
            } else {
                current = child;
            }
        });
    });

    /**
     * Generate empty folders.
     *
     * Assuming that generating folders and files have been completed already.
     * */
    entries.forEach((entry: File) => {
        if (!entry.isFolder()) return;

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;

        pathArr.forEach((name, index) => {
            let child: iExplorer | undefined = current.items.find(
                (item) => item.name === name
            );

            if (child === undefined && index === pathLen - 1) {
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: !index ? pathArr[0] : pathArr[index],
                    isFolder: true, // As this is folder.
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/'),
                };
                current.items.push(child);
            } else if (child === undefined) {
                return;
            } else {
                current = child;
            }
        });
    });

    return rootNode;
};

```

例：generateTree.tsx は、受け取った Files から最終的に次を作り出すとする

```JavaScript

const root: iExplorer = {
    id: '1',
    path: "/",  // rootディレクトリのpathは実際には使われないので意味がない
    name: "root",
    isFolder: true,
    isSeleted: false,
    items: [
        {
            id: '2'
            path: "public",
            name: "public",
            isFolder: true,
            isSelected: false,
            items: [
                {
                    path: "public/index.html",
                    name: "index.html",
                    isFolder: false,
                    isSelected: false,
                    items: []
                }
            ]
        },
        {
            id: '3',
            path: 'SoMuchLongDirectoryName',
            name: 'SoMuchLongDirectoryName',
            isFolder: true,
            isSelected: false,
            items: [
                {
                    id: '',
                    path: 'SoMuchLongFileName'
                    name: 'SoMuchLongFileName',
                    isFolder: false,
                    isSelected: false,
                    items: []
                }
            ]
        },
        {
            id: '3',
            path: "src",
            name: "src",
            isFolder: true,
            isSelected: false,
            items: [
                {
                    path: "src/App.tsx",
                    name: "App.tsx",
                    isFolder: false,
                    isSelected: true,
                    items: []
                },
                {
                    path: "src/index.tsx",
                    name: "index.tsx",
                    isFolder: false,
                    isSelected: true,
                    items: []
                },
                {
                    path: "src/styeles.css",
                    name: "styeles.css",
                    isFolder: false,
                    isSelected: true,
                    items: []
                },
                {
                    path: "src/components",
                    name: "components",
                    isFolder: true,
                    isSelected: false,
                    items: []
                }
            ]
        },
        {
            path: "package.json",
            name: "package.json",
            isFolder: false,
            isSelected: false,
            items: []
        },
        {
            path: "tsconfig.json",
            name: "tsconfig.json",
            isFolder: false,
            isSelected: false,
            items: []
        },
        {
            path: "auchEmptyFolder",
            name: "auchEmptyFolder",
            isFolder: true,
            isSelected: false,
            items: []
        },
    ]
}
```

段階１：`items`プロパティが空ではないフォルダを追加する。

ただし、この段階では`items`プロパティは空のままである。

また、`items`プロパティが空であるフォルダは追加していない。

ファイルは追加していない。

なので、

`public`, `src`, `soMuch...`フォルダは追加されているが、
`suchEmptyFolder`はこの段階では追加されていない。

また、追加されたアイテムの`items`は空である。

```JavaScript

const root: iExplorer = {
    id: '1',
    path: "/",  // rootディレクトリのpathは実際には使われないので意味がない
    name: "root",
    isFolder: true,
    isSeleted: false,
    items: [
        {
            id: '2'
            path: "public",
            name: "public",
            isFolder: true,
            isSelected: false,
            items: [
                // emptry
            ]
        },
        {
            id: '3',
            path: 'SoMuchLongDirectoryName',
            name: 'SoMuchLongDirectoryName',
            isFolder: true,
            isSelected: false,
            items: [
                // emptry
            ]
        },
        {
            id: '3',
            path: "src",
            name: "src",
            isFolder: true,
            isSelected: false,
            items: [
                // emptry
            ]
        }
    ]
}
```

段階 2：ファイルを追加する。

この段階でファイルが追加される。空フォルダは追加されない。

```JavaScript
const root: iExplorer = {
    id: '1',
    path: "/",  // rootディレクトリのpathは実際には使われないので意味がない
    name: "root",
    isFolder: true,
    isSeleted: false,
    items: [
        {
            id: '2'
            path: "public",
            name: "public",
            isFolder: true,
            isSelected: false,
            items: [
                {
                    path: "public/index.html",
                    name: "index.html",
                    isFolder: false,
                    isSelected: false,
                    items: []
                }
            ]
        },
        {
            id: '3',
            path: 'SoMuchLongDirectoryName',
            name: 'SoMuchLongDirectoryName',
            isFolder: true,
            isSelected: false,
            items: [
                {
                    id: '',
                    path: 'SoMuchLongFileName'
                    name: 'SoMuchLongFileName',
                    isFolder: false,
                    isSelected: false,
                    items: []
                }
            ]
        },
        {
            id: '3',
            path: "src",
            name: "src",
            isFolder: true,
            isSelected: false,
            items: [
                {
                    path: "src/App.tsx",
                    name: "App.tsx",
                    isFolder: false,
                    isSelected: true,
                    items: []
                },
                {
                    path: "src/index.tsx",
                    name: "index.tsx",
                    isFolder: false,
                    isSelected: true,
                    items: []
                },
                {
                    path: "src/styeles.css",
                    name: "styeles.css",
                    isFolder: false,
                    isSelected: true,
                    items: []
                },
                {
                    path: "src/components",
                    name: "components",
                    isFolder: true,
                    isSelected: false,
                    items: []
                }
            ]
        },
        {
            path: "package.json",
            name: "package.json",
            isFolder: false,
            isSelected: false,
            items: []
        },
        {
            path: "tsconfig.json",
            name: "tsconfig.json",
            isFolder: false,
            isSelected: false,
            items: []
        },
    ]
}
```

段階３：空フォルダを追加する。

この時点で空フォルダが追加される。これで最終的な生成物が出来上がる。

ということで、

ファイル File のプロパティを追加・削除する際には第二段階のコードを変更すること。
フォルダ File は生成が 2 通りに分かれているのでそれぞれ`items`を持つのか否かに気を付けないといけない。

##### log

phase.1

```bash
start generate
# entry: package.json
[phase 1] package.json
[phase 1][package.json] package.json
# `package.json`はフォルダではないので何もアイテムを追加しなかった
undefined
[phase 1] public/index.html
[phase 1][public/index.html] public
{
  id: '2',
  name: 'public',
  isFolder: true,
  items: [],
  path: 'public',
  isOpening: false,
  isSelected: false
}
# `public`は`public/index.html`のパスのうち、`index.html`というファイルを持つフォルダなので
# `public`フォルダが生成された。
[phase 1][public/index.html] index.html
undefined
# `index.html`は`public/index.html`のうちのファイルなのでなにも生成しない

# ...という感じで進んでいく。

[phase 1] soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt
[phase 1][soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt] soMuchLongDirectoryName
{
  id: '3',
  name: 'soMuchLongDirectoryName',
  isFolder: true,
  items: [],
  path: 'soMuchLongDirectoryName',
  isOpening: false,
  isSelected: false
}
[phase 1][soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt] superUltraHyperTooLongBaddaaasssssFile.txt
undefined
[phase 1] src/App.tsx
[phase 1][src/App.tsx] src
{
  id: '4',
  name: 'src',
  isFolder: true,
  items: [],
  path: 'src',
  isOpening: false,
  isSelected: false
}
[phase 1][src/App.tsx] App.tsx
undefined
[phase 1] src/index.tsx
[phase 1][src/index.tsx] src
{
  id: '4',
  name: 'src',
  isFolder: true,
  items: [],
  path: 'src',
  isOpening: false,
  isSelected: false
}
[phase 1][src/index.tsx] index.tsx
undefined
[phase 1] src/styles.css
[phase 1][src/styles.css] src
{
  id: '4',
  name: 'src',
  isFolder: true,
  items: [],
  path: 'src',
  isOpening: false,
  isSelected: false
}
[phase 1][src/styles.css] styles.css
undefined
[phase 1] tsconfig.json
[phase 1][tsconfig.json] tsconfig.json
undefined


```

## [Explorer/Workspace] アイテムリネーム機能

`src/components/VSCodeExplorer/Workspace/Tree.tsx`:

例：仮想フォルダの中で、`src/styles.css`を`src/styles.scss`にリネームするとする

```TypeScript
// Tree.tsx rendering part
    if (explorer.isFolder) {
        return (
            <div>
                {renaming ? (
                    // リネームアクション時に表示されるFormColumn
                    <FormColumn
                        // ...
                    />
                ) : (
                    <DragNDrop
                        // ...
                    >
                    // 本来のTreeアイテム
                    </DragNDrop>
                )}
                <div style={{ display: expand ? 'block' : 'none' }}>
                    {showInput.visible && (
                        // 新規アイテムアクション時に表示されるFormColumn
                        <FormColumn
                            // ...
                        />
                    )}
                    // ...
                </div>
            </div>
        );
    } else {
        return (
            <div>
                {renaming ? (
                    <FormColumn
                        // ...
                    />
                ) : (
                    <DragNDrop
                        // ...
                    >
                        // 本来のTreeアイテム
                    </DragNDrop>
                )}
            </div>
        );
    }
    // ...
```

リネーム・アクションがクリックされると、その Tree.tsx の`renaming: true`になり、
本来の Tree.tsx が表示するはずの explorer アイテムを表示する代わりに、
入力フォームである FormColumn.tsx を出力する

-   onChange イベント：入力内容の検証 handleNewItemNameInput
-   onKeyDown イベント：入力内容が決定された
-   onBlur イベント：他の要素がクリックされた判定

Tree.tsx の`handleNewItemNameInput()`で入力内容が問題ないか常に検証する
たとえば、

-   既存の path になるような名前にしていないか ()
-   ファイル名に含めてはならない値を入力していないか
-   入力内容が空でないか

入力内容に問題があるときは、入力完了のエンターキーの keydown イベントが無効になるようにしてあるので、無効な値のままディスパッチされることはない。

入力内容に問題ない場合にのみエンタキーが押された onKeyDown イベント発火時に、
FilesContext へ内容が dispatch されてリネーム内容が反映される
同時に、FormColumn の役目が終わるので、`renaming: false`に更新する。
これで FormColumn がアンマウントされる。

仮想ツリーの中で、フォルダアイテムをリネームするときは、そのフォルダアイテム以下のすべてのアイテムもリネームすることになる。

そのため Tree.tsx::handleRename()では folder の場合とそうでない場合の 2 通りに処理を分けている。

```TypeScript
// Tree.tsx
    const handleRename = (newName: string) => {
        // Update all descendants tree object's path if explorer is folder.
        if (explorer.isFolder) {
            const _path = getPathExcludeFilename(explorer.path);
            const updatedExplorerPath = (_path ? _path : '') + newName;

            // `getAllDescendantsPath()`で、渡したexplorerのitems以下のすべてのアイテムのpathを取得する
            const descendantsPath = getAllDescendantsPath(explorer);

            // そのすべてのアイテムのpathを、リネーム値に合わせて更新し、
            // dipatch用のデータを生成する
            const updatedDescendantsPath = descendantsPath.map((dp) => {
                const d = {
                    oldPath: dp,
                    newPath: '',
                };
                if (dp.includes(explorer.path)) {
                    const unmodify = dp.split(explorer.path)[1];
                    d.newPath = updatedExplorerPath + unmodify;
                } else {
                    d.newPath = dp;
                }
                return d;
            });

            const requests = updatedDescendantsPath.map((udp) => {
                return {
                    targetFilePath: udp.oldPath,
                    changeProp: {
                        newPath: udp.newPath,
                    },
                };
            });
            requests.push({
                targetFilePath: explorer.path,
                changeProp: {
                    newPath: updatedExplorerPath,
                },
            });

            dispatchFilesAction({
                type: FilesActionTypes.ChangeMultiple,
                payload: requests,
            });
        } else {
            // create new path
            const _path = getPathExcludeFilename(explorer.path);
            const newPath = (_path ? _path : '') + newName;
            dispatchFilesAction({
                type: FilesActionTypes.Change,
                payload: {
                    targetFilePath: explorer.path,
                    changeProp: {
                        newPath: newPath,
                    },
                },
            });
        }

        setIsInputBegun(false);
        setIsNameValid(false);
        setIsNameEmpty(false);
        setRenaming(false);
        setIsSameNameAlreadyExists(false);
    };

```

#### リネーム時に monaco-editor の extraLibs を更新する

file をリネームしたとき、新規追加したとき、削除したときなど extraLibs に登録されている該当データがその変化に応じて更新されるようにする

`EditorContainer.tsx`より

```TypeScript
    /***
     * File may changes its properties or added, and deleted.
     *
     * This function handles when file has been...
     * added, deleted, changed file.path.
     *
     * Not handles when file has...
     * changed file.selected, file.isOpened, file.value
     *
     * NOTE: renameされたfileのリネーム前の該当ファイルはextraLibsから削除されていない。
     * どのデータが該当のファイルか特定できないからである。
     * すべてthis.props.filesに基づいて毎度まるっとextralibsをすべて更新した方がいいのかも
     * */
    componentDidUpdate(prevProp: iProps, prevState: iState) {

        const didFileDelete = prevProp.files.length > this.props.files.length;

        // this.props.filesが更新されたら
        if (prevProp.files !== this.props.files) {
            for (const file of this.props.files) {
                if (
                    prevProp.files.find(
                        (f) => f.getPath() === file.getPath()
                    ) === undefined
                ) {
                    // New File has added, or file's path changed.
                    // いずれの場合も結局`this.addExtraLibs`へ渡すだけ
                    // rename前のpathに該当するextralibsファイルは削除できない
                    // どれか判別できないけど、extralibsに残っていても問題ないから
                    this.addExtraLibs(file.getValue(), file.getPath());
                }
            }
            if (didFileDelete) {
                const prevFilesPath = prevProp.files.map((pf) => pf.getPath());
                const currentFilesPath = this.props.files.map((pf) =>
                    pf.getPath()
                );
                // deletedFile: prevFilesPathには存在してcurrentFilesPathには存在しない要素駆らなる配列
                const deletedFiles = prevFilesPath.filter(
                    (pf) => currentFilesPath.indexOf(pf) === -1
                );
                deletedFiles.forEach((df) => this._removeFileFromExtraLibs(df));
            }
        }
    }
```

`prevProp.files !== this.props.files`の厳密な等価比較は、前回と同じ files の参照が返れていないかどうかを比較する。

つまり、配列が新しくなっているかどうかを検査している。

`this.props.files`が以前の props より増えているまたは以前の files に存在しない path の file が含まれているときは

新規ファイルが追加された、またはリネームされたと判断し extraLibs を更新する(`this.addExtraLibs`を呼び出して)

`this.props.files`の長さが以前より短くなっている場合は file が削除されたと判断する

削除されたファイルを特定して extraLibs の該当データを expose する(this.\_removeFileFromExtraLibs())

リネーム処理が extraLibs の該当ファイルに対して実行できていません。

理由はリネームした後だとリネーム前の path が不明になるので extraLIbs に登録されているリネーム前のデータを探すのが不可能になるから。

これを良しとしているのはそのまま残しておいても問題にならないと判断したから。

たとえば extraLibs に残ったままのデータと全く同じ path のファイルを新たに追加するときは、新規ファイルの追加時には必ずその path で expose を施すので必ず削除されるから。

## [Explorer/Workspace] 新規アイテム追加機能

#### Tree.tsx の各アイテムアクションから

各 Tree.tsx のレンダリングされているファイル/フォルダ追加アクションをクリックすることで、一連の追加処理が開始される

sequence diagram: https://sequencediagram.org/

```plantuml
->
-> handleNewItem
```

#### PaneHeader.tsx のアクションから

## [Explorer/Workspace] folder の開閉

現状、

-   iExplorer オブジェクトのうち isFolder: true のオブジェクトの開閉は、Tree.tsx の expand state に依存しており、files の status には依存していない。
-   files データが folder の場合、selected は常に false である（かも

そうなると、たとえば selectedFile が変更されても Workspace 上のフォルダが該当のファイルを含んでいるフォルダでも自動で開いた表示をしてくれない。

FilesContext.tsx では,

ADD_FILE の時に新規 folder に`selected: true`としていない。

```TypeScript
// FilesContext.tsx

function filesReducer(files: File[], action: iFilesActions) {
    switch (action.type) {
        // Add single file.
        case 'ADD_FILE': {
            const { requiredPath, isFolder } = action.payload;

            // ...

            const language = isFolder ? '' : getFileLanguage(requiredPath);

            // Add new folder:
            if (isFolder) {
                console.log(`[FilesContext] ADD_FILE: folder ${requiredPath}`);
                return [
                    ...files,
                    new File(
                        requiredPath,
                        '',
                        language ? '' : language === undefined ? '' : language,
                        isFolder
                    ),
                ];
            }

            // ...
        }
        // ...

        case 'CHANGE_SELECTED_FILE': {
            const { selectedFilePath } = action.payload;

            const targetFile = files.find(
                (f) => f.getPath() === selectedFilePath
            );

            if (targetFile !== undefined && targetFile.isSelected()) {
                return files;
            }

            const updatedFiles = files.map((f) => {
                const clone: File = Object.assign(
                    Object.create(Object.getPrototypeOf(f)),
                    f
                );
                f.getPath() === selectedFilePath
                    ? clone.setSelected()
                    : clone.unSelected();
                return clone;
            });

            return [...updatedFiles];
        }
        /***
         * OPEN FILE:
         *
         * - Set Opening flag as true
         * - Give TabIndex if it's null.
         * - Set selected to be true.
         *
         * TabIndex will be same as number of current tabs.
         *
         * TODO: 予め必ずいずれかのファイルがselected: trueになっていることが前提になっている。selected: trueのファイルがない場合に対応させること。
         * */
        case 'OPEN_FILE': {
            const { path } = action.payload;
            const target = files.find((f) => f.getPath() === path);
            const currentSelectedFile = files.find((f) => f.isSelected());

            const currentSelectedFilePath = currentSelectedFile
                ? currentSelectedFile.getPath()
                : undefined;

            // Guard if it's folder or opening already.
            if (target?.isFolder() || target?.isOpening()) {
                return files;
            }

            console.log(
                `[FilesContext] OPEN_FILE: ${path} Previous selected file: ${currentSelectedFilePath}`
            );

            const updatedFiles = files.map((f) => {
                // Get file open and selected.
                if (f.getPath() === path) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    clone.setOpening(true);
                    clone.setSelected();
                    if (!clone.getTabIndex()) {
                        const tabIndexes = files
                            .filter((f) => f.getTabIndex !== null)
                            .map((f) => f.getTabIndex());
                        const currentTabTail = findMax(tabIndexes) + 1;
                        clone.setTabIndex(currentTabTail);
                    }
                    return clone;
                }
                // Get selected file to be unselected.
                else if (
                    currentSelectedFilePath !== undefined &&
                    f.getPath() === currentSelectedFilePath
                ) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    clone.unSelected();
                    return clone;
                } else return f;
            });

            return [...updatedFiles];
        }
        /**
         * Close file:
         * - `isSelected: true`のファイルをクローズしたときはいずれかの`isOpening:true`のファイルを選ぶ
         * */
        case 'CLOSE_FILE': {
            const { path } = action.payload;
            // Guard if it's folder or closing already.
            const target = files.find((f) => f.getPath() === path);
            if (target?.isFolder() || !target?.isOpening()) {
                return files;
            }

            console.log(`[FilesContext] CLOSE_FILE: ${path}`);

            // Was target file `isSelected` true?
            let nextSelected: File | undefined;
            if (target.isSelected()) {
                nextSelected = files.find(
                    (f) => f.isOpening() && !f.isSelected()
                );
            }

            const updatedFiles = files.map((f) => {
                // Close target file.
                if (f.getPath() === path) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    clone.setOpening(false);
                    clone.setTabIndex(null);
                    clone.unSelected();
                    return clone;
                }
                // Select another file if target file was selected file.
                else if (
                    nextSelected &&
                    f.getPath() === nextSelected.getPath()
                ) {
                    const clone: File = Object.assign(
                        Object.create(Object.getPrototypeOf(f)),
                        f
                    );
                    clone.setSelected();
                    return clone;
                } else return f;
            });

            return [...updatedFiles];
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

```

Tree.tsx

-   folder がクリックされても change select file が dispatch されない

他

-   selected フラグは files のうち isFolder:true でない file であることが前提になっている
    (EditorContainer.tsx では selectedFile)

以下では TabsAndACtions と MonacoEditor が selectedFile を求めているが、

selectedFile は folder でないことが前提となっている（修正は容易ですが）

```TypeScript
    render() {
        // 修正案
        // const selectedFilePath = this.props.files.find((f) => f.isSelected() && !f.isFolder());
        // 現状
        const selectedFilePath = this.props.files.find((f) => f.isSelected());
        const filesOpening = this.getFilesOpening(this.props.files);

        if (filesOpening.length) {
            return (
                <div className="editor-container">
                    <TabsAndActionsContainer
                        selectedFile={selectedFilePath}
                        onChangeSelectedTab={this._onChangeSelectedTab}
                        width={this.props.width}
                        filesOpening={filesOpening}
                    />
                    <MonacoEditor
                        files={this.props.files}
                        selectedFile={selectedFilePath}
                        onEditorContentChange={this._onEditorContentChange}
                        onDidChangeModel={this._onDidChangeModel}
                        {...editorConstructOptions}
                    />
                </div>
            );
        }
    }
```

folder が開いている情報は Explorer/workspace でのみ必要な情報である。

folder が「選択されていない状態」を知るのが今のところ難しい。

#### どうなってほしいのか

-   selectedFile が含まれているフォルダは基本的に expand したままにしてほしい
-   workspace 内での dnd したときに drop 先であるフォルダは expand してほしい
-

iExplorer に selected プロパティをつけることはできるか

## [Explorer/OpenEditor] エディタをすべて閉じる

つまり、すべてのファイルを閉じる機能。

## [Explorer/Dependencies] 依存関係取得機能

実装済。未文章化。

## [Explorer/Dependencies] 取得済依存関係削除機能

-   explorer/Dependencies の依存関係一覧 UI から任意の依存関係の削除ボタンが押される
-   TypingLibsContext.tsx の useCommand 経由で remove リクエストが removeLibrary()を呼び出すことで実行される
-   TypingLibsContext.tsx::setOfDependency が更新される
-   TypingLibsContext.tsx::dependencies が更新される
-   TypingLibsContext.tsx::packageJson が更新される
-   `reflectToPackageJson()`が更新された dependencies を引数として呼び出される
-   `reflectToPackageJson()`が更新された dependencies を反映するように FilesContext へ change アクションをディスパッチする
-   files の`package.json`が更新される

#### TypingLibsContext.tsx の依存関係更新処理の流れ

-   useFiles()から更新された`package.json`ファイルが渡される
-   `useEffect(,[packageJson])`が呼び出される
-   `snapshot`と files の package.json の各 dependencies と devDependencies を比較して、削除、追加、変更された依存関係を検出する
-   削除された依存関係は`removeLibrary`へ
-   追加された依存関係は`requestFetchTypings`へ
-   変更された依存関係も`requestFetchTypings`へ
-   最後に files の package.json を`snapshot`として保存する
    -   `requestFetchTypings`はリクエストされた依存関係がキャッシュ済でない場合はリクエストの依存関係を worker を通して fetch する
    -   worker からのレスポンスに基づいて`dependencies`を更新、`reflectTpPackageJson`を呼び出す
    -   `reflectToPackageJson`は引数の dependencies と state の dependencies を比較して packageJson の dependencies を更新する。
    -   `reflectToPackageJson`は`dependencies`を更新後`snapshot`をとる

ということで、

-   `setDependencies`は`handleWorkerMessage`、`removeLibrary`から呼び出されている
-   `reflectToPackageJson`は package.json ファイルを更新させるために FilesContext へ change アクションを dispatch している

## 他

## `iExplorer`

`iExplorer`型のデータは`src/components/VSCodeExplorer/Workspace`で主に使われる、FilesContext.tsx から配信される File をツリー型のオブジェクトに変換したものである。

各 File の状態（プロパティ）も iExplorer データに反映させる。

```TypeScript
// data/types.ts
export interface iExplorer {
    id: string;
    name: string;
    isFolder: boolean;
    items: iExplorer[];
    path: string;
    // `isOpening` doesn't means folder is expanded (showing its items) in explorer.
    // This means the file related to this data is now on editor.
    // So isOpening is always false if this data is folder.
    // True is only for file which is on editor.
    isOpening?: boolean;
    isSelected: boolean;
}
```

-   `isOpening`はその iExplorer データに該当する File が現在エディタに展開されていることを示す
-   `isSelected`は iExplorer データに該当する File が現在エディタに表示されていることを示す

ということでフォルダアイテムにとっては現状意味のないプロパティとなっている。

フォルダというアイテムは File には存在せず、iExplorer へ変換する過程で発生するアイテムであるため。

## src/components/VSCodeExplorer/Workspace/Tree.tsx

```TypeScript
/****
 * @param {number} nestDepth - iExplorer itemsの層の深さ。
 * @param {iExplorer} explorer - iExplorer
 * @param {Function} handleInsertNode: (requiredPath: string, isFolder: boolean) => void
 * @param {Function} handleDeleteNode: (explorer: iExplorer) => void;
 * @param {Function} handleReorderNode: (droppedId: string, draggableId: string) => void;
 * @param {Function} handleOpenFile: (explorer: iExplorer) => void;
 * @param {Function} handleSelectFile: (explorer: iExplorer) => void;
 *
 * */
```

フォルダをクリックしたとき：

```TypeScript
// `expand`はこのファイルのstateである。
const handleClickFolderColumn = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setExpand(!expand);
};
```

ファイルをクリックしたとき：

```TypeScript
// 既に開いているファイルをクリックする場合もあるので
// その場合は該当のファイルをselected:trueにすること
const handleClickFileColumn = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleOpenFile(explorer);
    handleSelectFile(explorer);
};
```

新規アイテム(ファイル、フォルダ)アクションをクリックしたとき：

```TypeScript
// `showInput`このファイルのstateで、新規アイテム入力フォームを表示する
    const handleNewItem = (isFolder: boolean) => {
        setExpand(true);
        setShowInput({
            visible: true,
            isFolder,
        });
    };
// 新規アイテム入力フォームでエンタキーが押されたら
// 入力された値が有効であるならhandleInsertNodeを呼び出す
    const onAddItem = (
        e: React.KeyboardEvent<HTMLInputElement>,
        addTo: string
    ) => {
        const requiredPath = addTo.length
            ? addTo + '/' + e.currentTarget.value
            : e.currentTarget.value;
        if (e.keyCode === 13 && requiredPath && isNameValid) {
            handleInsertNode(requiredPath, showInput.isFolder);
            // Clear states
            setShowInput({ ...showInput, visible: false });
            setIsInputBegun(false);
            setIsNameValid(false);
            setIsNameEmpty(false);
        }
    };
// 最終的にFilesContext.tsxのアクション`Add`がディスパッチされる。
```
