/* eslint-disable */
import loginConfig from './config.js'
import store from '@/view/store'

window.hy_auth_login = function (){
  var loginController = {};
  // if(!loginConfig){
  //   console.log("请加载登录配置信息")
  //   return ;
  // }
  loginController.isLogined = function (){
    var token = loginController.getUserToken();
    return token ? true : false;
  }
  /**
   * 获取当前项目的登录人信息（包含了token，用户名，用户id。）
   * 因为系统内部包含了多个平台，而且每个平台的token都是不一样的，故登录人信息是和平台绑定的，
   * 一个平台一个登录人信息，各自是隔离开的。
   */
  loginController.getLoginUserInfo = function (){

    //开发测试用
    var loginInfo = window.localStorage.getItem(this.getContentPath()+"_token");
    if(loginInfo){
      return eval("("+loginInfo+")");
    }
    return null;
  }

  loginController.setLoginUserInfo = function(user){
    if (user) {
      window.localStorage.setItem(this.getContentPath()+"_token",  JSON.stringify(user));
    }

    store.commit('GETUSERINFO');

  }
  loginController.emptyLoginUserInfo = function(){

    delete window.localStorage[this.getContentPath()+"_token"];
    store.commit('RESTUSERINFO');
  }

  loginController.removeItem = function(data) {
    var user = this.getLoginUserInfo();
    for(var key in data){
      user[data[key]] = null;
    }
    window.localStorage.setItem(this.getContentPath()+"_token",  JSON.stringify(user));
  }

  loginController.removeBeforeUrl = function() {
    window.localStorage.removeItem(loginController.getContentPath() + "login_before_targte_url")
  }
  /**
   * 完整的登录流程，集成了单点登录。在未登录的情况之下，请调用此方法来进行登录。
   * 在已经登录的情况之下，将不会做任何事，直接返回了。
   *
   */
  // loginController.loginFlow = function(){
  //   if(this.isLogined()){
  //     //已经登录了   不需要登录
  //     return ;
  //   }
  //   //在登录成功后，回调时会传入token
  //   var token = this.getRequestParamToken();
  //   if(token){
  //     //若有token，表示用户登录了，需要通过token去换取用户登录信息
  //     this.getLoginInfo(token);
  //   }else{
  //     //记录执行登录前的请求地址
  //     window.localStorage.setItem(this.getContentPath()+"login_before_targte_url",location.href);
  //     //去执行登录
  //     this.toLogin();
  //   }
  // }

  // loginController.toLogin = function(){
  //   // 暂时取消判断登陆
  //   location.href = this.getLoginUrl();
  // }

  // loginController.getLoginUrl = function (){
  //   var loginUrl = loginConfig.sso_login_url;
  //   return loginUrl;
  // }

  loginController.setHisUrl = function (route) {
    window.localStorage.setItem(this.getContentPath()+"login_before_targte_url", route)
  }

  loginController.getHisUrl = function (){
    return window.localStorage.getItem(loginController.getContentPath() + "login_before_targte_url")
  }

  loginController.getRequestParamToken = function(){
    return loginController.GetQueryString("ticket");
  }


  //根据参数部分和参数名来获取参数值
  loginController.GetQueryString = function(n) {
      var u = self.location.href
      {
          var s = u
          if (s == null) s = self.location.href
          if (n) {
              var g = new RegExp('(\\?|&)' + n + '=([^&|#]*)')
              var r = s.match(g)
              if (r) {
                  try {
                      return decodeURIComponent(r[2])
                  } catch (err) {
                      return unescape(r[2])
                  }
              } else return null
          } else {
              var i = s.indexOf('?')
              if (i === -1) return null
              return s.substr(i + 1)
          }
      }
  }
  /**
   * 获取用户级token
   */
  loginController.getUserToken = function (){

    var loginUserInfo = this.getLoginUserInfo();
    return loginUserInfo && loginUserInfo.token;
  }
  /**
   * 获取登录人的名字
   */
  loginController.getUserName = function (){

    var loginUserInfo = this.getLoginUserInfo();
    return loginUserInfo && loginUserInfo.name;
  }
  /**
   * 获取登录人的id
   */
  loginController.getUserId = function (){

    var loginUserInfo = this.getLoginUserInfo();
    return loginUserInfo && loginUserInfo.userid;
  }

  /**
   * 获取会议的id
   */
  loginController.getMeetingId = function (){

    var loginUserInfo = this.getLoginUserInfo();
    return loginUserInfo && loginUserInfo.meetingId;
  }
  /**
   * 获取登录人的账号
   */
  loginController.getUserAccount = function (){

    var loginUserInfo = this.getLoginUserInfo();
    return loginUserInfo && loginUserInfo.account;
  }

  loginController.getLoginInfo = function (token, success, fail){
    if (token) {
      token = "?ticket=Bearer " + token
    } else {
      token = ""
    }
    $.ajax({
      url: loginConfig.sso_validate_url + token,
      type:"get",
      dataType:"json",
      async: false,
      success:function (r){
        window.location.href = window.location.href.split('?')[0]
        if(r && r.isSuccess) {
          var r = r.data
          loginController.setLoginUserInfo(r);
          var login_before_targte_url = loginController.getHisUrl();
          success(login_before_targte_url || "/home");
          // base_vm.connectionSocket();
        } else{
          fail(r);
          // loginController.toLogin();
        }
      }
    });
  }

  /**
   * 获取contentPath。
   * 列如：http://139.159.241.21:10086/cloud-security/#/interfacePermission
   * contenPath： cloud-security
   */
  loginController.getContentPath = function (){

    return window.location.pathname.split('/')[2];
  }
  window.loginController = loginController;

  /**
   * 因为localStorage可以跨多个窗口共享数据，而sessionStorage是单窗口共享数据。
   * 而localStorage是关闭浏览器依然存在，不会被删除的。
   * 而sessionStorage是关闭浏览器就消除了的。
   * 故我这里间接的实现localStorage在关闭浏览器后失效的功能。
   *
   */
  (function (){

  //   function BrowserIsReopen(){

  //     return document.cookie.indexOf("rsdf125w5s21d1_3g5v3b9t9y5f") < 0;
  //   }

  //   function FlagBrowserNotIsReopen(){
  //     document.cookie = "rsdf125w5s21d1_3g5v3b9t9y5f=0;path=/;";
  //   }

  //   var browserIsReopen = BrowserIsReopen();
  //   if(browserIsReopen){
  //     window.localStorage.clear();
  //     FlagBrowserNotIsReopen();
  //   }
  })()

  //暂时取消登录,用默认用户
  // var token = loginController.getRequestParamToken()
  // if (token) {
  //   debugger
  //   loginController.getLoginInfo()
  // }

  // loginController.setLoginUserInfo()
}
