const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');

const webpack = require('webpack');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(baseConfig, {
    devtool: 'inline-source-map',
    output: {
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    },
    plugins: [
        new NodemonPlugin({ nodeArgs: ['--inspect=5858'] }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        })
    ]
});