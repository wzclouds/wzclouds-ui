/**
 * 云盘管理系统接口文档地址
 */

import api from '@/api/axiosApi'
const serviceModule = {
  saveSharp: function (data = {}) {
    return api({
      url: '/anno/sharp/save',
      method: 'post'
    }, data)
  },
  updateSharp: function (data = {}) {
    return api({
      url: '/anno/sharp/update',
      method: 'post'
    }, data)
  },
  removeSharp: function (data = {}) {
    return api({
      url: '/anno/sharp/remove',
      method: 'post'
    }, data)
  },
  findSharpByMeetingId: function (data = {}) {
    return api({
      url: '/anno/sharp/findSharpByMeetingId',
      method: 'get'
    }, data)
  },
}
const comApiList = { ...serviceModule }

export default comApiList
