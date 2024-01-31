/***
 * Referenced:
 * https://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
 * 
 * https://github.com/codesandbox/codesandbox-client/blob/7886537619345681fed4bd2ee6168273ac32ad04/packages/app/src/app/overmind/utils/common.ts#L4
 * 
 * */ 
export const sortObjectByKeys = (unordered: {[key: string]: string }) => {
    return Object.keys(unordered).sort().reduce(
        (obj: {[key: string]: string }, key) => { 
          obj[key] = unordered[key]; 
          return obj;
        }, 
        {}
    );
};