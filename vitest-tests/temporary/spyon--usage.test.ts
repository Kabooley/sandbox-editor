import { describe, test, expect, vi, afterEach } from 'vitest';

const module = () => {
  const double = (n: number) => {
    return n * 2;
  };

  return {
    doubleSquare(n: number) {
      const d = double(n);
      return d * d;
    },
  };
};

describe('Make sure how to spy methods by Vitest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test('should spy imported method', () => {
    const mod = module();
    const spyDoubleSquare = vi.spyOn(mod, 'doubleSquare');
    expect(mod.doubleSquare(2)).toEqual(16);
    expect(spyDoubleSquare).toHaveBeenCalled();
    expect(spyDoubleSquare).toHaveReturnedWith(16);
  });
  test("should spy imported module's unexported module", () => {});
  test('should spy imported method', () => {});
  test('should spy imported method', () => {});
});
