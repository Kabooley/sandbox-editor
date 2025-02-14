import { describe, it, expect } from 'vitest';
import { isFolderNameValid } from '../../src/utils/isFolderNameValid';

const cases = [
  {
    describe: 'Should allow consist of alphanumeric',
    name: 'folername123',
    shouldBe: true,
  },
  {
    describe:
      'Should allow containing `.` (dot), `_`(underscore), `-`(hyphen), `~`(tilde), `+`(plus)',
    name: '._-~+',
    shouldBe: true,
  },
  {
    describe:
      'Should allow containing ,`@`(at symbol),`#`(hash),`!`(exclamation mark),`%`(percent),`&`(ampersand),`=`(equal),`:`(colon),`;`(semicolon),`,`(comma) ',
    name: '@#!%&=:;,',
    shouldBe: true,
  },
  {
    describe:
      'Should allow containing `?`(question mark),`^`(caret),`(` and `)`(parentheses),`{` and`}`(curly braces),`[` and`]`(square brackets),`\'`(single quote),`"`(double quote),`|`(pipe)',
    name: `?^(){}[]'"|`,
    shouldBe: true,
  },
  {
    describe: 'Must not allow containing `/`(slash)',
    name: 'must/not',
    shouldBe: false,
  },
  {
    describe: 'Must not allow containing `\\`(back slash)',
    name: 'must\\not',
    shouldBe: false,
  },
  {
    describe: 'Must not allow containing `\\0`(null character)',
    name: 'mustnotincludenullcharacter\\0',
    shouldBe: false,
  },
];

/**
 * Test isFoldernameValid().
 *
 * Foldername must not include `/` (slash), `\` (back slash), `\0` (null character)
 * Additionally the method does not allow `\s` (whitespace).
 *
 * Other special characters and alphanumeric should be allowed.
 * */
describe('Test isFolderNameValid()', () => {
  cases.forEach((c) => {
    it(c.describe, () => {
      expect(isFolderNameValid(c.name)).toBe(c.shouldBe);
    });
  });
});

/*
In Linux, directory names (like file names) can include a wide range of characters, but there are some restrictions and best practices to keep in mind:

### Allowed Characters:
1. **Alphanumeric Characters**: `A-Z`, `a-z`, `0-9`
2. **Special Characters**: 
   - `.` (dot)
   - `_` (underscore)
   - `-` (hyphen)
   - `~` (tilde)
   - `+` (plus)
   - `@` (at symbol)
   - `#` (hash)
   - `!` (exclamation mark)
   - `%` (percent)
   - `&` (ampersand)
   - `=` (equal)
   - `:` (colon)
   - `;` (semicolon)
   - `,` (comma)
   - `?` (question mark)
   - `^` (caret)
   - `(` and `)` (parentheses)
   - `{` and `}` (curly braces)
   - `[` and `]` (square brackets)
   - `'` (single quote)
   - `"` (double quote)
   - `|` (pipe)

### Restrictions:
- **Slash (`/`)**: This is used as a directory separator and cannot be included in a directory name.
- **Null Character (`\0`)**: This is also not allowed as it terminates strings in C-based languages.
- **Leading Dots**: While you can start a directory name with a dot (e.g., `.hidden`), it makes the directory hidden in default views.
- **Maximum Length**: The maximum length for a directory name is typically 255 bytes, but this can depend on the filesystem.

### Best Practices:
- Avoid using spaces: While spaces are allowed, they can complicate command-line operations. Use underscores (`_`) or hyphens (`-`) instead.
- Avoid special characters: Although many special characters are allowed, it's generally safer to stick to alphanumeric characters, underscores, and hyphens to prevent issues with scripts and commands.

### Examples:
Valid directory names:
- `my_directory`
- `Project-2024`
- `data_backup_1`
- `test@files`

Invalid directory name:
- `my/directory` (contains a `/`)

By following these guidelines, you can create directory names in Linux that are both functional and manageable.
*/
