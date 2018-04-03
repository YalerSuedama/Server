const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(baseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_CONFIG_ENV': JSON.stringify('kovan'),
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new CopyWebpackPlugin([{ from: './config/kovan.json', to: './config' }]),
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