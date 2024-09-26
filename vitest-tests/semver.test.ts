import { describe, test, expect, it } from 'vitest';
import semver from 'semver';


const possibleSemanticVersions = [
    "1.2.3",
    "^1.2.3",
    "~1.2.3",
    ">=1.2.3",
    "<2.0.0",
    ">=1.2.3 <2.0.0",
    "*", "1.x",
    "latest",
    "1.2.3-alpha.0",
    "1.2.x",
    "1.2.3 - 1.3.0",
    "1.2.3-beta.1",
];


/**
 * semverの挙動を理解するためのテスト
 * 
 * 参考：
 * https://weseek.co.jp/tech/2786/
 * */ 
describe('Test semver', () => {
    test('Should return only version', () => {
        expect(semver.coerce('v2')).toBe('');
    })
})
