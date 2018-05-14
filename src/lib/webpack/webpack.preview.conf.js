'use strict'
const path = require('path')
const webpackConfig = require('./webpack.config');
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const utils = require('./utils')
const config = require('./config')

const previewWebpackConfig = merge(webpackConfig, {
  entry: {
    preview: '../../gui/preview.js'
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
      filename: path.resolve(__dirname, '../dist/preview.html'),
      inject: true,
      chunks: ['preview'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    })
  ]
})

module.exports = previewWebpackConfig