<template>
    <div>
        <div class="wrapper">
            <hengyun-sidebar v-on:changeRightBox="changeRightBox" :menus="$store.state.menus"/>
            <div :class="rightBoxClasses"> 
                <hengyun-header v-on:showMenu="showMenu" :title="{chinese: '远程交流系统', english: 'Privilege management system'}" />
            </div>
        </div>
        <div class="footer">
            <div class="footer-copyright"><p style="text-align: center;">Copyright © 2020 xxxx有限公司 | <a href="http://www.baidu.com" target="_blank">ICP备xxx号</a></p></div>
        </div>
    </div>
</template>

<script>
  import 'swiper/dist/css/swiper.css'
  import siderBar from '@/components/hengyun/sideBar'
  import header from '@/components/hengyun/header'

  export default {
    components: {
      'hengyun-sidebar': siderBar,
      'hengyun-header': header
    },
    computed: {
      rightBoxClasses: function () {
        let className = this.rightBoxClass ? 'right-box-in' : 'right-box-out'
        return className
      },
    }, 
    data() {
      const  vm = this
      return {
        isShowMenu: false,
        rightBoxClass: false
      }
    },
    methods: {
        showMenu () {
            this.isShowMenu = !this.isShowMenu
        },
        changeRightBox (bool) {
            this.rightBoxClass = bool
        },
        closeMask() {
            this.$store.state.isShowMask = false;
        },
        openMask() {
            this.$store.state.isShowMask = true;
        }
    }
}

</script>
<style>
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .demo-spin-col{
        height: 100px;
        position: relative;
        border: 1px solid #eee;
    }
</style>