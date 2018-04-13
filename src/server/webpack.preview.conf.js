'use strict'
const path = require('path')
const webpackConfig = require('./webpack.config');
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const previewWebpackConfig = merge(webpackConfig, {
  entry: {
    preview: './preview.js'
  },
  output: {
    path: path.resolve(__dirname, './index'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: path.resolve(__dirname, './index/preview.html'),
      inject: true,
      chunks: ['manifest', 'vendor', 'preview'],
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
  ]
})

module.exports = previewWebpackConfig