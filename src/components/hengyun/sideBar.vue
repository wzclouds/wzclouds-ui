<template>
  <!-- <Sider ref="side1" hide-trigger collapsible :collapsed-width="70" width="220" v-model="isCollapsed"> -->
    <Menu
      class="menu wrapper-sidbar"
      :class="menuitemClasses"
      :style="{width: (!shrink?'15%':'30px') }"
      style="float:left;"
      theme="dark"
      >
      <menu-item name="-1" class="text-center" disabled @click.native="collapsedSider">
        <Icon :class="rotateIcon" type="ios-arrow-back" size="24"></Icon>
        <p v-if="!shrink" class="title-font">远程交流系统</p>
      </menu-item>
      <template v-for="(menu, index) in menus">
        <div :key="`m${index}`" v-show="!shrink">
          <menu-item :name="menu.link" v-if="!menu.subMenu" :key="index" @click.native="goTo(menu)">
            <Icon :type="menu.iconOutline" size="25"/>
            <span>{{menu.name}}</span>
          </menu-item>
          <Submenu :name="`${index}`" v-else>
            <template slot="title">
              <Icon :type="menu.iconOutline" size="25" style="margin-top:-2px;"/>
              <span v-if="menu.node == 1 || menu.node == 3">{{menu.name}} ({{menu.subMenu.length}}人)</span>
              <span v-if="menu.node == 2">{{menu.name}} ({{menu.subMenu.length}}个)</span>
            </template>
            <menu-item v-if="menu.node == 1" v-for="subMenu in menu.subMenu" @contextmenu.native="contextmenu(subMenu)" :key="subMenu.userId"   @click.native="goTo(subMenu)" :name="subMenu.userId" class="child-block">
              <img class="img" :src="subMenu.userPhoto" @error="imgError()">
              <span class="span" style="width: auto">{{subMenu.userName || subMenu.userId}}<Icon @click="joinMeetingNotic(subMenu)" type="md-add-circle" style="color: #f90;;margin-left: 5px;font-size: 25px;" title="邀请加入"/></span>
            </menu-item>
            <menu-item v-if="menu.node == 2" v-for="subMenu in menu.subMenu" @contextmenu.native="contextmenu(subMenu)" :key="subMenu.meeting.meetingId"   @click.native="goTo(subMenu)" :name="subMenu.meeting.meetingId" class="child-block">
              <span class="span"><span class="ivu-tag-success ivu-tag-dot-inner"></span>
              <span style="width: auto" :title="(subMenu.meeting.meetingName || subMenu.meeting.meetingId) + '(' + subMenu.length + '人)'" >{{subMenu.meeting.meetingName || subMenu.meeting.meetingId}} ({{subMenu.length}}人)</span>
              <Icon @click="joinMeeting(subMenu)" type="ios-arrow-dropright-circle" style="color: #67c23a;margin-left: 5px;font-size: 25px;" title="进入会议"/>
            </span>
              
            </menu-item>

            <menu-item v-if="menu.node == 3" v-for="subMenu in menu.subMenu" @contextmenu.native="contextmenu(subMenu)" :key="subMenu.userId"   @click.native="goTo(subMenu)" :name="subMenu.userId" class="child-block">
              <img class="img" :src="subMenu.userPhoto" @error="imgError()">
              <span class="span" style="width: auto">{{subMenu.userName || subMenu.userId}}
                <Icon v-if="$store.state.tags.isMeetingManager" @click="reject(subMenu)" type="ios-close-circle" style="color: #ed4014;margin-left: 5px;font-size: 25px;" title="请出会议"/></span>
            </menu-item>
          </Submenu>
        </div>
        <div style="text-align: center; color: #f90;;" :key="`div${index}`" v-show="shrink">
          <Dropdown transfer v-if="!menu.subMenu" placement="right-start" :key="`drop${index}`" @on-click="goTo(menu)">
            <div class="dropDownItem drop-node" @click="goTo(menu)">
              <Icon :type="menu.icon || menu.iconOutline" style="color: rgba(0, 0, 0, 0.6)"/>
            </div>
            <DropdownMenu style="width: 200px;" slot="list">
              <DropdownItem :name="menu.name" :key="`d${index}`"><i class="icomoon" :class="menu.icon" v-if="menu.icon"></i><span style="padding-left:10px;">{{menu.name}}</span></DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown transfer v-else placement="right-start" :key="`drop${index}`" @on-click="changeMenu">
            <div class="dropDownItem drop-node">
              <Icon :type="menu.icon || menu.iconOutline" style="color: rgba(0, 0, 0, 0.6)"/>
            </div>
            <DropdownMenu style="width: 200px;" slot="list">
              <template v-for="subMenu in menu.subMenu">
                <DropdownItem v-if="menu.node == 1" 
                              :name="subMenu.link" 
                              :key="subMenu.link"
                              @contextmenu.native="contextmenu(subMenu)" 
                              @click.native="goTo(subMenu)">
                  <span style="padding-left:10px;">{{subMenu.userName}}</span>
                </DropdownItem>
                <DropdownItem v-if="menu.node == 2" 
                              :name="subMenu.link"
                              :key="subMenu.link"
                              @contextmenu.native="contextmenu(subMenu)" 
                              @click.native="goTo(subMenu)">
                  <span style="padding-left:10px;">房间-{{subMenu.meeting.meetingName || subMenu.meeting.meetingId}} ({{subMenu.length}}人)</span>
                </DropdownItem>
              </template>
            </DropdownMenu>
          </Dropdown>
        </div>
      </template>

      <Dropdown
        transfer
        placement="right-start"
        trigger="custom"
        ref="contextMenu"
        :visible="currentVisible"
        @on-clickoutside="handleCancel"
        @on-click="joinMeetingNotic"
      >
        <DropdownMenu slot="list" class="Dropdown">
          <DropdownItem name="invitation" v-if="invitation">邀请加入会议</DropdownItem>
          <DropdownItem name="whisper" v-if="false">悄悄话</DropdownItem>
          <DropdownItem name="joinAction" v-if="joinAction">加入房间</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Modal v-model="createMeetingModal" draggable title="创建会议室" style="text-align: center;">
      会议室编号:
        <Input v-model="meetingId" disabled type="text" style="width: 40%"/>
        <Button class="modalBtn" type="info" icon="md-copy" @click="copy" style="margin-left: 15px;" size="default">复制会议链接</Button>
        <div slot="footer">
          <Button class="modalBtn" type="default" @click="close" size="large">关闭</Button>
          <Button class="modalBtn" type="primary" @click="createMeeting" size="large">确定</Button>
        </div>
      </Modal>
    </Menu>
  <!-- </Sider> -->
