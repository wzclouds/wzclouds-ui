import Vue from 'vue'
import Router from 'vue-router'
import store from '@/view/store'
import Login from './../components/Login'
import Home from './../components/Home'
import MeetingVideo from './../components/MeetingVideo'
import MeetingList from './../components/MeetingList'
import WhiteBoard from './../components/WhiteBoard'
import { Message } from 'view-design';
// 用户中心

Vue.use(Router)

const router = new Router({
  mode: 'hash',
  routes: [
    {
      path: '/login/',
      name: 'Login',
      component: Login
    },
    {
      path: '/home/',
      name: 'Home',
      component: Home
    },
    {
      path: '/home/:meetingId',
      name: 'Home',
      component: Home
    },
    {
      path: '/meetingvideo/',
      name: 'MeetingVideo',
      component: MeetingVideo
    },
    {
      path: '/meetingvideo/:meetingId',
      name: 'MeetingVideo',
      component: MeetingVideo
    },
    {
      path: '/whiteboard/',
      name: 'WhiteBoard',
      component: WhiteBoard
    },
    {
      path: '/whiteboard/:roomId',
      name: 'WhiteBoard',
      component: WhiteBoard
    },
    {
      path: '/meetinglist',
      name: 'MeetingList',
      component: MeetingList
    }
    ]
})

window.hy_auth_login()

router.beforeEach((to, from, next) => {
  // 如果有ticket
  var token = loginController.getRequestParamToken()
  if (token) {
    resetData();
    loginController.getLoginInfo(token, function () {
      router.push({path: to.path})
    }, function (err) {
      Message.error(err.msg);
      loginController.setHisUrl(to.path);
      router.push({name: 'Login', query: {}})
    })
  } else {
    //没有ticket
    if ((!loginController.isLogined() && to.name !== 'Login')) {
      loginController.setHisUrl(to.path);
      router.push({name: 'Login', query: {}})
      // next()
    } else if (to.name !== 'Login') {
      loginController.setHisUrl(to.path);
      next();
    } else {
      next();
    }
  }
})

export default router
