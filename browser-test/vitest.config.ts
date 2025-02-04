/**
 * Config for ./browserTest.test.ts
 * To run ./browserTest.test.ts, 
 * run '$ npx vitest --config ./browser-test/vitest.config.ts' 
 * from root of this project
 * 
 * このコンフィグファイルはプロジェクトのルートディレクトリの
 * vitest.config.tsと区別するために存在する
 */ 
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    test: {
        include: [path.resolve("browser-test/browserTest.test.ts")],
        exclude: ["**/node_modules/**"]
    }
})
