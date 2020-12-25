/**
 * 共用接口文档地址
 * author：liuguangrui
 */
import api from '@/api/axiosApi'
const serviceModule = {
  uploadExtImg: function (data) {
    return api({
      url: "/anno/uploadExtImg",
      method: "post",
      contentType: "application/x-www-form-urlencoded; charset=UTF-8"
    }, data)
  },
  uploadBiz: function (data) {
    return api({
      url: "/bizFile/uploadBizs",
      method: "post",
      contentType: "application/x-www-form-urlencoded; charset=UTF-8"
    }, data)
  },
  pageBizFile: function (data) {
    return api({
      url: "/bizFile/pageBizFile",
      method: "post"
    }, data)
  },
  removeFiles: function (data) {
    return api({
      url: "/bizFile/removeFiles",
      method: "get"
    }, data)
  },
  downLoad: function (data) {
    return api({
      url: "/bizFile/downLoad",
      'Content-Type':"application/json;charset=UTF-8",
      method: "get"
    }, data)
  },
  updatePassword: function (data) {
    return api({
      url: "/user/updatePassword",
      method: "post"
    }, data)
  },
}
const comApiList = { ...serviceModule }

export default comApiList
