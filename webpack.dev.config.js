const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: [
        './src/index.ts'
    ],
    devtool: 'inline-source-map',
    target: "node",
    externals: [nodeExternals()],
    output: {
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new NodemonPlugin({ debug: true }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.DEBUG': '*'
        }),
        new CopyWebpackPlugin([{ from: './config/default.json', to: './config' }, { from: './src/swagger/swagger.json' }])
    ],
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    emitErrors: true
                }
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            }
        ]
    }
};