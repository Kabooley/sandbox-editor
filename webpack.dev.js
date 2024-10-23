const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    static: './dist',
    hot: true,
    port: 8080,
    // allowedHosts: 'auto',
    // codesandboxで動かす都合上以下のhostに設定する
    allowedHosts: 'lpzft6-8080.csb.app',
    // DEBUG:
    // Only for development mode
    headers: {
      'Access-Control-Allow-Origin': '*', // unpkg.com
      // 'Access-Control-Allow-Origin': 'unpkg.com',		// unpkg.com
      'Access-Control-Allow-Headers': '*', // GET
      'Access-Control-Allow-Methods': '*',
    },
    client: {
      overlay: false,
    },
  },
});
