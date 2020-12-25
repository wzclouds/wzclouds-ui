<template>
  <Header class="header">
    <Menu mode="horizontal"
    theme="light"
    style="height: 65px;"
    @on-select="setMenu"
    :active-name="activeName">
        <MenuItem name="home">
              <Icon type="ios-home" />
              首页
        </MenuItem>
        <MenuItem name="biz">
              <Icon type="ios-apps" />
              业务功能
        </MenuItem>
        <MenuItem name="manager">
              <Icon type="ios-cog" />
              系统管理
        </MenuItem>
        <Dropdown class="dropdown">
          <div class="icon-box userInfo">
            <img class="img" :src="userInfo.photo" @error="imgError()"/>
          </div>
          <a href="javascript:void(0)">
              {{userInfo.userName}}
              <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
              <DropdownItem @click.native="openUpdatePasswordWin()">修改密码</DropdownItem>
              <!--<DropdownItem >更换头像</DropdownItem>-->
              <DropdownItem @click.native="loginout()">退出</DropdownItem>
          </DropdownMenu>
      </Dropdown>
    </Menu>

    <Modal
        v-model="passwordUpdateTag"
        title="修改密码"
        :mask-closable="false">
        <Form :model="updatePasswordData" :label-width="80">
          <FormItem label="原密码">
            <Input v-model="updatePasswordData.oldPassword" type="password" password prefix="md-radio-button-on" placeholder="原密码" title="原密码"/>
          </FormItem>

          <FormItem label="新密码">
            <Input v-model="updatePasswordData.newPassword" type="password" password prefix="md-radio-button-on" placeholder="新密码" title="新密码"/>
          </FormItem>

          <FormItem label="确认密码">
            <Input v-model="updatePasswordData.confirmPassword" type="password" password prefix="md-radio-button-on" placeholder="确认密码" title="确认密码"/>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button class="modalBtn" type="primary" @click="updatePassword" size="large">确定</Button>
        </div>
    </Modal>
  </Header>
</template>

<script>
import api from '@/api/axiosApi'
import comApi from '@/api/comApiList'
import { mapState } from 'vuex'

