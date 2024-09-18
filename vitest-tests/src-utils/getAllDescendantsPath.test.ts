import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTreeNodeData } from '../../src/components/VSCodeExplorer/Workspace/generateTree';
import { files } from '../../src/data/files';
import type { iExplorer } from '../../src/data/types';
import { getAllDescendantsPath } from '../../src/utils/getAllDescendantsPath';
import { shallowCopyObject } from '../utils/copyObjectShallow';

/******************************************************
 * getAllDescendantsPath() returns all descendatns items path
 * from passed iExplorer data.
 *
 * ****************************************************/
describe('Test getAllDescendantsPath', () => {
  let tree: iExplorer = {
    id: '0',
    path: '',
    isFolder: false,
    isSelected: false,
    items: [],
    name: '',
  };
  beforeEach(() => {
    tree = generateTreeNodeData(files);
  });

  test('Should return "src/App.tsx", "src/stylee.css", "src/index.tsx" if passed "src" iExplorer data', () => {
    expect(tree.items[2].path).toBe('src');
    expect(getAllDescendantsPath(tree.items[2]).sort()).toEqual([
      'src/App.tsx',
      'src/index.tsx',
      'src/styles.css',
    ]);
  });

  test('Should return #public/index.html" if passed "publice" iExplorer data', () => {
    expect(tree.items[0].path).toBe('public');
    expect(getAllDescendantsPath(tree.items[0]).sort()).toEqual([
      'public/index.html',
    ]);
  });

  test('Should return empty array if passed explorer data with empty items property', () => {
    const _files = files.map((f) => shallowCopyObject(f));
    _files.push({
      path: 'temporary',
      language: '',
      value: '',
      isFolder: true,
      selected: false,
      opening: false,
      tabIndex: null,
    });
    const _tree = generateTreeNodeData(_files);
    const emptyFolder = _tree.items.filter((f) => f.path === 'temporary');
    expect(emptyFolder[0]).toBeDefined();
    expect(getAllDescendantsPath(emptyFolder[0])).toEqual([]);
  });
});
