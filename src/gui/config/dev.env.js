'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  PAGIUM_DEMO: JSON.stringify(process.env.PAGIUM_DEMO)
})
