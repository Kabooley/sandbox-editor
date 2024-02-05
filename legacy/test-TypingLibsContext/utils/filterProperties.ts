
const temporary_dummy = [
    "hoge", "huga"
];

// export const filterProperties_ = <T extends {[key: string]: T[key]}>(
// export const filterProperties_ = <S extends T, T extends {[Property in keyof T]: T[Property]}>(
// export const filterProperties_ = <S extends T, T extends {[key: string]: string}>(
export const filterProperties_ = <S, T extends {[Property in keyof T]: T[Property]}>(
        obj: T,
        // filter: (value: keyof typeof obj) => value is S
     ): T => {
    return (Object.keys(obj) as Array<keyof typeof obj>)
        .filter((key) => key !== "asshole")
        .reduce((o, key) => {
            return {
                ...o, 
                [key]: obj[key]
            };
        }, {} as T);
}

// const dum = {
//     hoge: "hoge",
//     huga: "huga",
//     hage: "hage",
//     poro: "poro",
// };
// 
// a: ("hoge" | "huga" | "hage" | "poro")[]
// const a = (Object.keys(dum) as Array<keyof typeof dum>);
// 
// でも次は通用しない
// const b = a.filter((_a) => _a !== "ass");