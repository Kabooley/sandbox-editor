# Explorer Actions 実装

未着手の Explorer のアクション機能を実装していく

## TODOs

-   [TODO: OpenEditor Opening ファイルをすべて閉じる](#OpenEditor-Openingファイルをすべて閉じる)
-   [TODO: Workspace Workspace の開いているフォルダをすべて閉じる](#Workspace-Workspaceの開いているフォルダをすべて閉じる)
-   [TODO: Workspace ファイル/フォルダのリネーム](#Workspace-ファイル/フォルダのリネーム)
-   [TODO: Workspace selected ファイルを含むフォルダは自動的に開いたままにする](#Workspace-selectedファイルを含むフォルダは自動的に開いたままにする)
-   [TODO: Workspace 新規アイテム追加するときのフォームのインデントの修正](#Workspace 新規アイテム追加するときのフォームのインデントの修正)
-   [TODO: Icon の追加](#Iconの追加)

低優先

-   [TODO: ホバーしたらアイテムの説明が現れるようにする](#ホバーしたらアイテムの説明が現れるようにする)
-   [TODO: ](#)

本ブランチ関係ない件：

-   [TODO: seletcted: true のファイルを削除すると editor 上にその削除したファイルが残ってしまう件](#seletcted:-trueのファイルを削除するとeditor上にその削除したファイルが残ってしまう件)
    これは FilesContext.tsx で`DELETE_FILE`, `DELETE_FILE_MULTIPLE`するときに selected:true のファイルを選定しなおせばよい

## Summary

[機能解説](#機能解説)

## OpenEditor

## Workspace

#### folder の開閉の改善

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

## 機能解説

#### `iExplorer`

`iExplorer`型のデータは`src/components/VSCodeExplorer/Workspace`で主に使われる、FilesContext.tsxから配信されるFileをツリー型のオブジェクトに変換したものである。

各Fileの状態（プロパティ）もiExplorerデータに反映させる。

```TypeScript
// data/types.ts
export interface iExplorer {
    id: string;
    name: string;
    isFolder: boolean;
    items: iExplorer[];
    path: string;
    // NOTE: new added
    // `isOpening` doesn't means folder is expanded (showing its items) in explorer.
    // This means the file related to this data is now on editor.
    // So isOpening is always false if this data is folder.
    // True is only for file which is on editor.
    isOpening?: boolean;
    isSelected: boolean;
}
```

- `isOpening`はそのiExplorerデータに該当するFileが現在エディタに展開されていることを示す
- `isSelected`はiExplorerデータに該当するFileが現在エディタに表示されていることを示す

ということでフォルダアイテムにとっては現状意味のないプロパティとなっている。

フォルダというアイテムはFileには存在せず、iExplorerへ変換する過程で発生するアイテムであるため。

TODO:

- ファイルがisSelected: trueであるときその親フォルダのisOpening, isSelectedはtrueになってほしい
- フォルダアイテムがisSelected: trueであるとき、該当アイテムカラムは選択中であるような見た目になってほしい
- フォルダアイテムがisOpening: trueであるとき、フォルダアイテムのTree.tsxのexpand:trueになってほしい
- 


#### src/components/VSCodeExplorer/Workspace/Tree.tsx

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

#### src/components/VSCodeExplorer/Workspace/generateTree.tsx

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