'use strict'
const path = require('path')
const utils = require('./utils')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const merge = require('webpack-merge')
const config = require('../config')

function resolve(dir) {
  return path.join(__dirname, '../../../', dir)
}

let webpackConfig = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './App/app.js',
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ?
      config.build.assetsPublicPath :
      config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  plugins:[
    new VueLoaderPlugin()
  ]
}

if(!process.env.PAGIUM_DEMO){
  webpackConfig = merge(webpackConfig, {
    entry: {
      preview: './preview.js'
    },  
    plugins: [
      new HtmlWebpackPlugin({
        title: 'vue-pagium',
        filename: 'index.html',
        template: 'index.html',
        chunks: ['vendors~app~preview', 'vendors~app', 'app']
      }),
      new HtmlWebpackPlugin({
        title: 'vue-pagium preview',
        filename: 'preview.html',
        template: 'index.html',
        chunks: ['vendors~app~preview', 'vendors~preview', 'preview']
      })
    ]
  })
}else{
  webpackConfig = merge(webpackConfig, {
    plugins: [
      new HtmlWebpackPlugin({
        title: 'vue-pagium demo',
        filename: 'index.html',
        template: 'index.html',
        chunks:['vendors~app', 'app']
      })
    ]
  })
}

module.exports = webpackConfig;