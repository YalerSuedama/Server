const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(baseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.ETHEREUM_NODE': JSON.stringify(process.env.TESTRPC_SERVICE_HOST),
        })
    ]
});