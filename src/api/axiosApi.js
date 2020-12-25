/**
 * axiosApi封装，接口属于mock，可以修改
 * author：liuguangrui
 */
/* eslint-disable */
// import qs from 'qs'
import store from '@/view/store'
import '@static/login'

// const token = JSON.parse(localStorage['cloud-authority_token']).token
//请求拦截器配置
axios.interceptors.request.use(config => {
  Object.keys(apiMap).forEach(function (key) {
    var a = apiMap[key].httpDefaultOpts.url.split('?')[0]
    var b = (process.env.BASE_API + config.url).split('?')[0]
    if ( a === b){
      config.source.cancel()
      return new Promise((resolve, reject) => {
              setTimeout(() => {
              resolve({
                data: {
                  errcode: -1,
                  data: null,
                  errmsg: '不能重复提交'
                }
              })
            }, 100)
          })
    }
  })
  initTime(config)
  return config
}, error => {
  return Promise.reject(error)
})
// 返回拦截器配置
axios.interceptors.response.use(response => {
  if(response.data.errcode == '-9999'){//已退出登陆
    loginController.emptyLoginUserInfo();
    loginController.loginFlow();
}
if(response.data && response.data.data && response.data.data.total){
  response.data.data.total = Number(response.data.data.total);
}
return response
}, error => {
  return Promise.resolve(error.response)
})

/*调用等待处理 start*/

var apiMap = {}
// 等待对象
var timeController

/**
 * uuid
 * @returns {string}
 */
