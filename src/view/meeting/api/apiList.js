/**
 * 云盘管理系统接口文档地址
 */

import api from '@/api/axiosApi'
const serviceModule = {
  loginAccount: function (data = {}) {
    return api({
      url: '/login/login',
      method: 'get'
    }, data)
  },
  pageMeetingListByUser: function (data = {}) {
    return api({
      url: '/meeting/pageMeetingListByUser',
      method: 'post'
    }, data)
  },
  saveMeeting: function (data = {}) {
    return api({
      url: '/meeting/saveMeeting',
      method: 'post'
    }, data)
  },
  updateMeeting: function (data = {}) {
    return api({
      url: '/meeting/updateMeeting',
      method: 'post'
    }, data)
  },
  deleteMeeting: function (data = {}) {
    return api({
      url: '/meeting/deleteMeeting',
      method: 'get'
    }, data)
  }
}
const comApiList = { ...serviceModule }

export default comApiList
