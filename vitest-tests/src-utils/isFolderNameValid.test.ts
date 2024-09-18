import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { isFolderNameValid } from '../../src/utils/isFolderNameValid';

// TODO: ちょっといくつかライブラリを見てどうすべきか決めるべきかも
const cases = [
  // Not allow slash
  {
    describe: '`slash/contained/directory-name` should be false',
    name: 'slash/contained/directory-name',
    shouldBe: false,
  },
  // Allow only numeric
  {
    describe: '`222222` should be true',
    name: '222222',
    shouldBe: true,
  },
  //   Allow containing period
  {
    describe: '`.vscode` should be true',
    name: '.vscode',
    shouldBe: true,
  },
  //   Allow containing - and _
  {
    describe: '`--__annoying_directory-name--__` should be true',
    name: '--__annoying_directory-name--__',
    shouldBe: true,
  },
  //   Not allow containing `@`
  //   Not allow containing `!`
  //   Not allow containing `"`
  //   Not allow containing `'`
  //   Not allow containing `$`
  //   Not allow containing ``
  //   Not allow containing `@`
  //   Not allow containing `@`
  //   Not allow containing `@`
  //   Not allow containing `@`
  //   Not allow containing `@`
  //   Not allow containing `@`
  //   Not allow containing `@`
  {
    describe: '`script2.js.worker` should be true',
    name: 'script2.js.worker',
    shouldBe: true,
  },
  {
    describe: '`script2._.bundled` should be true',
    name: 'script2._.bundled',
    shouldBe: true,
  },
  {
    describe: '`-script.js` should be true',
    name: '-script.js',
    shouldBe: true,
  },
  {
    describe: "`sc'ript.js` should be false",
    name: "sc'ript.js",
    shouldBe: false,
  },
  { describe: '& cannot be included', name: 'sc&ript.js', shouldBe: false },
  { describe: '^ cannot be included', name: 'sc^ript.js', shouldBe: false },
  { describe: '? cannot be included', name: 'sc?ript.js', shouldBe: false },
  { describe: '! cannot be included', name: 'sc!ript.js', shouldBe: false },
  {
    describe: 'Should pass even no extensions',
    name: 'script',
    shouldBe: true,
  },
  {
    describe: 'Should pass even no extensions and only numeric characters',
    name: '123',
    shouldBe: true,
  },
  { describe: 'script_ should be passed', name: 'script_', shouldBe: true },
  { describe: 'script- should be passed', name: 'script-', shouldBe: true },
];

// 記号は-と_と.のみ許される
// 文字はalphanumericのみ許される
// となるようにすること
describe('Test isFoldernameValid()', () => {
  cases.forEach((c) => {
    it(c.describe, () => {
      expect(isFolderNameValid(c.name)).toBe(c.shouldBe);
    });
  });
});
