// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import meetingApp from './meetingApp'
import router from '../meeting/router'
import store from './../store'
import iview from 'view-design';
import 'view-design/dist/styles/iview.css'; // 使用iview样式
import '@/assets/css/default_login.css'// 使用登录样式
import '@/assets/css/styles_login.css'// 使用登录样式
import '@/assets/css/iconfont.css'// 使用全局样式
import echarts from 'echarts'
import hyTable from '@/components/hengyun/table/'
import '@/assets/css/com.css' // 使用全局样式
import '@/assets/css/chunk.css' // 使用白板样式
import '@/assets/font/utils-font.css' // 使用白板图标
import '@/assets/font/aliico/iconfont.css' // 使用阿里图标库
import '@/assets/font/aliico/iconfont.js' // 使用阿里图标库
// import 'element-ui/lib/theme-chalk/index.css' //导入样式
import VueAwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.css'
import VueContextMenu from 'vue-contextmenu'
Vue.use(VueContextMenu)

Vue.use(VueAwesomeSwiper)

// Vue.use(ElementUI)
Vue.use(iview)
Vue.use(hyTable)
Vue.prototype.$echarts = echarts
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#meeting',
  router,
  store,
  components: { meetingApp },
  template: '<meetingApp/>'
})
