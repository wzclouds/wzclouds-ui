<template>
<!-- <div>
        <p>请先登录</p>
        <div slot="footer">
          <Button class="modalBtn" type="default" @click="login" size="large">登录</Button>
          <Button class="modalBtn" type="primary" @click="loginTemp" size="large">临时登录</Button>
        </div>
</div> -->
    <div class='login'>
        <div class='login_title'>
            <span>账号登录</span>
        </div>
        <div class='login_fields'>
            <div>
                <Input v-model="account" prefix="ios-contact" placeholder="用户名" size="large" />
            </div>
            <div>
                <Input v-model="password" prefix="ios-lock" type="password" password placeholder="密码"  size="large" />
            </div>
            <div class='login_fields__submit'>
                <input type='submit' value='登录' @click="login()">
                <div class='forgot'>
                    <input class="temp" type='submit' value='临时登录' @click="loginTemp()">
                </div>
            </div>
        </div>
        <div class="disclaimer">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce semper laoreet placerat. Nullam semper auctor justo, rutrum posuere odio vulputate nec.</p>
        </div>
    </div>
</template>


<script>
import apiList from '@/view/meeting/api/apiList'
import loginConfig from '@static/login/config.js'
import {mapState} from 'vuex'
export default {
    data () {
        return {
            account: '',
            password: '',
            userIconCopy: `${process.env.SYSTEM_STATIC.toLowerCase()}` + '/imgs/user_icon_copy.png',
            tick: `${process.env.SYSTEM_STATIC.toLowerCase()}` + '/imgs/tick.png',
            lockIconCopy: `${process.env.SYSTEM_STATIC.toLowerCase()}` + '/imgs/lock_icon_copy.png',
        }
    },
    mounted () {
        loginController.emptyLoginUserInfo();
    },
    methods: {
        async login () {
            const vm = this;
            if (!vm.account) {
                vm.$Message.error("用户名不可为空!")
                return;
            }
            if (!vm.password) {
                vm.$Message.error("密码不可为空!")
                return;
            }
            var res = await apiList.loginAccount({account: vm.account, password: vm.password});
            res = res.data;
            if (res.isSuccess) {
                var ticket = res.data.token;
                vm.loginTemp(ticket);
            } else {
                vm.$Message.error(res.msg);
            }
        },
        loginTemp (ticket) {
            const vm = this;
            loginController.getLoginInfo(ticket, function (path) {
                vm.$Message.success("登录成功！");
                setTimeout(function() {
                    vm.$router.push({
                        path: path
                    });
                }, 500)
            }, function (res) {
                vm.$Message.error(res.msg);
            })
        }
    }
}
</script>
<style scoped>
* {
    box-sizing: initial;
}
body .login_fields__submit .forgot {
    margin-top: 0px;
}
.temp {
    color: #57a3f3;
    border: 2px solid #57a3f3;
}
.temp:hover {
    color: #fff;
    background: #57a3f3;
    cursor: pointer;
    -webkit-transition-property: background,color;
    transition-property: background,color;
    -webkit-transition-duration: .2s;
    transition-duration: .2s;
}
</style>