</template>
<script>
export default {
  props: {
    menus: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      invitation: false,
      whisper: false,
      joinAction: false,
      isCollapsed: false,
      url: '',
      route: '',
      shrink: false,
      posX: 0,
      posY: 0,
      currentVisible: false,
      locator: null,
      targetClient: null,
      createMeetingModal: false,
      meetingId: ''
    }
  },
  inject: ['reload'],
  computed: {
    locatorStyle () {
      return {
        position: 'absolute',
        left: `${this.posX + 80}px`,
        top: `${this.posY}px`
      }
    },
    // activeName () {
    //   if (this.$route.path) { // 判断url是否存在地址跳转
    //     return this.$route.path
    //   }
    //   if (this.menus.length > 0 && this.menus[0].subMenu) {
    //     return '/home'
    //   }
    //   return '/home'
    // },
    rotateIcon () {
      return [
        'menu-icon',
        this.shrink ? 'rotate-icon' : ''
      ]
    },
    menuitemClasses () {
      return [
        'menu-item',
        this.shrink ? 'collapsed-menu' : 'item-menu' + ' opacity-bar'
      ]
    }
  },
  watch: {
    '$route': function (route) {
      this.route = route.name
    }
  },
  mounted () {
    // document.addEventListener('contextmenu', this.handleContextmenu, true)
    // document.addEventListener('mouseup', this.handleContextmenu, true)
  },
  destroyed () {
    // document.removeEventListener('contextmenu', this.handleContextmenu, true)
    // document.removeEventListener('mouseup', this.handleContextmenu, true)
  },
  methods: {
    createMeeting () {
      const vm = this;

      var reg = /^[1-9]\d*|0$/;
      if(reg.test(vm.meetingId)) {
        if (vm.meetingId > 16000000000) {
          vm.$Message.info('会议室编号太长！')
          return
        }
        vm.$Modal.confirm({
          title: '提示',
          content: '您确定创建该临时会议并加入？',
          onOk: () => {
            jumpMeeting(vm.meetingId);
          }
        })
      } else {
        vm.$Message.info('加入会议室有误!')
      }
      
    },
    close (){
      const vm = this
      vm.createMeetingModal = false
    },
    imgError() {
      let img = event.srcElement;
       img.src = require('@static/lib/img/39.png');
       img.onerror = null; //防止闪图
    },
    contextmenu(subMenu){
      // if (subMenu.meetingId) {
      //   this.setMeetingClients();
      // } else {
      //   this.setHallClients();
      // }
      // if (subMenu.type && subMenu.type == 'serverMeetingStatistics') {
      //   this.setServerMeetingStatistics();
      // }

      // this.handleCancel();
      // this.createLocator();
      // this.targetClient = subMenu;
    },
    setMeetingClients () {
      this.invitation = false;
      this.joinAction = false;
      this.whisper = true;
    },
    setHallClients () {
      this.joinAction = false;
      this.invitation = true;
      this.whisper = true;
    },
    setServerMeetingStatistics () {
      this.invitation = false;
      this.whisper = false;
      this.joinAction = true;
    },
    createLocator () {
      // 获取Dropdown
      this.currentVisible = true;
      const contextmenu = this.$refs.contextMenu;
      // 创建locator
      const locator = document.createElement('div')
      console.log(this.posY)
      locator.style.cssText = `position:fixed;left:100px;top:${this.posY - 10}px`
      document.body.appendChild(locator)
      // 将locator绑定到Dropdown的reference上
      contextmenu.$refs.reference = locator
      this.locator = locator
      $('.Dropdown').parent().css({top: `${this.posY - 10}px`})
    },
    removeLocator () {
      if (this.locator) document.body.removeChild(this.locator)
      this.locator = null
    },
    handleContextmenu ({ button, clientX, clientY }) {
      if (this.posY !== clientY) this.posY = clientY
    },
    handleCancel () {
      this.currentVisible = false
      this.removeLocator()
    },
    collapsedSider () {
      this.shrink = !this.shrink
      this.$emit('changeRightBox', this.shrink)
    },
    getStatus (urlStr) {
      var urlStrArr = urlStr.split('/')
      return urlStrArr[urlStrArr.length - 1]
    },
    changeMenu (name) {
      this.goTo(name, '')
    },
    goTo (menu) {
      if (menu.node == -1) {
        if (menu.id == 'returnHall') { 
          loginController.removeItem(['meetingId']);
          var url =  getMeetingPrefix();
          window.location.href = url
          this.$router.go(0);
          return
        } else if (menu.id == 'createMeeting') {
          this.createMeetingModal = true
          this.meetingId = Math.round(new Date() / 1000)
        } else {
          this.$router.push({path: menu.link})
        }
      }
      this.handleCancel()
      // this.$store.state.menus[].subMenu.push({name:'小明',id: '123456', icon: 'client-a', link:'333', subMenu:null})
    },
    copy (){
      var str = '链接: ' +  getMeetingPrefix() + this.meetingId + '  复制这段内容，即可分享给其他人哦'
      copyStr(str)
      this.$Message.success('分享链接已复制到剪切板，通过ctrl+v获取到该链接')
    },
    joinMeetingNotic(subMenu) {
      const vm = this;
      vm.targetClient = subMenu;
      if (!vm.targetClient){
        vm.$Message.info('请选择用户');
        return;
      }
      sendNotice({targetIds: vm.targetClient.userId + '', msg:''});
    },
    joinMeeting(subMenu) {
      const vm = this;
      var obj = vm.$store.state.eleData;
      if (obj && subMenu.meeting.meetingId == obj.meetingId) {
        vm.$Message.info('您已经在该房间了！');
        return;
      }
      vm.$Modal.confirm({
          title: '提示',
          content: '确定加入该会议？',
          onOk: () => {
            vm.targetClient = subMenu;
            console.log('加入新房间', vm.targetClient.userId);
            var url =  getMeetingPrefix() + vm.targetClient.meeting.meetingId;
            window.location.href = url;
            vm.$router.go(0);
          }
      })
    },  
    reject(subMenu) {
      const vm = this;
      vm.targetClient = subMenu;
      if (!vm.targetClient){
        vm.$Message.info('请选择用户');
        return;
      }
      vm.$Modal.confirm({
          title: '提示',
          content: '确定请离该用户？',
          onOk: () => {
            sendNotice({targetIds: vm.targetClient.userId + '', msg:'', type: 'MEET_REJECT', clientFunc: 'notice_reject'});
          }
      })
    }
  }
}
</script>
<style type="text/css" scoped="scoped">
.menu a.router-link-active{
  color: #cccccc !important;
}
.item-menu i{
  transform: translateX(0px);
  transition: font-size 0.2s ease, transform 0.2s ease;
  vertical-align: middle;
  font-size: 16px;
}
.collapsed-menu i{
  transition: font-size 0.2s ease 0.2s, transform 0.2s ease 0.2s;
  vertical-align: middle;
  font-size: 22px;
}
.rotate-icon {
  transform: rotate(-180deg) !important;
}
.title-font {
  float: right;
  margin-right: 30%;
  font-size: 15px
}
.opacity-bar {
  opacity: 1;
  display: block;
  width: 100%;
  /* height: 1000px; */
  transition: .4s ease;
  backface-visibility: hidden;
}
.child-block {
  padding-left:20%;
  border: 1px solid #958a8a;
}
.item-menu span {
  white-space: nowrap;  /*强制span不换行*/
  display: inline-block;  /*将span当做块级元素对待*/
  overflow: hidden;  /*超出宽度部分隐藏*/
  text-overflow: ellipsis;  /*超出部分以点号代替*/
  line-height: 1.0; /*数字与之前的文字对齐*/
  font-size: 12px;
}
.ivu-menu:hover{
  opacity: 0.95;
}
.img {
    width: 20px;
    height: 20px;
  }