const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
export default {
  props: {
    title: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      messages: [],
      msgNum: 0,
      indexIcon: `${process.env.SYSTEM_STATIC.toLowerCase()}` + '/imgs/home_default.png',
      quitIcon: `${process.env.SYSTEM_STATIC.toLowerCase()}` + '/imgs/quit_default.png',
      photo: `${process.env.SYSTEM_STATIC.toLowerCase()}` + '/imgs/user.png',
      activeName: getActionName(this.$route.name.toLowerCase() || 'home'),
      passwordUpdateTag: false,
      updatePasswordData: {

      }
    }
  },
  created (){
    setHeaderVM(this);
  },
  mounted () {
  },
  methods: {
    openUpdatePasswordWin() {
      this.passwordUpdateTag = true
    },
    setMenu (key) {
      setMenuMap(key);
    },
    imgError() {
      let img = event.srcElement;
      img.src = require('@static/lib/img/39.png');
      img.onerror = null; //防止闪图
    },
    setPhoto () {
      const vm = this
      if (!loginController.isLogined()) {
        return
      }
      loginController.setLoginUserInfo();
      var img = new Image();
      img.src = vm.$store.state.userInfo.photo
      img.onerror = () => {
         img.src = vm.photo
      }
      img.onload = () => {
         vm.photo = img.src
      }
      this.welcome();
    },
    welcome () { // 欢迎通知
      let date = new Date()
      let year = date.getFullYear()
      let mouth = date.getMonth() + 1
      let day = date.getDate()
      let week = date.getDay()
      this.$Notice.config({
        top: 70,
        duration: 3
      })
      this.$Notice.open({
        title: '欢迎回来，' + this.userInfo.userName,
        desc: '当前时间：' + year + '-' + mouth + '-' + day + '，' + weeks[week],
        duration: 3
      })
    },
    userLogout () {
      // location.href = this.$store.state.logoutUrl
      // this.$store.state.userInfo = {}
      // // constantModule.userToken = ''
      // // constantModule.appToken = ''
      // localStorage.removeItem(`${process.env.SYSTEM_APP.toLowerCase()}_token`)
    },
    goIndex () {
      location.href = this.$store.state.indexUrl
    },
    loginout () {
      this.$Modal.confirm({
          title: '提示',
          content: '确定退出系统？',
          onOk: () => {
            loginOut();
            loginController.removeBeforeUrl();
          }
      })
    },
    // 跳转到消息中心
    gotoMessageCenter () {
      window.open('/cloud-center/admin/home?type=all')
    },
    async updatePassword () {
      const vm = this
      if (!vm.updatePasswordData.newPassword || !vm.updatePasswordData.oldPassword || !vm.updatePasswordData.confirmPassword){
        vm.$Message.warning("密码不能为空!");
        return;
      }
      const res = await comApi.updatePassword(vm.updatePasswordData);
      var data = res.data;
      if (data.isSuccess) {
        vm.$Message.success("修改成功!");
        vm.passwordUpdateTag = false;
      } else {
        vm.$Message.error(data.msg);
      }
    },
  },
  computed: {
    ...mapState([
      'userInfo'
    ])
  }
}
</script>
<style lang="less" scoped="scoped">
html .ivu-layout-header, body .ivu-layout-header, #app .ivu-layout-header, .ivu-layout .ivu-layout-header{
  background: #fff;
}
.header{
}
.header /deep/ .ivu-menu-primary {
  background: #fff;
}
.logo-img{
  width: 44px;
  height: 81px;
  margin-right: 10px;
  background: url('./../../../static/imgs/logoImg.png') center center no-repeat;
  background-size: contain;
  float: left;
}
.icon-box{
  cursor: pointer;
  position: relative;
  text-align: center;
  line-height: 1;
  display: inline-block;
  width: auto;
  // min-width: 70px;
  padding: 0 !important;
  i{
    margin-left: calc(50% - 18px);
  }
  .num{
    position: absolute;
    top: -7px;
    right: 16px;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    text-align: center;
    line-height: 25px;
    background-color: red;
  }
  .img{
    width:100%;
    height:100%;
  }
  .text{
    display: block;
    line-height: 1;
  }
}
.userInfo{
  cursor: auto;
  border:2px solid #2882e0;
  border-radius:50%;
  width:30px;
  height:30px;
  overflow:hidden;
  float: left;
  // img{
  //   border: 2px solid #2882e0;
  //   border-radius: 50%;
  // }
}
.message-container{
  width: 360px;
  color: #000;
  .message-title{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  li{
    border-bottom: 1px solid #e9eaec;
    padding: 5px 0;
    cursor: pointer;
    &:hover{
      color: #0C66C7;
    }
    .message-time{
      &:after{
        content: '';
        display: block;
        clear: both;
        height: 0;
      }
    }
  }
  .all-message{
    text-align: center;
    color: #999999;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    &:hover{
      color: #0C66C7;
    }
  }
  .no-message{
    text-align: center;
  }
}
.right-icon-box{
  height: 60px;
}
.layout-logo{
  margin-top: 18px;
  color: #fff;
  font-size: 20px;
  line-height: 1;
  p{
    margin-bottom: 5px;
  }
  span{
    font-size: 14px;
  }
}
.pop-tip{
  float: right;
  margin-top: 5px;
}
.pop-photo {
  float: left;
  width: 35px;
  height: 35px;
}
.pop-name {
  float: left;
  margin-left: 10px;
  margin-top: 9px;
}
.loginout {
  font-size: 35px;
  float: right;
  cursor: pointer;
}
.dropdown {
  margin-left: 20px;
  float: right;
  margin-right: 15px;
}
/deep/.ivu-poptip-rel{
  height:50px;
}
/deep/.ivu-dropdown-rel{
  position: relative;
  display: block;
}
.userInfo {
  margin: 15px 10px;
  float: left;
}
</style>
