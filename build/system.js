var staticType = 'meeting-'
var nginxPrefix = '/wzclouds/'
module.exports = {
  // 此处是开发的项目的头路由，由nginx转发，最后访问的html的地址将变为http://localhost:8080/nginxPrefix/file/index.html
  nginxPrefix: nginxPrefix,
  // 静态资源最后打包的文件夹名称，也就是static文件夹下的文件最后打包的文件夹名称，默认 项目名称-static
  assetsSubDirectory: nginxPrefix.substring(1) + staticType + 'static',
  // 配置代理，便于本地开发过程中可以连到任意的地址进行调试，可以按照规则配置多个代理地址
  proxyTable: {
    '/api': {
      target: 'https://127.0.0.1',
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      }
    }
  }
}
