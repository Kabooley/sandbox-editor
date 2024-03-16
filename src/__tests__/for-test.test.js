import { ForTest } from '../utils/for-test';

const testcase = {
    exp: '/src/index.tsx',
    shouldBe: 'src/index.tsx',
};

describe('Test for-test.js', () => {
    test('result should be `src/index.tsx`', () => {
        expect(ForTest(testcase.exp)).toEqual(testcase.shouldBe);
    });
});
