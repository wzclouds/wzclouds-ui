<template>
  <Content>
    <div class="ivu-layout-content right-block">
      <h1 class="home-title">{{this.$store.state.meetingInfo.meetingName}}</h1>
      <Divider />
      <p class="home-content">{{this.$store.state.meetingInfo.desc}}</p>
    </div>
  </Content>
</template>
<script>
	export default {
    name: 'Home',
    components: {
    },
    data() {
    	return {
    		meetingId: '',
    		userId: '',
    	}
    },
    created: function () {
      base_vm.setMenu();
    },
    mounted() {
      this.login();
      console.log("进入大厅/房间");
    },
    methods: {
    	login(){
        const vm = this;
        if (!vm.$store.state.rtc) {
          base_vm.connectionSocket();
        }
    	}
    }
}
</script>
<style lang='less' scoped>

.right-block {
    width: 82%;
    height: calc(100% - 81px);
    position: absolute;
    left: 17%;
    top: 11%;
}

.home-title {
  text-align: center;
  font-size: 50px;
}

.home-content {
  text-align: center;
}
</style>