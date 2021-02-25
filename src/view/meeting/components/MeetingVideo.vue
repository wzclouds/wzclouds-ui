<template>
  <Content>
    <Modal
        v-model="passwordTag"
        title="输入密码"
        :mask-closable="false">

        <Input v-model="eleData.password"  prefix="md-radio-button-on" placeholder="会议密码" title="会议密码"/>
        <div slot="footer">
          <Button class="modalBtn" type="primary" @click="submit" size="large">确定</Button>
        </div>
    </Modal>
    <!-- <div class="right-block-chat">
      <div class="shrink-arrow" @click="openChat"> <div style="margin-left: 2px;">聊天界面</div></div>
      <div id="chat">
        <div class="msgs" id="msgs"></div>
        <label class="ivu-btn ivu-btn-default fileLabel" for="fileIpt">选择文件</label>
        <input type="file" style="position:absolute;" id="fileIpt" class="fileIpt ivu-upload-input"/>
        <Button id="sendFileBtn" type="warning" class="sendFileBtn" size="small">发送文件</button>
        <Input v-model="eleData.sendMessage" id="msgIpt" class="msgIpt" title="消息" />
        <Button id="testBtn" type="primary" class="sendBtn">发送</Button>
      </div>
    </div> -->
    <Split class="right-block" v-model="split2" mode="vertical">
          <div slot="top" >
              <div class="bigScreen">
                <video :poster="videoDefaultImg" class="video-js vjs-default-skin vjs-big-play-centered other" data-setup="{}" autoplay="true"></video>
                <!-- <video :poster="videoDefaultImg" class="other" autoplay="true"></video> -->
                <div class="btn-bigscreen">
                  <Icon type="md-expand" @click="fullSc" class="bigScreen-button"/>
                  <!--<div id="other-88-muted" class="button-group" style="display: block;">静音</div>-->
                </div>
              </div>
          </div>
          <div slot="bottom">
            <div id="videos" class="videos-pos">
              <swiper :options="swiperOption" ref="mySwiper" @someSwiperEvent="callback" :current="swipeiCurrent">
                <!-- slides -->
                <swiper-slide style="margin-left: 50px">
                  <div id="localBox" class="video-box" v-if="eleData.meetingId && joinTag">
                    <video :id="eleData.userId" class="other" autoplay></video>
                    <div v-if="showManager(eleData.userId)" class="user-name-tip user-duty" title="房主">
                      <svg class="icon" style="font-size: 16px;" aria-hidden="true">
                        <use xlink:href="#icon--huangguan"></use>
                      </svg>
                    </div>
                    <Tag color="primary" class="user-name-tip">{{eleData.userName}}</Tag>
                    <div class="btn-box">
                      <div id="meCloseVideo" class="button-group" :title="btnPlaceholder.cameraCon">
                        <i class="iconfont icon-shexiangtou"/>
                      </div>
                      <div id="meCloseAudio" class="button-group" :title="btnPlaceholder.mutedCon">
                        <i class="iconfont icon-maikefeng-tianchong"/>
                      </div>
                      <div :id="eleData.userId + '-recorderControl'" class="button-group" :title="btnPlaceholder.rec">
                        <i class="iconfont icon-rec-"/>
                      </div>
                    </div>

                    <div class="videolz" :style="videostyle"><i></i>正在录制 {{videolzh}}:{{videolzm}}:{{videolz}}</div>
                    <div class="culme">
                      <div class="culmelarge" id="culme">
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                      </div>
                    </div>
                  </div>
                </swiper-slide>
                <swiper-slide v-for="(index, key) in eleData.videolist" :id="index.divId?index.divId : ''" :key="key">
                  <div class="video-box">
                    <video :id="index.id" class="other" autoplay></video>
                    <div v-if="showManager(index.id.substring(6))" class="user-name-tip user-duty">
                      <svg class="icon" style="font-size: 16px;" aria-hidden="true">
                        <use xlink:href="#icon--huangguan"></use>
                      </svg>
                    </div>
                    <Tag color="primary" class="user-name-tip">{{index.userName}}</Tag>
                    <div class="btn-box">
                      <div :id="index.id + '-muted'" v-if="index.meCloseVideo" class="button-group" :title="btnPlaceholder.mutedCon">
                        <i class="iconfont icon-shengyinkai"/>
                      </div>
                      <div :id="index.id + '-recorderControl'" class="button-group" :title="btnPlaceholder.rec">
                        <i class="iconfont icon-rec-"/>
                      </div>
                      <div v-if="$store.state.tags.isMeetingManager" :id="index.id + '-upload'" class="button-group" :title="btnPlaceholder.uploadBiz" @click="uploadBiz(index)">
                        <Icon type="ios-albums" class="my-video-iview-icon"/>
                      </div>
                    </div>
                    <div class="videolz"><i></i>正在录制 <span class="videolzh"></span>:<span class="videolzm"></span>:<span class="videols"></span></div>
                    <div class="culme">
                      <div class="culmelarge" :id="index.culme">
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                        <div class="item"></div>
                      </div>
                    </div>
                  </div>
                </swiper-slide>
                <!-- Optional controls -->
                <div class="swiper-button-prev" slot="button-prev"></div>
                <div class="swiper-button-next" slot="button-next"></div>
              </swiper>
            </div>
          </div>
    </Split>

    <hy-upload ref="hyUpload"></hy-upload>

    <div id="files">
    </div>
  </Content>
