/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import comApiList from '@/api/comApiList'
import api from '@/api/axiosApi'
import urlConfig from '../../../static/login/config'
Vue.use(Vuex)

const platform = process.env.PLATFORM

const store = new Vuex.Store({
  state: {
    authButton: [],
    menus: [],
    parse: '',
    formData: {},
    tags: {
      isMeetingManager: false
    },
    meetingManagerUserId: null,
    formItemType: 0,
    isShowMask: false,
    logoutUrl: urlConfig.sso_logout_url, // 退出登陆链接
    indexUrl: urlConfig.center_index_url, // 首页链接
    userInfo: {},
    rtc: null,
    socketTag: false,
    meetingInfo: {
      meetingName: "欢迎使用系统",
      desc: "请加入一个房间开始体验",
    },
    eleData: {
      userId: '',
      userName: '',
      otherPhone: '',
      meetingId: '',
      password: '',
      talkType: 'hall',
      sendMessage: '',
      token: '',
      videolist: []
    }
  },
  mutations: {
    GETUSERINFO (state) {
      // 解析所有的token到此store下面。
      state.userInfo = loginController.getLoginUserInfo()

      state.userInfo.userId = state.userInfo.userid
    },
    RESTUSERINFO (state) {
      // 解析所有的token到此store下面。

      state.userInfo.userId = {}
    },
    GETAUTHBUTTON (state, params) {
      state.authButton = params
    }
  },
  actions: {
    getAuthButton ({ commit, state }, resourceId) { // 获取后端权限接口数据
      var arr = []
      if (loginController.isLogined()) {
        api(comApiList.getOperateButton, {
          resourceId: resourceId,
          userId: state.userInfo.userId // 本地测试
        }).then((res) => {
          if (res.data.errcode == 0) {
            res.data.data.forEach(function (item) {
              arr.push(item.code)
            })
            commit('GETAUTHBUTTON', arr)
          } else {
            console.log(res.data.errmsg)
          }
        })
      }
    },
    setTag({ commit, state }, {tag, value}) {
      state.tags[tag] = value;
    }
  },
  modules: {}
})

export default store
