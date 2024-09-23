import { describe, it, expect } from 'vitest';
import { sortPropertiesByKey } from '../../src/utils/sortPropertiesByKey';

const unorderedObject = {
  '@types/semver': '7.5.6',
  'idb-keyval': '6.2.1',
  '@types/react-dom': '18.2.18',
  semver: '7.5.4',
  react: '18.2.0',
  'react-dom': '18.2.0',
  '@types/react': '18.2.52',
};

const orderedObject = {
  '@types/react': '18.2.52',
  '@types/react-dom': '18.2.18',
  '@types/semver': '7.5.6',
  'idb-keyval': '6.2.1',
  react: '18.2.0',
  'react-dom': '18.2.0',
  semver: '7.5.4',
};

describe('Test sortPropertiesByKey()', () => {
  test('`unorderedObject` should be equal to`orderedObject`', () => {
    expect(sortPropertiesByKey(unorderedObject)).toEqual(orderedObject);
  });
});