</template>
<script>
import api, {httpServerCancel, httpServerRe} from '@/api/axiosApi';
import WhiteBoard from "@/view/meeting/components/WhiteBoard";
import apiList from '@/view/meeting/api/apiList';
import {mapState} from 'vuex';
import 'swiper/dist/css/swiper.css';
import { swiper, swiperSlide } from 'vue-awesome-swiper';
import mainBar from '@/components/hengyun/mainBar';
import hyUpload from '../../../components/hengyun/hyUpload';

  var videos
  var sendBtn
  var testBtn
  var joinBtn
  var msgs
  var phone
  var sendFileBtn
  var files
  var meetingNum
  var me
  var rtc

  function getTempUser (vm) {
    var random = Date.parse(new Date()).toString().substring(5) + '' + Math.ceil(Math.random()*100)
    vm.$Notice.open({
                    title: '通知',
                    desc: '当前以临时用户' + random + '进行访问'
                });
    return {userId: 'tmp' + random, userName:'临时用户' + random, photo: `/${process.env.PLATFORM}/meeting-static/lib/img/39.png`, type:'tmp'}
  }

  export default {
    name: 'MeetingVideo',
    components: {
      'white-board': WhiteBoard,
      'swiper': swiper,
      'swiperSlide': swiperSlide,
      'main-bar': mainBar,
      'hy-upload': hyUpload
    },
    data() {
      const  vm = this
      return {
        isCollapsed: false,
        rtc: this.$store.state.rtc,
        videoDefaultImg: `${process.env.SYSTEM_STATIC}/lib/img/39.png`,
        swiperOption: {
          slidesPerView: 6,
          spaceBetween: 30,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }
        },
        eleData: this.$store.state.eleData,
        btnPlaceholder: {
          rec: "录制",
          microphoneCon: "麦克风控制",
          cameraCon: "摄像头控制",
          mutedCon: "静音控制",
          uploadBiz: "上传附件",
        },
        videolz: '',
        videolzh: '00',
        videolzm: '00',
        videostyle: '',
        joinTag: true,
        passwordTag: false,
        bigScreenEle: null,
        swiperSlideEle: null,
        tempTag: false,
        split2: 0.6, //上下分界缩放
        isRouterAlive: true,
        isCollapsed: false,
        menus:[],
        swipeiCurrent: 0
      }
    },
    computed: {
      swiper() {
        if (!this.eleData.meetingId) {
          return null;
        }
        console.log(swiper)
        return this.$refs.mySwiper.swiper
      },
      showManager() {
        return function(userId) {
          var res = isThisMeetingManager(userId);
          console.log(userId + ": " + res)
          return res;
        }
      },
      ...mapState([
        'userInfo'
      ])
    },
    created: function () {
      base_vm.setMenu();
      setMeetingVM(this)
    },
    mounted() {
      this.login()
    },
    watch: {
    '$route'(to, from) {
        if (to.name === 'MeetingVideo') {
          let temp = $("video")
          Object.keys(temp).forEach(function (key) {
            if (temp[key].srcObject) {
              try {
                temp[key].play()
              } catch (e){}
            }
          })
        }
      }
    },
    methods: {
      async login () {
        const vm = this
        var meetingId = loginController.getMeetingId() || this.$route.params.meetingId
        if (!meetingId) {
          this.$Message.error("请先加入一个房间!");
          this.$router.push({
            path: '/home'
          })
          return;
        }
        // 判断有无加载rtc
        if (!vm.$store.state.rtc) {
          base_vm.connectionSocket();
        }
        vm.bigScreenEle = $('.bigScreen').find('video')[0]
        vm.eleData = vm.$store.state.eleData;
        if (!vm.eleData.userId) {
          return;
        }
        vm.swiper.slideTo(6, 2000, false)
        vm.doclue();
        vm.swiperSlideEle = $('.swiper-wrapper')
      },
      callback () {},
      msgsInput (msg, id) {
        var p;
        if (document.getElementById(id)){
          p = document.getElementById(id)
          p.innerText = msg;
        } else {
          p = document.createElement('p');
          p.id = id;
          p.style.color = '#DE2131'
          p.style.textAlign = 'center'
          p.innerText = msg;
          msgs.appendChild(p);
        }
      },
      doclue() {
        // phone.value = 6666;

        //以下是一些固定操作变量
        const vm = this
        var videoTag = false;
        var audioTag = false;

        videos = document.getElementById("videos");
        // sendBtn = document.getElementById("sendBtn");
        testBtn = document.getElementById("testBtn");
        // joinBtn = document.getElementById("joinBtn");
        msgs = document.getElementById("msgs");
        // phone = document.getElementById("phone");
        sendFileBtn = document.getElementById("sendFileBtn");
        files = document.getElementById("files");
        meetingNum = document.getElementById("meeting");
        rtc = vm.$store.state.rtc;
        vm.rtc = rtc;

        //成功创建WebSocket连接
        rtc.on("connected", function (socket) {
          //创建本地视频流
          setTimeout((function(){rtc.createStream({
              "video": true,
              "audio": true
            });
            me = $('#' + vm.eleData.userId);
            me.muted = "true";
          }), 1000);
        });
        //创建本地视频流成功
        rtc.on("stream_created", function (stream) {
          me[0].srcObject = stream;
          // me[0].play();
          me[0].muted = true;
          me[0].style.background = '#c7c7c7'
          vm.videoREGSelf(me[0],vm.eleData.userId)
          $('#meCloseVideo')[0].style.display= 'block'
          $('#meCloseAudio')[0].style.display= 'block'
          $('#culme')[0].style.display= 'block'

          $('#meCloseVideo')[0].onclick = function (e) {
            rtc.closeVideo(videoTag);
            videoTag = ! videoTag
            var im = $(e.target).attr('class');
            if(im == 'iconfont icon-shexiangtou'){
              $(e.target).attr('class','iconfont icon-shexiangtou_guanbi')
            }else{
              $(e.target).attr('class','iconfont icon-shexiangtou')
            }
          }
          $('#meCloseAudio')[0].onclick = function (e) {
            rtc.closeAudio(audioTag);
            audioTag = ! audioTag
            var im = $(e.target).attr('class');
            if(im == 'iconfont icon-maikefeng-tianchong'){
              $(e.target).attr('class','iconfont icon-maikefeng-jingyin-tianchongsvg')
            }else{
              $(e.target).attr('class','iconfont icon-maikefeng-tianchong')
            }
          }
          me.dblclick(function(){
            // 双击大视频事件
            setBigScreenEvent(me[0])
          })
        });
        //创建本地视频流失败
        rtc.on("stream_create_error", function () {
          alert("create stream failed!");
        });

        //接收到其他用户的视频流
        rtc.on('pc_add_stream', function (stream, socketId, pc) {
          var id = "other-" + socketId;
          // vm.eleData.videolist.forEach(function(o){
          //   if (o.id === ("other-" + socketId)) {
          //     var video = vm.swiperSlideEle.find(`div[id^="other-${socketId}-box"]`)[0];
          //     if (video) {
          //       video.parentNode.removeChild(video);
          //     }
          //   }
          // })
          // vm.eleData.videolist.push({
          //   id: "other-" + socketId,
          //   divId: id + '-box',
          //   meCloseVideo: 1,
          //   meCloseAudio: 1,
          //   userName: pc.userName,
          //   culme: 'culme'+ socketId
          // })
          var ids = vm.eleData.videolist.map(function(o){return o.id;})
          if (ids.indexOf("other-" + socketId) === -1) {
            vm.eleData.videolist.push({
              id: "other-" + socketId,
              divId: id + '-box',
              meCloseVideo: 1,
              meCloseAudio: 1,
              userId: socketId,
              userName: pc.userName,
              culme: 'culme'+ socketId
            })
          }
          try {
            setTimeout((function(){rtc.attachStream(stream, id, vm)}), 1000)
          } catch(e) {
            console.log("socket添加链接错误");
          }
        });

        // //删除其他用户
        // rtc.on('remove_peer', function (socketId) {
        //   // var video = document.getElementById('other-' + socketId + '-box');
        //   var video = vm.swiperSlideEle.find(`div[id^="other-${socketId}-box"]`)[0];
        //   if (video) {
        //     video.parentNode.removeChild(video);
        //     for (var i = 0;i < vm.eleData.videolist.length; i++){
        //       if (vm.eleData.videolist[i].id === "other-" + socketId){
        //           vm.eleData.videolist.splice(i,1);
        //       }
        //     }
        //     console.log(vm.eleData.videolist)
        //   }
        //   var vele =  vm.bigScreenEle
        //   vele.srcObject = null
        //   vele.poster = vm.videoDefaultImg
        //   vele.id = ''
        // });

        // //接收到文字信息(自定义服务端通信)on_talk_System
        // rtc.on('on_talk', function (data) {
        //   var name = data.name
        //   var hasTarget = data.targetIds.length > 0
        //   var p = document.createElement("p");
        //   if (!hasTarget){
        //     p.innerText = name + ": " + data.data.msg;
        //   } else {
        //     p.innerText = name + "悄悄对你说: " + data.data.msg;
        //   }
        //   msgs.appendChild(p);
        // });

        // //接收到文字信息(自定义服务端通信)
        // rtc.on('on_talk_system', function (data) {
        //   var p = document.createElement("p");
        //   p.style.color = '#DE2131'
        //   p.style.textAlign = 'center'
        //   p.innerText = data.data.msg;
        //   msgs.appendChild(p);
        // });

        // //接收加入房间的通知
        // rtc.on('retHello', function (data) {
        //   vm.$Modal.confirm({
        //     title: '提示',
        //     content: (data.sendName || '') + '邀请你加入会议室' + (data.data.meetingName || data.data.meetingId) + ', 是否加入？',
        //     onOk: () => {
        //       jumpMeeting(data.data.meetingId);
        //     }
        //   })
        // });

        // //接收退出房间的通知
        // rtc.on('notice_reject', function (data) {
        //   console.log('退出房间');
        //   localStorage.removeItem('meetingId')
        //   var url =  getMeetingPrefix();
        //   window.location.href = url
        //   vm.$router.go(0);
        // });


        // rtc.on('hallClients', function (data) {
        //   if (data.data && data.data.obj) {
        //     menuConst.meeting[0].subMenu = data.data.obj;
        //   }
        // });

        // rtc.on('meetingClients', function (data) {
        //   if (data.data && data.data.obj) {
        //     menuConst.meeting[2].subMenu = data.data.obj;
        //   }
        // });

        // rtc.on('serverMeetingStatistics', function (data) {
        //   if (data.data && data.data.obj) {
        //     menuConst.meeting[1].subMenu = data.data.obj;
        //     data.data.obj.forEach(obj => {
        //       if (obj.meeting.meetingId.toString() == vm.eleData.meetingId) {
        //         vm.$set(vm.meetingMsg, "owner", obj.meeting.owner);
        //         if (vm.meetingMsg.owner == vm.eleData.userId) {
        //           vm.$store.dispatch('setTag', {tag: 'isManager', value: true});
        //         }
        //       }
        //     })
        //   }
        // });

        socketOK(function (){
          rtc.joinVideo(vm.eleData)
        });
      },
      fullSc(e){
        var fulls = $('.bigScreen').find('video');
        fulls[0].requestFullscreen();
      },
      submit () {
        this.rtc.join(this.eleData);
      },
      sendMsg () {
        if (!this.eleData.sendMessage) {
          return;
        }
        this.rtc.sayHello(this.eleData);
        this.eleData.sendMessage = '';
      },
      openChat () {
        var tag = $('.right-block-chat')[0];
        if (tag.style.maxWidth === '25%') {
          tag.style.maxWidth = 0;
        } else {
          $('.right-block-chat').css('max-width', '25%');
        }
      },
      uploadBiz(id) {
        const vm = this;
        var tag = isNormalMeeting();
        if (!tag) {
          vm.$Message.warning("必须进入一个正式会议，才可使用该功能！");
          return;
        }
        vm.$refs.hyUpload.openByUser(id.userId);
      },
      videoREGSelf(copyNode,id){
        // 设置视频录制 start
        const vm = this;
        var recorder = new MediaRecorder(copyNode.srcObject);
        var recorderControl = document.getElementById(id + "-recorderControl");
        var isplay = true;
        var indexs = null;
        recorderControl.onclick = function () {
          if (id == vm.eleData.userId) {
            vm.videostyle = 'display:block'
            if(isplay){
              vm.videolz = '00'
              vm.videolzm = '00'
              $(this).addClass('active')
              recorder.start()
              indexs = setInterval(function(){
                vm.videolz++
                if (vm.videolz < 10){
                  vm.videolz = '0' + vm.videolz
                } else if(vm.videolz > 59){
                  vm.videolz = '00'
                  if (vm.videolzm < 9) {
                    vm.videolzm = '0' + (Number(vm.videolzm)+1)
                  }else if (Number(vm.videolzm) < 59){
                    vm.videolzm = Number(vm.videolzm)+1
                  }else{
                    vm.videolzm = '00'
                    if (vm.videolzh < 9) {
                      vm.videolzh ='0' + (Number(vm.videolzh) + 1)
                    }else{
                      vm.videolzh = Number(vm.videolzh) + 1
                    }
                  }
                }
              },1500)
            }else{
              vm.videostyle = 'display:none'
              $(this).removeClass('active')
              recorder.stop()
              clearInterval(indexs)
            }
          }else{
            var ddId = $('#'+ id + '-box')
            if(isplay){
              ddId.find('.videolz').show()
              $(this).addClass('active')
              var videols = ddId.find('.videols')
              var videolzm = ddId.find('.videolzm')
              var videolzh = ddId.find('.videolzh')
              videols.text('00')
              videolzm.text('00')
              videolzh.text('00')
              recorder.start()
              indexs = setInterval(function(){
              videols.text(Number(videols.text())+1)
                if (Number(videols.text()) < 10){
                  videols.text('0' + Number(videols.text()))
                } else if(Number(videols.text()) > 59){
                  videols.text('00')
                  if (videolzm.text() < 9) {
                    videolzm.text('0' + (Number(videolzm.text())+1))
                  }else if (Number(videolzm.text()) < 59){
                    videolzm.text( Number(videolzm.text())+1)
                  }else{
                    videolzm.text('00')
                    if (videolzh.text() < 9) {
                      videolzh.text('0' + (Number(videolzh.text()) + 1))
                    }else{
                      videolzh.text(Number(videolzh.text()) + 1)
                    }
                  }
                }
              },1000)
            }else{
              ddId.find('.videolz').hide()
              recorder.stop()
              $(this).removeClass('active')
              clearInterval(indexs)
            }
          }
          isplay = !isplay
        };
        var buffers = [];
        recorder.ondataavailable = function (event) {
          buffers = event.data;
        }
        $('#downloadButton'+id).remove();
        $('body').append('<a href="" id="downloadButton'+id+'" style="display:none"></a>')
        var downloadButton = document.getElementById("downloadButton"+id);
        recorder.onstop = function () {
          var file = new File([buffers], "录制视频.mp4", {type: 'mpeg4', lastModified: Date.now()});
          var url = URL.createObjectURL(file);
          downloadButton.href = url;
          downloadButton.download = "录制视频.mp4";
          downloadButton.click();
          buffers = null;
        }
      }
    }
  }

