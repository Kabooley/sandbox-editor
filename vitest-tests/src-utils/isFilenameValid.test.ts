import { describe, expect, it } from 'vitest';
import { isFilenameValid } from '../../src/utils/isFilenameValid';

const cases = [
  {
    describe: '`sdfsadfa/dsafsdfs.fdsjkad/sadsa.js` should be false',
    filename: 'sdfsadfa/dsafsdfs.fdsjkad/sadsa.js',
    shouldBe: false,
  },
  {
    describe: '`222222.3333` should be true',
    filename: '222222.3333',
    shouldBe: true,
  },
  {
    describe: '`script2.js` should be true',
    filename: 'script2.js',
    shouldBe: true,
  },
  {
    describe: '`script2.js?` should be false',
    filename: 'script2.js?',
    shouldBe: false,
  },
  {
    describe: '`script2.js.worker` should be true',
    filename: 'script2.js.worker',
    shouldBe: true,
  },
  {
    describe: '`script2._.bundled` should be true',
    filename: 'script2._.bundled',
    shouldBe: true,
  },
  {
    describe: '`-script.js` should be true',
    filename: '-script.js',
    shouldBe: true,
  },
  {
    describe: "`sc'ript.js` should be false",
    filename: "sc'ript.js",
    shouldBe: false,
  },
  { describe: '& cannot be included', filename: 'sc&ript.js', shouldBe: false },
  { describe: '^ cannot be included', filename: 'sc^ript.js', shouldBe: false },
  { describe: '? cannot be included', filename: 'sc?ript.js', shouldBe: false },
  { describe: '! cannot be included', filename: 'sc!ript.js', shouldBe: false },
  {
    describe: 'Should pass even no extensions',
    filename: 'script',
    shouldBe: true,
  },
  {
    describe: 'Should pass even no extensions and only numeric characters',
    filename: '123',
    shouldBe: true,
  },
  { describe: 'script_ should be passed', filename: 'script_', shouldBe: true },
  { describe: 'script- should be passed', filename: 'script-', shouldBe: true },
  {
    describe: 'script. should not be passed',
    filename: 'script.',
    shouldBe: false,
  },
];

describe('Test isFilenameValid()', () => {
  cases.forEach((c) => {
    it(c.describe, () => {
      expect(isFilenameValid(c.filename)).toBe(c.shouldBe);
    });
  });
});
