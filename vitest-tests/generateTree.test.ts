import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTreeNodeData } from '../src/components/VSCodeExplorer/Workspace/generateTree';
import { files } from '../src/data/files';
import type { iExplorer, iFile } from '../src/data/types';

const shallowCopyObject = <T extends {}>(o: T) => {
  return Object.assign({} as T, o);
};

const emptyFolder: iFile = {
  path: 'src/components',
  language: '',
  value: '',
  isFolder: true,
  selected: false,
  opening: false,
  tabIndex: null,
};

interface iCase {
  case: number;
  title: string;
  entries: iFile[];
  shouldBe: iExplorer;
}

const cases: iCase[] = [
  {
    case: 1,
    title:
      '"public" tree should be included to root items, "public/index.html" should be included "public" items',
    entries: files
      .map((f) => shallowCopyObject<iFile>(f))
      .filter(
        (f: iFile) => f.path === 'public' || f.path === 'public/index.html'
      ),
    shouldBe: {
      id: '1',
      name: 'root',
      isFolder: true,
      items: [
        {
          id: '2',
          name: 'public',
          isFolder: true,
          items: [
            {
              id: '3',
              name: 'index.html',
              isFolder: false,
              items: [],
              path: 'public/index.html',
              isOpening: false,
              isSelected: false,
            },
          ],
          path: 'public',
          isOpening: false,
          isSelected: false,
        },
      ],
      path: '',
      isOpening: false,
      isSelected: false,
    },
  },
  {
    case: 2,
    title: 'Initializing tree from files should be done correctly',
    entries: files.map((f) => shallowCopyObject(f)),
    shouldBe: {
      id: '1',
      name: 'root',
      isFolder: true,
      items: [
        {
          id: '2',
          name: 'public',
          isFolder: true,
          items: [
            {
              id: '6',
              name: 'index.html',
              isFolder: false,
              items: [],
              path: 'public/index.html',
              isOpening: false,
              isSelected: false,
            },
          ],
          path: 'public',
          isOpening: false,
          isSelected: false,
        },
        {
          id: '3',
          name: 'src',
          isFolder: true,
          items: [
            {
              id: '8',
              name: 'App.tsx',
              isFolder: false,
              items: [],
              path: 'src/App.tsx',
              isOpening: false,
              isSelected: false,
            },
            {
              id: '9',
              name: 'index.tsx',
              isFolder: false,
              items: [],
              path: 'src/index.tsx',
              isOpening: false,
              isSelected: false,
            },
            {
              id: '10',
              name: 'styles.css',
              isFolder: false,
              items: [],
              path: 'src/styles.css',
              isOpening: false,
              isSelected: false,
            },
          ],
          path: 'src',
          isOpening: false,
          isSelected: false,
        },
        {
          id: '5',
          name: 'package.json',
          isFolder: false,
          items: [],
          path: 'package.json',
          isOpening: false,
          isSelected: false,
        },
        {
          id: '11',
          name: 'tsconfig.json',
          isFolder: false,
          items: [],
          path: 'tsconfig.json',
          isOpening: false,
          isSelected: false,
        },
        {
          id: '4',
          name: 'soMuchLongDirectoryName',
          isFolder: true,
          items: [
            {
              id: '5',
              name: 'superUltraHyperTooLongBaddaaasssssFile.txt',
              isFolder: false,
              items: [],
              path: 'soMuchLongDirectoryName/superUltraHyperTooLongBaddaaasssssFile.txt',
              isOpening: false,
              isSelected: false,
            },
          ],
          path: 'soMuchLongDirectoryName',
          isOpening: false,
          isSelected: false,
        },
      ],
      path: '',
      isOpening: false,
      isSelected: false,
    },
  },
  // { case: 3, title: '', entries: [], shouldBe: {} },
  // { case: 3, title: '', entries: [], shouldBe: {} },
  // { case: 3, title: '', entries: [], shouldBe: {} },
];