.item-menu .span{
  line-height:20px;
}
.drop-node{
  width: 40px;
  margin-left: -5px;padding:10px 0;
}
.drop-node:hover{
  background: #2d8cf0;
  box-shadow: 0 1px 10px 4px #2d8cf0;
  border-radius: 3.5px;
}

/deep/.ivu-menu{
    -moz-box-shadow:4px 2px 5px #333333;
    -webkit-box-shadow:4px 2px 5px #333333;
    box-shadow:4px 2px 5px #999;
    background: #ffffff !important;
}
/deep/.ivu-menu-dark{
    background: #cccccc;
}
/deep/.ivu-menu-dark.ivu-menu-vertical .ivu-menu-opened .ivu-menu-submenu-title{
    background: #cccccc;
    border-bottom: 0.5px solid #cccccc;
}
/deep/.ivu-menu-submenu-title{
    border-bottom: 0.5px solid #cccccc;
}
/deep/.ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item{
    background: #999;
}
/deep/.ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu-title:hover{
    background: #cccccc;
    color: #2d8cf0;
}
/deep/.ivu-menu-dark.ivu-menu-vertical .ivu-menu-item:hover{
    background: #2b85e4 !important;
    color: #fdfdfd;
    box-shadow: 0 1px 10px 4px #2d8cf0;
    border-radius: 2px;
}
/deep/.ivu-menu-dark.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu), .ivu-menu-dark.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu):hover, .ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu-title-active:not(.ivu-menu-submenu), .ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu-title-active:not(.ivu-menu-submenu):hover{
  background: #cccccc;
}
/*子项点击节点样式*/
/* /deep/.ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item-active, .ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item-active:hover {
  background: #999!important;
  color: #2d8cf0;
} */
/deep/.ivu-menu-dark.ivu-menu-vertical .ivu-menu-child-item-active>.ivu-menu-submenu-title {
  color: rgba(0,0,0,.7);
}

.marker{      
 width: 10px;      
 height: 10px;      
 border: 1px solid #088;      
 border-radius: 100px;      
 background: #FFFFFFF !important;      
 opacity: 0.5;
}
</style>
