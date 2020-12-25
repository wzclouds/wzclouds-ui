'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const system = require('./../build/system')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // BASE_API: '\'' + system.proxyTable['/api']['pathRewrite']['^/api'] + '\'',
  BASE_API: '"/api/online"',
  PLATFORM: '"wzclouds"',
  NGINX_PREFIX: '\'' + system.nginxPrefix + '\'',
  SYSTEM_STATIC: '\'/' + system.assetsSubDirectory + '\'',
  SYSTEM_APP: '"meeting"'
})
