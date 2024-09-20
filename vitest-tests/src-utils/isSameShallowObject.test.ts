import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { isSameShallowObject } from '../../src/utils/isSameShallowObject';

const target = {
  '@types/react': '18.2.52',
  '@types/react-dom': '18.2.18',
  '@types/semver': '^7.5.6',
  'idb-keyval': '^6.2.1',
  'monaco-editor': '^0.45.0',
  react: '18.2.0',
  'react-dom': '18.2.0',
  semver: '^7.5.4',
  typescript: '^5.3.3',
};

const compareWith = {
  '@types/react': '18.2.52',
  '@types/react-dom': '18.2.18',
  '@types/semver': '^7.5.6',
  'idb-keyval': '^6.2.1',
  'monaco-editor': '^0.45.0',
  react: '18.2.0',
  'react-dom': '18.2.0',
  semver: '^7.5.4',
  typescript: '^5.3.3',
};

describe('Test isSameShallowObject()', () => {
  let _target: Record<string, string> = {};
  let _compareWith: Record<string, string> = {};

  beforeEach(() => {
    _target = {};
    _compareWith = {};
    Object.assign(_target, target);
    Object.assign(_compareWith, compareWith);
  });

  afterEach(() => {
    console.log(_target);
    console.log(_compareWith);
  });

  test('Should be no difference', () => {
    expect(isSameShallowObject(_target, _compareWith)).toBe(true);
  });

  test('Should be no difference even order of properties are difference', () => {
    // This operation adds react property to end of the object.
    delete _compareWith['react'];
    _compareWith['react'] = '18.2.0';
    expect(isSameShallowObject(_target, _compareWith)).toBe(true);
  });

  test('Should be different property value', () => {
    _compareWith['react'] = '17.0.2';
    expect(isSameShallowObject(_target, _compareWith)).toBe(false);
  });

  test('Should be different property key', () => {
    delete _compareWith['react'];
    _compareWith['reaaact'] = '10.0.0';
    expect(isSameShallowObject(_target, _compareWith)).toBe(false);
  });

  test('Should be different because of there are fewer properties', () => {
    delete _compareWith['react'];
    expect(isSameShallowObject(_target, _compareWith)).toBe(false);
  });

  test('Should be different because of there are more properties', () => {
    _compareWith['reaaact'] = '10.0.0';
    expect(isSameShallowObject(_target, _compareWith)).toBe(false);
  });
});
