const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: [
        './src/index.ts'
    ],
    target: "node",
    externals: [nodeExternals()],
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.GOOGLE_APPLICATION_CREDENTIALS': JSON.stringify(__dirname + "/config/datastore-key.json"),
            'process.env.ETHEREUM_NODE': JSON.stringify('localhost'),
            'process.env.DEBUG': '*'
        }),
        new CopyWebpackPlugin([{ from: './config/default.json', to: './config' }, { from: './src/server/swagger/swagger.json' }])
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