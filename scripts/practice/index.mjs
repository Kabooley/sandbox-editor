import { exec, execFile, spawn, fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// // exec
// exec('ls -lh', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`error: ${error.message}`);
//     return;
//   }

//   if (stderr) {
//     console.error(`stderr: ${stderr}`);
//     return;
//   }

//   console.log(`stdout:\n${stdout}`);
// });

// execFile
// const fileProcessorPath = path.resolve(__dirname, 'execFileProcessor.js');
// execFile('node', [fileProcessorPath], (error, stdout, stderr) => {
//     if (error) {
//       console.error(`error: ${error.message}`);
//       return;
//     }

//     if (stderr) {
//       console.error(`stderr: ${stderr}`);
//       return;
//     }

//     console.log(`stdout:\n${stdout}`);
// });

// spawn
/**
 * `find .`
 *
 *
 * */
// const spawnedChild = spawn('find', ['.']);
// spawnedChild.stdout.on('data', (data) => {
//   console.log(`stdout:\n${data}`);
// });

// spawnedChild.stderr.on('data', (data) => {
//   console.error(`stderr: ${data}`);
// });

// spawnedChild.on('error', (error) => {
//   console.error(`error: ${error.message}`);
// });

// spawnedChild.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });

// fork
const forkProcessorPath = path.resolve(__dirname, 'forkProcessor.mjs');
const forkedChild = fork(forkProcessorPath);
forkedChild.on('message', (msg) => {
  console.log('Message from data processor exchange', msg);
});

forkedChild.send({ hello: 'world' });
forkedChild.on('close', () => console.log('closed'));

/**
 * SIGINT: Interrupt from keyboard.
 * ターミナルからの 'SIGINT' はすべてのプラットフォームでサポートされており、通常は Ctrl+C で生成できます 
 * 
 * SIGKILL: Kill signal.
 * 'SIGKILL' にはリスナーをインストールできません。すべてのプラットフォームで Node.js が無条件に終了します。
 * 
 * SIGINT、SIGTERM、SIGKILL を送信すると、対象プロセスが無条件に終了し、その後、サブプロセスはプロセスがシグナルによって終了したことを報告します。

 */

// Using a single function to handle multiple signals
function handle(signal) {
  console.log(`Received ${signal}`);
  if (signal === 'SIGINT') {
    forkedChild.kill('SIGKILL');
    process.exit(130);
  }
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
