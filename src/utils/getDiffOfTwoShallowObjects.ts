type iObj = Record<string, any>;
interface iDiffsOfTwoObjects {
    deleted: iObj[];
    created: iObj[];
    modifiedVal: Record<string, { prev: string; current: string }>[];
}

/***
 * ２つのオブジェクトを比較して、その差分を返す。
 *
 * @returns
 *  deleted:     compareWithにあってtargetにないプロパティ(key比較)
 *  created:     targetにあってcompareWithにないプロパティ(key比較)
 *  modifiedVal: targetにもcompareWithにも存在するけど値が異なるプロパティがある場合、
 *               targetの方の要素を返す。
 *
 * NOTE: ネストが1段階のpropertyのみもつオブジェクトしか対応しない。
 *
 * 参考：
 * https://github.com/moroshko/shallow-equal/blob/master/src/objects.ts
 * */
export const getDiffOfTwoShallowObjects = (
    target: iObj,
    compareWith: iObj
): iDiffsOfTwoObjects => {
    console.log('[getDiffOfTwoShallowObjects]');
    console.log(target);
    console.log(compareWith);

    if (
        Object.keys(target).length === Object.keys(compareWith).length &&
        Object.keys(target).every((key) => target[key] === compareWith[key])
    ) {
        return {
            deleted: [],
            created: [],
            modifiedVal: [],
        };
    }

    let deleted: iObj[] = [];
    let created: iObj[] = [];
    let modifiedVal: Record<string, { prev: string; current: string }>[] = [];

    // deleteされた判定：
    // compareWithにあるkey名称がtargetには存在しない
    /**
     * 豆：
     * Object.keys(obj).forEach(key)だとkeyは強制的にstringになる
     * for(const key in obj){}だとkeyはExtract<keyof typeof Obj, string>になる
     * */
    for (const key in compareWith) {
        if (
            target[key] === undefined ||
            !Object.prototype.hasOwnProperty.call(target, key)
        ) {
            const o: iObj = {};
            o[key] = compareWith[key];
            deleted.push(o);
        }
    }

    // createされた判定:
    // compareWithにないkey名称がtargetに存在する
    for (const key in target) {
        if (
            compareWith[key] === undefined ||
            !Object.prototype.hasOwnProperty.call(compareWith, key)
        ) {
            const o: iObj = {};
            o[key] = target[key];
            created.push(o);
        }
    }

    // modified_valされた判定:
    // compareWithにもtargetにも存在するkey名称だけど、その値が異なる
    // NOTE: 変更後の方を返す
    Object.keys(target).forEach((key) => {
        if (
            compareWith[key] !== undefined &&
            target[key] !== compareWith[key]
        ) {
            const o: Record<string, { prev: string; current: string }> = {};
            const p: { prev: string; current: string } = {
                prev: compareWith[key],
                current: target[key],
            };
            o[key] = p;
            modifiedVal.push(o);
        }
    });

    return {
        deleted: deleted,
        created: created,
        modifiedVal: modifiedVal,
    };
};
