function getServerInfoConfig () {
  var con = {}
  // var con = {
  //   sso_ip: '192.168.1.124',
  //   sso_port: '11011'
  // }
  // var host = window.location.host
  // if (host.indexOf('192') === -1 && host.indexOf('localhost') === -1 && host.indexOf('127') === -1) {
    con.sso_ip = window.location.hostname
    con.sso_port = window.location.port
  // }
  return con
}

const serverInfoConfig = getServerInfoConfig()
const loginConfig = {
  sso_login_url: `https://${serverInfoConfig.sso_ip}:${serverInfoConfig.sso_port}/${process.env.PLATFORM}/meeting#/Login`,          //登录
  sso_validate_url: `https://${serverInfoConfig.sso_ip}:${serverInfoConfig.sso_port}${process.env.BASE_API}/login/validate`,//验证
  sso_logout_url: `https://${serverInfoConfig.sso_ip}:${serverInfoConfig.sso_port}/${process.env.PLATFORM.toLowerCase()}-center/prepare/logout`, //退出
  center_index_url: `https://${serverInfoConfig.sso_ip}:${serverInfoConfig.sso_port}/${process.env.PLATFORM}/meeting/#/home`,                               //首页
  dist_local_service_url: `${process.env.SYSTEM_APP.toLowerCase()}/index.html`,
  "dist_appKey": 'XzN9V8tQjanJ8vtCturrfFZitNtmv8TenkbzpNRotSfpD9RVkz00e'
}

export default loginConfig
