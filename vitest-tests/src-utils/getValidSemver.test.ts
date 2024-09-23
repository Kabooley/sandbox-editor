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

/*
package.jsonのdependenciesのプロパティにおける表記可能性のあるsemantice versions表現：

In your Node environment, when managing dependencies and `devDependencies` in `package.json`, you use semantic versioning (semver) to specify which versions of a package your project depends on. Here's a breakdown of all possible version expressions:

### 1. **Exact Version**
   - `"package-name": "1.2.3"`
     - Installs exactly version `1.2.3` with no updates.

### 2. **Caret (`^`)**
   - `"package-name": "^1.2.3"`
     - Installs the most recent compatible minor or patch version.
     - For example, `^1.2.3` allows any version `>=1.2.3` but `<2.0.0`.

### 3. **Tilde (`~`)**
   - `"package-name": "~1.2.3"`
     - Installs the most recent patch version, i.e., `>=1.2.3` but `<1.3.0`.

### 4. **Greater Than or Equal (`>=`)**
   - `"package-name": ">=1.2.3"`
     - Installs versions greater than or equal to `1.2.3`.

### 5. **Less Than (`<`)**
   - `"package-name": "<2.0.0"`
     - Installs any version lower than `2.0.0`.

### 6. **Range**
   - `"package-name": ">=1.2.3 <2.0.0"`
     - Installs versions within a specific range.

### 7. **Wildcards (`*`)**
   - `"package-name": "*"`, `"package-name": "1.x"`
     - Installs any version of the package, or a specific major version with any minor/patch.

### 8. **Latest**
   - `"package-name": "latest"`
     - Always installs the latest version.

### 9. **Pre-releases**
   - `"package-name": "1.2.3-alpha.0"`
     - Installs a specific pre-release version (like `alpha`, `beta`).

### 10. **X-Ranges**
   - `"package-name": "1.2.x"`
     - Installs any patch version for the minor version `1.2`.

### 11. **Hyphen Ranges**
   - `"package-name": "1.2.3 - 1.3.0"`
     - Installs versions between `1.2.3` and `1.3.0`.

### 12. **Exact Version with Pre-releases**
   - `"package-name": "1.2.3-beta.1"`
     - Allows installation of a pre-release version of a package.

These different expressions allow for flexibility in updating dependencies while still maintaining control over which versions are installed.

*/
