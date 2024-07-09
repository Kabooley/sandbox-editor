const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
});
