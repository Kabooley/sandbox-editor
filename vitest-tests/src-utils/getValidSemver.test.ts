import { describe, test, expect, it } from 'vitest';
import { getValidSemver } from '../../src/utils/getValidSemver';

describe('Test getValidSemver()', () => {
  test('`^1.2.3` should be `1.2.3`', () => {
    const result = getValidSemver('^1.2.3');
    expect(result).toEqual('1.2.3');
  });
  test('`=v1.2.3` should be `1.2.3`', () => {
    const result = getValidSemver('=v1.2.3');
    expect(result).toEqual('1.2.3');
  });
    
  // TODO: returned null.
  test('`>=1.2.3` should be `1.2.3`', () => {
    const result = getValidSemver('>=1.2.3');
    expect(result).toEqual('1.2.3');
  });
  test('`a.b.c` should be null', () => {
    const result = getValidSemver('a.b.c');
    expect(result).toEqual(null);
  });
  test('tags e.g.`latest` should be null', () => {
    const result = getValidSemver('latest');
    expect(result).toEqual(null);
  });
  test('`v2` should be null', () => {
    const result = getValidSemver('v2');
    expect(result).toEqual(null);
  });
  test('`42.6.7.9.3-alpha` should be null', () => {
    const result = getValidSemver('42.6.7.9.3-alpha');
    expect(result).toEqual(null);
  });
});