</script>
<style lang='less' scoped>
.maskop{z-index: 1000;position:absolute;width:100%;height:100%;top:0;background:rgba(0,0,0,.5);}
.dialogk{position:absolute;;width:600px;padding:30px;left:0;right:0;top:25%;background:#fff;margin:0 auto;}
.closemask{background: #19be6b; color: #fff; position: absolute; width: 25px; height: 25px; text-align: center; line-height: 25px; border-radius: 50%; right: 5px; top: 5px;}
.op li i{font-size:26px;color:#fff;}

.swiper-slide{height:250px !important;}

.right-block {
    width: 82%;
    height: calc(90% - 81px);
    position: absolute;
    left: 17%;
    top: 10%;
}

.shrink-arrow {
  position: absolute;
  top: 50%;
  left: -28px;
  display: inline-block;
  border: 1px solid #0c66c7;
  border-radius: 3px;
  width:25px;
  font-size: 18px;
  background-color: #6aaff9;
  margin-left: 5px;
  color: #fff;
}

.user-name-tip {
  position: absolute;
  top: 8px;
  width: auto;
  left: 5%;
}

.user-duty {
  z-index: 2;
  top: -2px;
  // transform: rotate(315deg);
}

.right-block-chat {
  max-width: 0;
  // overflow: hidden;
  transition: max-width 0.2s;
  position: absolute;
  right: -1px;
  z-index: 10;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}

.fileLabel {
  position: absolute;
  bottom: 31px;
  z-index: 9;
  padding: 2px 8px;
  border-radius: 0;
}
.sendFileBtn {
  outline: none;
  border: 1px solid #dcdee2;
  line-height: 22px;
  width: 76px;
}

.videolz{position: absolute; width: 120px; right: 18px;bottom: 5px;color:#fff;z-index: 10;display: none; opacity: 1 !important}
.videolz i{display: inline-block;width: 8px;height: 8px;background: red;border-radius: 50%;margin-right:5px;}

@keyframes myfirst
{
  0%   {color:red;}

  100% {color:#fff;}
}

@-webkit-keyframes spin {
    from {
        -webkit-transform: rotate(0deg);
    }
    to {
        -webkit-transform: rotate(360deg);
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
        color:red;
    }
    to {
        transform: rotate(360deg);
        color:#fff;
    }
}

.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.active{
  -webkit-animation: spin 1s linear 1s 5 alternate;
  animation: spin 1s linear infinite;
}

.bigScreen .video-js {
  position: unset;
  background-color: #cedff5
}

.videos-pos {
  top: 65%;
  height: 256px;
}

/deep/.bigScreen .vjs-poster{
  background-color: #cedff5
}

.my-video-iview-icon {
  font-size: 28px;
  color: #2147d6;
}
</style>
