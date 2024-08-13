// setupがうまくいったのか確認のため試しに
import { removeFirstSlash } from '../utils/removeFirstSlash';

const testcase = {
    exp: '/src/index.tsx',
    shouldBe: 'src/index.tsx',
};

describe('Test removeFirstSlash', () => {
    test('result should be `src/index.tsx`', () => {
        expect(removeFirstSlash(testcase.exp)).toEqual(testcase.shouldBe);
    });
});
