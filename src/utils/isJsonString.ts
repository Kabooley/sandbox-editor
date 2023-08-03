export const isJsonString = (string: string) => {
    try {
        return JSON.parse(string);
    }
    catch(e) {
        console.error("[isJsonString] Argument string is not json");
        throw e;
    }
};
// export const isJsonString = (string: string): boolean => {
//     let result = false;
//     try {
//         result = JSON.parse(string);
//     }
//     catch(e) {
//         console.error("[isJsonString] Argument string is not json");
//         console.error(e);
//         result = false;
//     }
//     finally {
//         return result ? true : false;
//     }
// };