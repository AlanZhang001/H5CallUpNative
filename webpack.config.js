var path = require('path');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
    var isProdEnv = env && env.prod;
    return {
        entry: {
            index: './src/index.js'
        },
        resolve: {
            modules: [
                './src',
                'node_modules'
            ]
        },
        devtool: isProdEnv ? 'hidden-source-map' : 'source-map',
        plugins: isProdEnv ? [
            new UglifyJsPlugin({
                parallel: true,
                cache: path.resolve(__dirname, './.tmp/jscache2'),
                uglifyOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            })
        ] : undefined,
        output: {
            path: path.resolve(__dirname, './'),
            filename: '[name].js',
            pathinfo: isProdEnv ? false : true
        }
    }
};
