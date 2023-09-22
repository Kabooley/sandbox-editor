# Note: TypeScript Tips

## 既存の型のプロパティの一つをオプショナルにしたいとき

https://stackoverflow.com/a/54178819/22007575

```TypeScript
// 既存の型
interface iExplorer {
    id: string;
    name: string;
    isFolder: boolean;
    items: iExplorer[];
    path: string;
}

// 変換に必要な型
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// 変換
//
// `path`と`name`だけ必須になった
type iExplorerOptinal = PartialBy<iExplorer, "items" | "id" | "isFolder">

// 確認
const d: iExplorerOptional = {
    path: "sdfsadfa",
    name: "dsafdsa",
}

```
