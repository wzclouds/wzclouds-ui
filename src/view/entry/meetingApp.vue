<template>
  <div class="container">
    <Content>
    <router-view v-if="$route.name=='Login'" class="height_default overflowAuto"></router-view>
    <div v-else>
      <main-bar/>
      <div style="height: 100%;">
        <div>
          <keep-alive include="MeetingVideo,WhiteBoard">
            <router-view class="height_default overflowAuto"></router-view>
          </keep-alive>
        </div>
      </div>
    </div>
    </Content>
    <Modal
        v-model="passwordTag"
        title="输入密码"
        :mask-closable="false">

        <Input v-model="eleData.meetingPassword"  prefix="md-radio-button-on" placeholder="会议密码" title="会议密码"/>
        <div slot="footer">
          <Button class="modalBtn" type="primary" @click="submitPassword" size="large">确定</Button>
        </div>
    </Modal>
    <Spin size="large" fix v-if="$store.state.isShowMask" style="z-index: 9999;">
        <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
        <div>Loading</div>
    </Spin>
  </div>
</template>
<script>
import mainBar from '@/components/hengyun/mainBar'
export default {

  components: {
    'main-bar': mainBar
  },
  data () {
    return {
      isRouterAlive: true,
      isShowMenu: false,
      isCollapsed: false,
      menus:[],
      rightBoxClass: false,
      passwordTag: false,
      eleData: {

      }
    }
  },
  computed: {
    menuitemClasses: function () {
        return [
            'menu-item',
            this.isCollapsed ? 'collapsed-menu' : ''
        ]
    },
    rightBoxClasses: function () {
      let className = this.rightBoxClass ? 'right-box-in' : 'right-box-out'
      return className
    }
  },
  provide () {
    return {
      reload: this.reload
    }
  },
  created: function () {
    setBaseVM(this)
  },
  mounted () {
    const vm = this;
    vm.getOperateMenu();
    vm.connectionSocket();
  },
  methods: {
      connectionSocket() {
        console.log("初始化socket")
        const vm = this;
        if (vm.$store.state.rtc) {
          return;
        }
        //连接WebSocket服务器
        if (loginController.getLoginUserInfo()) {
          var user = loginController.getLoginUserInfo();
          vm.$store.state.eleData.photo = user.photo;
          vm.$store.state.eleData.userId = user.userId;
          vm.$store.state.eleData.type = user.type;
          vm.$store.state.eleData.userName = user.userName;
          vm.$store.state.eleData.token = user.token;
          vm.$store.state.eleData.meetingId = user.meetingId;
          if (vm.$route.params.meetingId) {
            user.meetingId = vm.$route.params.meetingId
          }
          if (user.meetingId){
            vm.$store.state.eleData.meetingId = user.meetingId;
            vm.$store.state.eleData.meetingPassword = user.meetingPassword;
          }
          vm.eleData = vm.$store.state.eleData;
          loginController.setLoginUserInfo(user);
          vm.$store.state.rtc = WzRTC(vm.$store.state.eleData);
          vm.$store.state.rtc.connect(`wss:${location.hostname}:${location.port}/wss`, vm.$store.state.eleData);

          var rtc = vm.$store.state.rtc;
          // 发送欢迎通知
          if (header_vm) {
            header_vm.setPhoto();
          }
          setRTC(rtc)
          setMeMsg(vm.$store.state.eleData.userId);
          setMeetingId(vm.$store.state.eleData.meetingId)

          //删除其他用户
          rtc.on('remove_peer', function (socketId) {
            if (constant_vm) {
              // var video = document.getElementById('other-' + socketId + '-box');
              var video = constant_vm.swiperSlideEle.find(`div[id^="other-${socketId}-box"]`)[0];
              if (video) {
                video.parentNode.removeChild(video);
                // for (var i = 0;i < constant_vm.eleData.videolist.length; i++){
                //   if (constant_vm.eleData.videolist[i].id === "other-" + socketId){
                //       constant_vm.eleData.videolist.splice(i,1);
                //       console.log(constant_vm.swipeiCurrent)
                //   }
                // }
                console.log(vm.eleData.videolist)
              }

              var midIdArr = $('.bigScreen').find('.other')[0].id
              var midId = midIdArr.split('-')[midIdArr.split('-').length - 1]
              if(socketId == midId) {
                var vele = constant_vm.bigScreenEle
                vele.srcObject = null
                vele.poster = constant_vm.videoDefaultImg
                vele.id = ''
              }
            }
          });

          //接收加入房间的通知
          rtc.on('retHello', function (data) {
            vm.$Modal.confirm({
              title: '提示',
              content: (data.sendName || '') + '邀请你加入会议室' + (data.data.meetingName || data.data.meetingId) + ', 是否加入？',
              onOk: () => {
                jumpMeeting(data.data.meetingId);
              }
            })
          });

          //接收退出房间的通知
          rtc.on('notice_reject', function (data) {
            console.log('退出房间');
            loginController.removeItem(['meetingId'])
            var url =  getMeetingPrefix();
            window.location.href = url
            vm.$router.go(0);
          });


          rtc.on('hallClients', function (data) {
            if (data.data && data.data.obj) {
              menuConst.home[0].subMenu = data.data.obj;
            }
          });

          rtc.on('meetingClients', function (data) {
            if (data.data && data.data.obj) {
              menuConst.home[2].subMenu = data.data.obj;
            }
          });

          rtc.on('serverMeetingStatistics', function (data) {
            if (data.data && data.data.obj) {
              menuConst.home[1].subMenu = data.data.obj;
              data.data.obj.forEach(obj => {
                // 设置房主
                if (obj.meeting.meetingId == vm.eleData.meetingId) {
                  if (obj.meeting.owner == vm.eleData.userId) {
                    vm.$store.state.tags.isMeetingManager = true;
                  }
                }
              })
            }
          });
        }
      },
      submitPassword () {
        constant_rtc.join(this.eleData);
      },
      showMenu () {
        this.isShowMenu = !this.isShowMenu
      },
      changeRightBox (bool) {
        this.rightBoxClass = bool
      },
      setMenu () {
        const vm = this
        var menus = []
        var url = this.$route.name.toLowerCase()
        setMenuMap(getActionName(url))
      },
      reload () {
        this.isRouterAlive = false
        this.$nextTick(() => {
            this.isRouterAlive = true
        })
      },
      getOperateMenu () {
        if (this.$route.name === null) {
          var path = loginController.getHisUrl();
          if (!path) {
            path = '/home'
          }
          this.$router.push({
            path: '/home'
          })
          return;
        }
      },
      openMask() {
        this.$store.state.isShowMask = true;
      },
      closeMask() {
        this.$store.state.isShowMask = false;
      },
      joinError(data) {
        loginOut(data.data.msg)
      },
      meetingPasswordError(data) {
        this.passwordTag = true;
        this.$Message.error(data.data.msg);
      },
      meetingPasswordSuccess(data) {
        this.passwordTag = false;
        this.$Message.success(data.data.msg);
        loginController.setLoginUserInfo(this.eleData);
        if (constant_rtc) {
          constant_rtc.joinVideo(this.eleData)
        }
      },
      meetingClientOut(data) {
        loginController.removeItem(['meetingId']);
        this.$store.state.eleData.meetingId = null;
        this.$Message.warning(data.data.msg);
      }
    }
  }
</script>

<style lang="less">
  .demo-spin-col-load{
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
    border: 1px solid #ee212a;
  }
  #hySpin{
    z-index: 8888;
    background-color: rgba(255,255,255,.5);
  }
  .mask_btn{
    margin-top: 10px;
  }
  .right-box-out{
    float: right;
    transition: max-width 0.3s;
    max-width: 85%;
    width: 100%;
  }
  .right-box-in{
    float: right;
    transition: max-width 0.3s;
    max-width: calc(100% - 30px) ;
    width: 100%;
  }
</style>
