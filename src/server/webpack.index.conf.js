'use strict'
const path = require('path')
const webpackConfig = require('./webpack.config');
const merge = require('webpack-merge')
const webpack = require('webpack')
const config = require('../gui/config')
const utils = require('../gui/build/utils')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const IndexWebpackConfig = merge(webpackConfig, {
  entry: {
    app: './app.js'
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      usePostCSS: true
    })
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: path.resolve(__dirname, './index/index.html'),
      inject: true,
      chunks: ['app'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': '"production"'
    }),
    // copy custom static assets
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../gui/static'),
      to: config.build.assetsSubDirectory,
      ignore: ['.*']
    }])
  ]
})

module.exports = IndexWebpackConfig