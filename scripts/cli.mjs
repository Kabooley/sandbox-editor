import { fork } from 'node:child_process';
import { join } from 'node:path';
import process from 'node:process';

const executeChildProcess = async (args) => {
    const child = fork(join(process.cwd(), 'scripts', 'dummy.mjs'), args, {
    });

    process.on('SIGINT', () => {
        child.kill('SIGKILL');
        process.exit(0)
    });

    return new Promise((resolve, reject) => {
        child.on('message', (message) => {
            resolve(message);
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

const run = () => {
    const args = process.argv.slice(2);
    console.log(args);
    // executeChildProcess(args)
    //     .then((message) => {
    //         console.log(message);
    //     })
    //     .catch((error) => {
    //         console.error(error);
    //     });
}


/***
 * darkreaderでは、
 * `npm run test:chrome`: `node tasks/cli.js build --debug --test --chrome-mv2
 * && jest --config=tests/browser/jest.config.js --runInBand`
 * を渡される。
 * ということで
 * [`build`, `--debug`, `--test`]が
 * executeProcess()へargsとして渡される
 * 
 * fork(__filename, args)で`node ../build.js build --debug --test`が実行される
 * 
 * jestの`--runInBand`: テストを実行する子プロセスのワーカー プールを作成するのではなく、現在のプロセスですべてのテストを順番に実行します。これはデバッグに役立ちます。

 */ 
run();