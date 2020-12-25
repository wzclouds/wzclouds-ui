var constant_rtc
var constant_vm = {temp: true};
var base_vm;
var header_vm;
var whiteBoard_vm;

function setMutedEvent (even, ele) {
  even.onclick = function (e) {
    ele.muted = !ele.muted
    console.log(ele.muted)
    var im = $(e.target).attr('class');
    if(im == 'iconfont icon-shengyinkai'){
      $(e.target).attr('class','iconfont icon-shengyinjingyin')
    }else{
      $(e.target).attr('class','iconfont icon-shengyinkai')
    }
  }
}

function setBigScreenEvent (ele) {
  var localVideo = $('.bigScreen').find('video')[0];
  localVideo.id = ele.id
  // $('.bigScreen').css('background-color', '#000');
  var a = $('.bigScreen-button')
  a.css('display','block')
  localVideo.srcObject = ele.srcObject
  localVideo.muted = true;
}

function setRTC (rtcTemp) {
  constant_rtc = rtcTemp
}

function setBaseVM (vm) {
  base_vm = vm
}

function setHeaderVM (vm) {
  header_vm = vm
}

function setMeetingVM (vm) {
  constant_vm = vm
}

function setWhiteBoardVM (vm) {
  whiteBoard_vm = vm
}

function setMeMsg (id) {
  constant_rtc.me = id
}

function setMeetingId (id) {
  constant_rtc.meetingId = id
}

function sendNotice(data) {
  if (!constant_rtc.meetingId) {
    base_vm.$Message.info('您当前还处于大厅，请先进入一个房间再邀请其他人加入会议!')
    return
  }
  if (data.targetIds.split(',').indexOf(constant_rtc.me.toString()) != -1) {
    base_vm.$Message.info('您无法操作您自己!')
    return
  }
  constant_rtc.socket.send(JSON.stringify({
    "eventName": "NOTICE",
    "serverFunc": "sayHello",
    "clientFunc": data.clientFunc || "retHello",
    "targetIds": data.targetIds,
    "data": {
      "received": false,
      "msg": data.msg,
      "meetingId": constant_rtc.meetingId
    }
  }));
  base_vm.$Message.info('操作成功!')
}

function isNormalMeeting(){
  if (!base_vm.$store.state.meetingInfo.meetingId || base_vm.$store.state.meetingInfo.type === 'tmp') {
    return false;
  }
  return true;
}

//复制剪贴板
function copyStr(str){
  var oInput = document.createElement('input');
  oInput.value = str;
  document.body.appendChild(oInput);
  oInput.select();
  document.execCommand("Copy");
  oInput.className = 'oInput';
  oInput.style.display='none';
}

//文件大小单位转换
function tranSize(data) {
    var bytes = data
    if (data.size === '0') {
       data.size = '-'
       return
    }
    if (bytes === 0) return '0 B';
    var k = 1024, // or 1024
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    bytes = bytes / Math.pow(k, i)
    bytes = bytes.toFixed(2) + ' ' + sizes[i];
    return bytes;
}

//动态设置侧边栏
function setMenu(data) {
  base_vm.$store.state.menus = data

  console.log(base_vm.$store.state.menus)
}

// 跳转会议
function jumpMeeting(meetingId) {
  var url = getMeetingPrefix() + meetingId;
  window.location.href = url
  base_vm.$router.go(0);
}

function getMeetingPrefix() {
  return window.location.origin + window.location.pathname + '#/home/';
}

// 定时函数
function socketOK(func){
  var o = setInterval(function(){
    if (base_vm.$store.state.socketTag) {
      func();
      clearInterval(o);
    }
  }, 1000);
}

// 退出方法
function loginOut(msg) {
  if (msg) {
    base_vm.$Message.error(msg);
  }
  resetData();
  base_vm.$router.push({
    path: '/Login'
  })
}

function resetData() {
  if (base_vm.$store.state.rtc) {
    base_vm.$store.state.rtc.socket.close();
    base_vm.$store.state.rtc = null;
  }
  base_vm.$store.state.eleData = {
    userId: '',
    userName: '',
    otherPhone: '',
    meetingId: '',
    password: '',
    talkType: 'hall',
    sendMessage: '',
    token: '',
    videolist: []
  };
  menuConst.home[2].subMenu = [];
  loginController.emptyLoginUserInfo();
}

// 白板相关
function send(type, data){
  var data = {
    eventName: 'NOTICE',
    serverFunc: type,
    data: data
  }
  constant_rtc.socket.send(JSON.stringify(data));
}

// function getSocket() {
//   if (!sock) {
//     sock = new WebSocket(url);
//     sock.onopen = function() {          //处理连接开启事件
//        console.log('Opening');
//        connect();
//      };

//      sock.onmessage = function(e) {      //处理信息
//        var data = typeof e.data == "string" ? JSON.parse(e.data) : e.data;
//        if (!data.msgType) {
//          return;
//        }
//        if (data.msgType === 'SHARP_PATH_DRAW'){
//          // addTalkDiv(data.data, "message1");
//          draw(data.data);
//        }
//        if (data.msgType === 'SHARP_REMOVE'){
//          // addTalkDiv(data.data, "message1");
//          removeItem(data.data);
//        }
//        if (data.msgType === 'SHARP_TRANSLETE'){
//          // addTalkDiv(data.data, "message1");
//          var data = data.data
//          if (data.childType) {
//            if (data.childType == 'move') {
//              moveItem(data.data);
//            } else if (data.childType == 'scale') {
//              scaleItem(data.data);
//            }
//          }
//        }
//      };

//      sock.onclose = function() {         //处理连接关闭事件
//        console.log('Closing');
//      };
//   }
//  return sock;
// }

// 心跳检测
function PING(data){
  console.log("ping----")
  send('ping', data);
}

function SHARP_PATH_DRAW(data){
  send('sharpPathDraw', data);
}


function SHARP_REMOVE(data){
  var subData = {'ids': data}
  send('sharpRemove', subData);
  whiteBoard_vm.removeSharp(subData);
}

function SHARP_TRANSLETE(data, childType){
  var subData = {};
  subData.data = data;
  subData.childType = childType;
  send('sharpTranslete', subData);
}