function getUuid() {
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function S4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

/**
 * 开启等待,启用遮罩
 * @param id
 */
function times (){
  if (Object.keys(apiMap).length > 0){
    store.state.isShowMask = true
  }
}

/**
 * 等待请求列表, 空则关闭遮罩
 * @param id
 */
function addTime(httpDefaultOpts) {
  let id = httpDefaultOpts.id
  if (apiMap[id]){
    delete eval(apiMap)[id]
    if (Object.keys(apiMap).length === 0) {
      store.state.isShowMask = false
      window.clearInterval(timeController)
    }
  } else {
    if (httpDefaultOpts.url && isReSubApi(httpDefaultOpts.url)){
      httpDefaultOpts.isSubAllowed = false
    }
    apiMap[id] = {httpDefaultOpts: httpDefaultOpts}
  }
}

// /**
//  * 该api是否存在重复提交情况
//  * @param url
//  * @returns {*}
//  */
// function hasSubApi(url) {
//   return isReSubApi(url) && apisTemp.has(url)
// }

/**
 * 是否为禁止重复提交的api
 * @param url
 * @returns {boolean}
 */
function isReSubApi(url){
  return url.indexOf('save') != -1 || url.indexOf('update') != -1 || url.indexOf('delete') != -1 || url.indexOf('remove') != -1
}

/**
 * 有新接口调用,刷新等待请求
 * @param id
 */
function initTime(httpDefaultOpts) {
  addTime(httpDefaultOpts)
  window.clearInterval(timeController)
  timeController = window.setInterval(times, 500);
}
/*调用等待处理 end*/

function errorState(response) {
  //加入loading
  // 如果http状态码正常，则直接返回数据
  if (!response.data){
    store.state.alertText = '网络异常，请检查网络后重试！';
    store.state.isAlert = true;
    return
  }
  if (response && response.data.errcode == 0) {
    return response
    // token过期失效码，重新向安卓请求
  } else if (response && (response.data["errcode"] == 40001 || response.data["errcode"] == 40003 || response.data["errcode"] == 40005)) {
    store.commit('GETUSERINFO');//重新获取userId和token
    store.state.alertText = response.data.msg;
    store.state.isAlert = true;
  } else {
    store.state.alertText = res.data.msg || '网络异常，请检查网络后重试！';
    store.state.isAlert = true;
  }

}
// 成功后返回
function successState(res) {
  //加入loading
  //统一判断后端返回的错误码
  if (res && res.data.errcode != 0 && res.data.errcode != '0') {
    store.state.alertText = res.data.msg || '网络异常，请检查网络后重试！';
    store.state.isAlert = true;
    return res
  } else if (!res){
    return {data:{errcode: '-1', errmsg: '网络异常，请重试！'} }
  } else {
    return res
  }
}

// 中断所有等待请求
const httpServerCancel = ()  => {
  Object.keys(apiMap).forEach(function (key) {
    apiMap[key].httpDefaultOpts.source.cancel('请求已取消！')
  });
}

// 重新发起所有等待请求
// const httpServerRe = () => {
//   Object.keys(apiMap).forEach(function (key) {
//     // apiMap[key].httpDefaultOpts.isReTag = true
//     apiMap[key].httpDefaultOpts.source.cancel()
//     top.location.reload()
//   });
// }

// http请求
const httpServer = (opts, data) => {
  // 判断是否重复提交
  var userInfo = loginController.getLoginUserInfo();
  // userInfo.userId = userInfo.userid;
  let HYtimestamp = (new Date()).getTime();
  let Public = { //公共参数
    'HYtimestamp': HYtimestamp
    // userId: userInfo.userId,
    // token: userInfo.token,
    // unitId: userInfo.unitId
  }
//  store.dispatch('openLoading')
  // store.dispatch('openLoading');
  var CancelToken = axios.CancelToken;
  var source = CancelToken.source();
  let httpDefaultOpts = { //http默认配置
    method: opts.method,
    cancelToken: source.token,
    baseURL: process.env.BASE_API,
    url: opts.url,
    timeout: 15000,
    params: Object.assign(Public, data),
    data: Object.assign(Public, data),
    headers: opts.method == 'get' ? { //配置请求头数据
      'X-Requested-With': 'XMLHttpRequest',
      "Accept": "application/json",
      "Content-Type": "application/json; charset=UTF-8",
      "token": userInfo ? userInfo.token : '',
      responseType: "blob",
      // "user-token": userInfo.token
      // "token": constant.token,
      // "user-token": constant.userToken
    } : {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': opts.contentType || 'application/json',
      "token": userInfo ? userInfo.token : '',
      // "user-token": userInfo.token
      // "token": constant.token,
      // "user-token": constant.userToken
    }
  }
  if (opts.contentType === 'application/x-www-form-urlencoded; charset=UTF-8') {
    httpDefaultOpts.data = data;
  }
  // 转为formdata
  // if (opts.contentType === 'application/x-www-form-urlencoded; charset=UTF-8') {
  //   httpDefaultOpts.transformRequest = [function (data) {
  //     let ret = []
  //     for (let prop in data) {
  //       if (Array.isArray(data[prop])) {
  //         data[prop].map(p => {
  //           ret.push(`${encodeURIComponent(prop)}[]=${encodeURIComponent(p)}`)
  //       })
  //       } else {
  //         ret.push(`${encodeURIComponent(prop)}=${encodeURIComponent(data[prop])}`)
  //       }
  //     }
  //     return ret.join('&')
  //   }]
  // }
  //
  if (opts.method == 'get' || opts.method == 'delete') {
    delete httpDefaultOpts.data
  } else {
    httpDefaultOpts.url = httpDefaultOpts.url + '?HYtimestamp=' + HYtimestamp
    if (opts.contentType && opts.contentType !== 'application/x-www-form-urlencoded; charset=UTF-8'){ // 判断post请求条件下是否有特殊设置
      delete httpDefaultOpts.data
    }else{
      delete httpDefaultOpts.params
    }
  }
  httpDefaultOpts.source = source
  httpDefaultOpts.id = getUuid()
  // 加入接口等待列表
  let promise = getPromise(httpDefaultOpts)
  return promise
}

function getPromise(httpDefaultOpts) {
  return new Promise((resolve, reject) => {
    axios(httpDefaultOpts).then(res => {
        addTime(httpDefaultOpts)
        if (res && res.data.isSuccess) {
          res = successState(res)
          resolve(res)
        } else {
          if (res.data.code === 40011){
            loginOut('登录超时,请重新登录!')
          } if (res.data.code === 40015){
            loginOut('登录信息错误,请重新登录!')
          } else {
            res = successState(res)
            resolve(res)
          }
        }
    }).catch(response => {
      base_vm.$Message.error("访问超时!");
    })
  })
}

export default httpServer
export { httpServerCancel, httpServerRe}
