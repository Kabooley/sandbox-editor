/**
 * バージョン範囲を示す表記はsemver.valid()でいうとinvalidである。
 *
 * caret:   `^1.2.3`のような表記の意味は、そのバージョンのメジャーバージョンさえ変更しなければ、
 *          マイナーバージョン以下は変更してもいいという、バージョンの許容範囲を示す表記である。
 *          ただし下に下がるのはダメで
 *          1.2.3 ~ 2.0.0が許容範囲となる。
 *
 * tilde:   `~1.2.3`のような表記の意味は、そのバージョンのメジャーバージョンとマイナーバージョンを変更しなければ、
 *          パッチバージョンは変更してもいいという、バージョンの許容範囲を示す表記である。
 *          1.2.3 ~ 1.3.0が許容範囲となる。
 *
 * */
import semver from 'semver';

/***
 * semver.valid(version)の結果を返す関数。
 * 引数`version`がtag（`latest`や`beta`など）を示す場合nullを返す
 *
 * 範囲を示すcaretかtildeが付いている場合それを取り除いた値で
 * semver.validを実行する。
 *
 * 参考：
 * https://github.com/npm/node-semver?tab=readme-ov-file#advanced-range-syntax
 * */
export const getValidSemver = (version: string): string | null => {
    if (version === 'latest') return null;
    // tildeとcaretがついている場合を考慮して取り除く
    const removedCaretOrTildeAtBeginning = version
        .replace(/^[\^+]/g, '')
        .replace(/^[\~+]/g, '');
    const cleaned = semver.clean(removedCaretOrTildeAtBeginning);
    // returns null if invalid, returns passed value if valid.
    return semver.valid(cleaned);
};
