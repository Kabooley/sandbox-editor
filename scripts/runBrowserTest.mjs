import { exec } from 'child_process';
import glob from 'glob';
import path from 'path';

// 実行時のCWDから見た相対パスを指定すること
const pattern = './browser-test/*.test.ts';
let portCounter = 8080;

/**
 * @param {Array<string>} files - patternにマッチしたファイルのリスト
 *
 * TODO: 各execでテストが終了したら各自自動でcloseするようにしたい
 * mochaではconst runner = mocha.run();のrunnerを使って終了を検知できる。
 * このときhttp-serverへ終了を通知できればなんとかプロセスを閉じることができるはず
 * http-serverにその機能がなかった場合、http-serverの代替となるライブラリを探す必要がある。
 * -> http-serverはCtrl+C以外に終了する手段がない。
 * https://www.npmjs.com/package/serve
 * 上記のライブラリの使用を検討
 *
 * https://github.com/http-party/http-server/pull/823
 */
glob(pattern, (err, files) => {
  if (err) {
    console.error('Error finding test files:', err);
    return;
  }

  console.log(files);

  const cp = exec(
    `npx rollup --config=rollup.config.js --input=${files[0]} && npx http-server ./ --port=${portCounter} -c-1 -o output/index.html`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`Error executing command for file ${files[0]}:`, err);
        return;
      }
      if (stdout) console.log(`Output for ${files[0]}:\n${stdout}`);
      if (stderr) console.error(`Error output for ${files[0]}:\n${stderr}`);
    }
  );
  cp.on('close', () => console.log(`closed test process of ${files[0]}`));

  process.on('SIGINT', (s) => {
    console.log('get signal: ', s);
    cp.kill('SIGKILL');
    process.exit(0);
  });
  process.on('SIGTERM', (s) => {
    console.log('get signal: ', s);
  });

  //   files.forEach((file) => {
  //     const command = `npx rollup --config=rollup.config.js --input=browser-test/${file} && http-server ./ --port=${portCounter} -c-1 -o output/index.html`;
  //     console.log(`Running test: ${file}`);
  //     exec(command, (err, stdout, stderr) => {
  //       if (err) {
  //         console.error(`Error executing command for file ${file}:`, err);
  //         return;
  //       }
  //       if (stdout) console.log(`Output for ${file}:\n${stdout}`);
  //       if (stderr) console.error(`Error output for ${file}:\n${stderr}`);
  //     });
  //       portCounter++;
  //   });
});

/*
Yes, it is possible! To stop the server from a static HTML file, you can use JavaScript to send a request from the HTML file to the server, and then have the server handle the request by stopping itself. Here’s how you can do it using `express` and `fetch` API:

1. **Set up the server**:
   ```javascript
   const express = require('express');
   const app = express();
   const port = 3000;

   app.use(express.static('path-to-your-directory'));

   const server = app.listen(port, () => {
     console.log(`Server is running on http://localhost:${port}`);
   });

   app.post('/shutdown', (req, res) => {
     res.send('Shutting down...');
     server.close(() => {
       console.log('Server stopped programmatically');
     });
   });
   ```

2. **Create the static HTML file**:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <title>Stop Server</title>
   </head>
   <body>
     <h1>Stop Server</h1>
     <button id="stopServer">Stop Server</button>

     <script>
       document.getElementById('stopServer').addEventListener('click', () => {
         fetch('/shutdown', {
           method: 'POST'
         }).then(response => response.text())
           .then(data => {
             console.log(data);
           }).catch(error => {
             console.error('Error:', error);
           });
       });
     </script>
   </body>
   </html>
   ```

With this setup:
- When you navigate to the HTML file in your browser, you'll see a "Stop Server" button.
- When you click the button, a POST request is sent to the `/shutdown` endpoint on the server.
- The server responds to the request by closing itself.

This solution allows you to stop the server programmatically from within an HTML file. Does this match what you were looking for?

*/
