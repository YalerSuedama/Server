const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(baseConfig, {
    plugins: [
        new CopyWebpackPlugin([{ from: './config/mainnet.json', to: '../config/production.json' }]),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false,
                },
                output: {
                    comments: false
                }
            },
            sourceMap: true
        })
    ]
});