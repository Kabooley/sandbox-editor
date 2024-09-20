/****************************************************************************
 * This test covers 
 * - src/utils/getFileIconName.ts
 * - src/utils/getFileLanguage.ts
 * - src/utils/getFileType.ts
 * 
 * **************************************************************************/ 
import { describe, it, expect } from 'vitest';
import { getFileIconName } from '../../src/utils/getFileIconName';


const cases = [
  { describe: 'Should return `react-typescript` if passed `src/ path / to / reacttypescript.tsx`', path: 'src/path/to/reacttypescript.tsx', shouldBe: 'react-typescript' },
  { describe: 'Should return `react` if passed `src/path/to/foo.jsx`', path: 'src/path/to/foo.jsx', shouldBe: 'react' },
  { describe: 'Should return `typescript` if passed `src/path/to/foo.ts`', path: 'src/path/to/foo.ts', shouldBe: 'typescript' },
  { describe: 'Should return `javacript` if passed `src/path/to/foo.js`', path: 'src/path/to/foo.js', shouldBe: 'javascript' },
  { describe: 'Should return `json` if passed `src/path/to/foo.json`', path: 'src/path/to/foo.json', shouldBe: 'json' },
  { describe: 'Should return `css` if passed `src/path/to/foo.css`', path: 'src/path/to/foo.css', shouldBe: 'css' },
  { describe: 'Should return `html` if passed `src/path/to/foo.html`', path: 'src/path/to/foo.html', shouldBe: 'html' },
  { describe: 'Should return `markdown` if passed `docs/feature.md`', path: 'docs/feature.md', shouldBe: 'markdown' },
  { describe: 'Should return `blank-file` if passed path with no extension', path: 'docs/feature', shouldBe: 'blank-file' },
  { describe: 'Should return `blank-file` if passed path with anonymous extension', path: 'docs/hoo.wtf', shouldBe: 'blank-file' },
  { describe: 'Should return `image` if passed `assets/cat.png`', path: 'assets/cat.png', shouldBe: 'image' },
  { describe: 'Should return `image` if passed `assets/dog.jpeg`', path: 'assets/dog.jpeg', shouldBe: 'image' },
  { describe: 'Should return `image` if passed `assets/penguin.jpg`', path: 'assets/penguin.jpg', shouldBe: 'image' },
  { describe: 'Should return `svg` if passed `assets/chevron.svg`', path: 'assets/chevron.svg', shouldBe: 'svg' }
];

const isLowerCase = (str: string) => str === str.toLowerCase();


describe('Test getFileIconName()', () => {
  cases.forEach((c) => {
    it(c.describe, () => {
      const result = getFileIconName(c.path);
      expect(result).toEqual(c.shouldBe);
      expect(isLowerCase(result)).toBe(true);
    });
  });
})
