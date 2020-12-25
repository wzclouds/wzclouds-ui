'use strict'
const system = require('./../build/system')
module.exports = {
  NODE_ENV: '"production"',
  // BASE_API: '\'' + system.proxyTable['/api']['pathRewrite']['^/api'] + '\'',
  BASE_API: '"/api/online"',
  PLATFORM: '"wzclouds"',
  NGINX_PREFIX: '\'' + system.nginxPrefix + '\'',
  SYSTEM_STATIC: '\'/' + system.assetsSubDirectory + '\'',
  SYSTEM_APP: '"meeting"'
}
