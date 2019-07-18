var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
var path = require('path');
var publicPath = 'http://localhost:3009/dist/';
//var publicPath = 'http://192.168.0.118:3009/dist/';
var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';

module.exports = {
    //插件�?
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    //页面入口文件配置
    entry: {
        init : ['./src/init.js',hotMiddlewareScript]
    },
    //入口文件输出配置
    output: {
        filename: '[name].js',
       // path: path.resolve(__dirname, 'dist'),
        path: path.resolve('./dist/'),
        publicPath: publicPath
    },
    module: {
        //加载器配�?
        loaders: [
            {  test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                } },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    //其它解决方案配置
    resolve: {
        alias: {
            'vue':'vue/dist/vue.js',
            AppStore : 'js/stores/AppStores.js',
            ActionType : 'js/actions/ActionType.js',
            AppAction : 'js/actions/AppAction.js'
        }
    }
};