/*******
 * generateTreeNodeData()は次の順番でアイテムをrootオブジェクトに追加していく
 *
 * 1. 他のiExplorerデータをitemsプロパティに持つことになるフォルダ
 * 2. ファイルデータ
 * 3. itemsプロパティが空であるフォルダ
 *
 * ファイルデータはフォルダデータのitemsに追加される関係上、一番先にフォルダデータを作成する必要がある
 * 各iExplorerのidの付与される番号を完全に予見するのは非常に面倒だが、使用場面でidは使わないのでテストの比較においては無視したい
 *
 * */
describe('Test generateTree()', () => {
  cases.forEach((c) => {
    if (c.case === 3) {
      c.entries.push(emptyFolder);
    }
    test(c.title, () => {
      expect(generateTreeNodeData(c.entries)).toEqual(c.shouldBe);
    });
  });

  test('Should add empty folder src/components to src items', () => {
    const entries: iFile[] = files
      .map((f) => shallowCopyObject(f))
      .filter((f) => f.path.includes('src'));
    entries.push(emptyFolder);
    const explorer = generateTreeNodeData(entries).items[0].items.filter(
      (f) => f.path === 'src/components'
    )[0];
    expect(explorer).toBeDefined();
    expect(explorer).toEqual({
      id: '6',
      name: 'components',
      isFolder: true,
      items: [],
      path: 'src/components',
      isOpening: false,
      isSelected: false,
    });
    expect(generateTreeNodeData(entries)).toEqual({
      id: '1',
      name: 'root',
      isFolder: true,
      items: [
        {
          id: '2',
          name: 'src',
          isFolder: true,
          items: [
            {
              id: '3',
              name: 'App.tsx',
              isFolder: false,
              items: [],
              path: 'src/App.tsx',
              isOpening: false,
              isSelected: false,
            },
            {
              id: '4',
              name: 'index.tsx',
              isFolder: false,
              items: [],
              path: 'src/index.tsx',
              isOpening: false,
              isSelected: false,
            },
            {
              id: '5',
              name: 'styles.css',
              isFolder: false,
              items: [],
              path: 'src/styles.css',
              isOpening: false,
              isSelected: false,
            },
            {
              id: '6',
              name: 'components',
              isFolder: true,
              items: [],
              path: 'src/components',
              isOpening: false,
              isSelected: false,
            },
          ],
          path: 'src',
          isOpening: false,
          isSelected: false,
        },
      ],
      path: '',
      isOpening: false,
      isSelected: false,
    });
  });

  // ファイルデータをiFileからiExplorerへ正しく変換ができているか確認
  test('File tree should be generated correctly if passed file data', () => {
    const fileData: iFile = {
      path: 'foo.ts',
      language: '',
      value: '',
      isFolder: false,
      selected: false,
      opening: false,
      tabIndex: null,
    };
    const tree = generateTreeNodeData([fileData]);
    expect(tree).toEqual({
      id: '1',
      name: 'root',
      isFolder: true,
      items: [
        {
          id: '2',
          name: 'foo.ts',
          isFolder: false,
          items: [],
          path: 'foo.ts',
          isOpening: false,
          isSelected: false,
        },
      ],
      path: '',
      isOpening: false,
      isSelected: false,
    });
    expect(tree.items[0]).toEqual({
      id: '2',
      name: 'foo.ts',
      isFolder: false,
      items: [],
      path: 'foo.ts',
      isOpening: false,
      isSelected: false,
    });
  });

  // 深い階層のフォルダデータがiFileからiExplorerへ正しく変換されているか確認
  //
  // TODO: 修正が必要なのか検討： `path/to/nested/folder`というpathのフォルダtreeアイテムがroot直下にできてしまった
  // ファイルデータだったらその途中のフォルダが生成されるはずだけど、
  // フォルダだと生成されないみたい
  /***
   * generateTreeNodeData()へ`path/to/nested/folder`というpathのフォルダデータを渡しても、
   * path、path/to, path/to/nestedというフォルダは生成されていない
   *
   * TODO: 前提としてほかのモジュールによってこんな呼び出しはされないようになっている（`path`というフォルダがないのに`path/to`という新アイテムを追加できないようになっている）けど機能として依存したモジュールを前提としていいのか？
   *
   * なるべくモジュールは独立しているべきなので修正すべき
   *
   * 参考
   * https://github.com/uniqname/dir-tree/blob/master/dir-tree.js
   * https://github.com/migliori/file-tree-browser
   * */
  test('Folder trees should be generated correctly if passed deep nested folder data', () => {
    const folderData: iFile = {
      path: 'path/to/nested/folder',
      language: '',
      value: '',
      isFolder: true,
      selected: false,
      opening: false,
      tabIndex: null,
    };
    const tree = generateTreeNodeData([folderData]);

    console.log(tree);

    expect(tree.items[0].path).toBe('path');
    expect(tree.items[0].isFolder).toBe(true);
    expect(tree.items[0].items[0].path).toBe('path/to');
    expect(tree.items[0].items[0].isFolder).toBe(true);
    expect(tree.items[0].items[0].items[0].path).toBe('path/to/nested');
    expect(tree.items[0].items[0].items[0].isFolder).toBe(true);
    expect(tree.items[0].items[0].items[0].items[0]).toEqual({
      id: '2',
      name: 'folder',
      isFolder: true,
      items: [],
      path: 'path/to/nested/folder',
      isOpening: false,
      isSelected: false,
    });
  });

  // いくつかピックアップして正しく生成されるかの確認
  test("Passed 'src/App.tsx', 'tsconfig.json', 'public/index.html' files should generate 'src', 'public', 'src/App.tsx', 'public/index.html', 'tsconfig.json' tree data", () => {
    const pickedFiles = files.filter(
      (f) =>
        f.path === 'src/App.tsx' ||
        f.path === 'tsconfig.json' ||
        f.path == 'public/index.html'
    );
    const tree = generateTreeNodeData(pickedFiles);

    console.log(tree.items);

    const explorerSrc = tree.items.filter((t) => t.path === 'src')[0];
    const explorerPublic = tree.items.filter((t) => t.path === 'public')[0];

    // `src/App.tsx`を渡したら`src`データも生成されることの確認
    expect(explorerSrc).toBeDefined();
    expect(explorerSrc).toEqual({
      id: '3',
      name: 'src',
      isFolder: true,
      items: [
        {
          id: '5',
          name: 'App.tsx',
          isFolder: false,
          items: [],
          path: 'src/App.tsx',
          isOpening: false,
          isSelected: false,
        },
      ],
      path: 'src',
      isOpening: false,
      isSelected: false,
    });

    // `public/index.html`を渡したら`public`データも生成されることの確認
    expect(explorerPublic).toBeDefined();
    expect(explorerPublic).toEqual({
      id: '2',
      name: 'public',
      isFolder: true,
      items: [
        {
          id: '4',
          name: 'index.html',
          isFolder: false,
          items: [],
          path: 'public/index.html',
          isOpening: false,
          isSelected: false,
        },
      ],
      path: 'public',
      isOpening: false,
      isSelected: false,
    });

    expect(
      explorerSrc.items.filter((t) => t.path === 'src/App.tsx')[0]
    ).toBeDefined();
    expect(
      explorerSrc.items.filter((t) => t.path === 'src/App.tsx')[0]
    ).toEqual({
      id: '5',
      name: 'App.tsx',
      isFolder: false,
      items: [],
      path: 'src/App.tsx',
      isOpening: false,
      isSelected: false,
    });

    expect(
      tree.items.filter((t) => t.path === 'tsconfig.json')[0]
    ).toBeDefined();
    expect(tree.items.filter((t) => t.path === 'tsconfig.json')[0]).toEqual({
      id: '6',
      name: 'tsconfig.json',
      isFolder: false,
      items: [],
      path: 'tsconfig.json',
      isOpening: false,
      isSelected: false,
    });

    expect(
      explorerPublic.items.filter((t) => t.path === 'public/index.html')[0]
    ).toBeDefined();
    expect(
      explorerPublic.items.filter((t) => t.path === 'public/index.html')[0]
    ).toEqual({
      id: '4',
      name: 'index.html',
      isFolder: false,
      items: [],
      path: 'public/index.html',
      isOpening: false,
      isSelected: false,
    });
  });

  // test('', () => { });
});
