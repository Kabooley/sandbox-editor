import { describe, test, expect, vi, afterEach, afterAll } from 'vitest';
import { calcurator } from './calcurator.ts';

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
  /**
   * spyOn() メソッドはオブジェクト内の関数プロパティを対象に追跡できる代物である。
   *
   * 基本的な使い方：
   * spyOn()には第一引数にオブジェクトを、第二引数にspyしたいメソッド名を指定する。
   * 下記のテストの通り、spyできるのはexportされたメソッドである。
   * 当然exportされていないメソッド（`double`）はspy出来ない。
   *
   * NOTE: vi.mocl()のようにモジュールを追跡することはできない
   */
  test('should spy imported method', () => {
    const mod = module();
    const spyDoubleSquare = vi.spyOn(mod, 'doubleSquare');
    expect(mod.doubleSquare(2)).toEqual(16);
    expect(spyDoubleSquare).toHaveBeenCalled();
    expect(spyDoubleSquare).toHaveReturnedWith(16);
  });
  /**
   * vi.mock()は`spy`オプションを付ければモジュールを追跡できる
   *
   * TODO: exportしているメソッドだけ追跡するのか？
   */
  test('should spy entire module', () => {
    vi.mock('./calcurator.ts', { spy: true });
    const result = calcurator(11, 22, '+');
    expect(result).toEqual(33);
    expect(calcurator).toHaveBeenCalled();
    expect(calcurator).toHaveReturnedWith(33);
  });
  test('should spy imported method', () => {});
});
