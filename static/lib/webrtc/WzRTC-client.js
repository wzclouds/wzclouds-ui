var targetIds = document.getElementById("targetIds");
const WzRTC = function () {

  //创建本地流
  let gThat;
  let PeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection);
  let getUserMedia = (navigator.getUserMedia ||//旧版API
    navigator.mediaDevices.getUserMedia ||//最新的标准API
    navigator.webkitGetUserMedia ||  //webkit核心浏览器
    navigator.mozGetUserMedia ||     //firfox浏览器
    navigator.msGetUserMedia
  );

  let nativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);
  let nativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);


  const iceServer = {
    "iceServers": [
      {
        "url": "turn:" + location.hostname + ":3478",
        "username": "wz",
        "credential": "123456"
      }
      // , {
      //   "url": "stun:stun.l.google.com:19302"
      // }
    ]
  };
  let packetSize = 1000;

  /*                       事件处理器                       */
  function EventEmitter() {
    this.events = {};
  }

  //绑定事件函数
  EventEmitter.prototype.on = function (eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
  };
  //触发事件函数
  EventEmitter.prototype.emit = function (eventName, _) {
    var events = this.events[eventName],
      args = Array.prototype.slice.call(arguments, 1),
      i, m;

    if (!events) {
      return;
    }
    for (i = 0, m = events.length; i < m; i++) {
      events[i].apply(null, args);
    }
  };


  /**********************************************************/
  /*                   流及信道建立部分                       */

  /**********************************************************/


  /*******************基础部分*********************/
  function wzrtc() {
    //本地media stream
    this.localMediaStream = null;
    //所在房间
    this.meetingId = "";
    //接收文件时用于暂存接收文件
    this.fileData = {};
    //本地WebSocket连接
    this.socket = null;
    //本地socket的id，由后台服务器创建
    this.me = null;
    //保存所有与本地相连的peer connection， 键为socket id，值为PeerConnection类型
    this.peerConnections = {};
    //保存所有与本地连接的socket的id
    this.connections = [];
    //初始时需要构建链接的数目
    this.numStreams = 0;
    //初始时已经连接的数目
    this.initializedStreams = 0;
    //保存所有的data channel，键为socket id，值通过PeerConnection实例的createChannel创建
    this.dataChannels = {};
    //保存所有发文件的data channel及其发文件状态
    this.fileChannels = {};
    //保存所有接受到的文件
    this.receiveFiles = {};

    this.enableDataChannels = true;
  }

  //继承自事件处理器，提供绑定事件和触发事件的功能
  wzrtc.prototype = new EventEmitter();


  /*************************服务器连接部分***************************/

  wzrtc.prototype.connect = function (server, eleData) {
    var socket,
      that = this;
    try {
      socket = this.socket = new WebSocket(server);
    } catch (err) {
      constant_vm.$Message.error("网络链接错误，请刷新页面重试");
    }
    socket.onopen = function () {
      that.join(eleData);
    };



    socket.onmessage = function (message) {
      var json = JSON.parse(message.data);
      if (json.eventName) {
        if (json.eventName == 'NOTICE'){
          that.emit(json.clientFunc, json);
        } else if (json.eventName == 'EXCEPTION'){
          that.emit('exception', json);
        } else {
          that.emit(json.eventName, json.data);
        }
      } else {
        that.emit("socket_receive_message", socket, json);
      }
    };

    socket.onerror = function (error) {
      that.emit("socket_error", error, socket);
    };

    socket.onclose = function (data) {
      console.log("关闭socket")
      if (that.localMediaStream){
        that.localMediaStream.close();
        var pcs = that.peerConnections;
        for (i = pcs.length; i--;) {
          that.closePeerConnection(pcs[i]);
        }
        that.peerConnections = [];
        that.dataChannels = {};
        that.fileChannels = {};
        that.connections = [];
        that.fileData = {};
        that.emit('socket_closed', socket);
      }
    };

    // this.on('_getOnlineList', function (data) {
    //   that.emit("getOnlineList", data);
    // })

    // this.on('_hasConnectionJoin', function (data) {
    //   that.emit("getOnlineList", data);
    // })

    // this.on('_hasConnectionRemove', function (data) {
    //   that.emit("getOnlineList", data);
    // })
    this.on('_peers', function (data) {
      //获取所有服务器上的
      // constant_vm.passwordTag = false;
      // constant_vm.joinTag = true;
      that.connections = data.connections;
      that.me = data.you;
      that.emit("get_peers", that.connections);
      that.emit('connected', socket);
    });

    this.on('join_success', function (data) {
      // socket连接成功回调
      base_vm.closeMask();
      if (data.data.meetingId) {
        base_vm.$store.state.meetingInfo = data.data;
      }

      setInterval(PING, 1000 * 40);
      base_vm.$store.state.socketTag = true;
    });

    this.on('join_error', function (data) {
      // socket连接成功回调
      base_vm.closeMask();
      base_vm.joinError(data);
    });


    this.on('meeting_password_error', function (data) {
      base_vm.meetingPasswordError(data);
    });

    this.on('meeting_password_success', function (data) {
      // socket连接成功回调
      base_vm.meetingPasswordSuccess(data);
    });

    this.on('meeting_client_out', function (data) {
      // socket连接成功回调
      base_vm.meetingClientOut(data);
    });

    this.on('onTalk', function(data){
      that.emit("on_talk", data);
    })

    this.on('onTalkSystem', function(data){
      that.emit("on_talk_system", data);
    })

    this.on('_peers', function (data) {
      //获取所有服务器上的
      // constant_vm.passwordTag = false;
      // constant_vm.joinTag = true;
      that.connections = data.connections;
      that.me = data.you;
      that.emit("get_peers", that.connections);
      that.emit('connected', socket);
    });

    this.on('exception', function(data){
      constant_vm.$Message.info(data.data.msg);
      that.emit(data.data.func, data)
    })

    //超出会议人数上限
    this.on('clientSizeOut', function(data){
      constant_vm.joinTag = false;
      localStorage.removeItem('meetingId');
    })

    // -------------------------------白板相关

    this.on('retSharpPathDraw', function(data){
      draw(data.data);
    })

    this.on('retSharpRemove', function(data){
      removeItem(data.data);
    })

    this.on('retSharpTranslete', function(data){
      mdata = data.data
      if (mdata.childType) {
        if (mdata.childType == 'move') {
          moveItem(mdata.data);
        } else if (mdata.childType == 'scale') {
          scaleItem(mdata.data);
        }
      }
    })

    // -------------------------------白板相关结束

    this.on("_ice_candidate", function (data) {
      var candidate
      if (data.candidatePC){
        candidate = new nativeRTCIceCandidate(data.candidatePC);
      } else {
        data.sdpMid = data.id
        data.sdpMLineIndex = data.label
        candidate = new nativeRTCIceCandidate(data);
      }
      var pc = that.peerConnections[data.socketId];
      if (!pc || !pc.remoteDescription.type) {
        //push candidate onto queue...
        console.log("remote not set!")
      }
      pc.addIceCandidate(candidate);
      that.emit('get_ice_candidate', candidate);
    });

    this.on('_new_peer', function (data) {
      that.connections.push(data);
      var pc = that.createPeerConnection(data),
        i, m;
      pc.addStream(that.localMediaStream);
      that.emit('new_peer', data);
    });

    this.on('_remove_peer', function (data) {
      var sendId;
      that.closePeerConnection(that.peerConnections[data.socketId]);
      delete that.peerConnections[data.socketId];
      delete that.dataChannels[data.socketId];
      for (sendId in that.fileChannels[data.socketId]) {
        that.emit("send_file_error", new Error("Connection has been closed"), data.socketId, sendId, that.fileChannels[
          data.socketId][sendId].file);
      }
      delete that.fileChannels[data.socketId];
      that.emit("remove_peer", data.socketId);
    });

    this.on('_offer', function (data) {
      that.receiveOffer(data.socketId, data.sdp);
      that.emit("get_offer", data);
    });

    this.on('_answer', function (data) {
      that.receiveAnswer(data.socketId, data.sdp);
      that.emit('get_answer', data);
    });

    this.on('send_file_error', function (error, socketId, sendId, file) {
      that.cleanSendFile(sendId, socketId);
    });

    this.on('receive_file_error', function (error, sendId) {
      that.cleanReceiveFile(sendId);
    });

    this.on('ready', function () {
      that.createPeerConnections();
      that.addStreams();
      that.addDataChannels();
      that.sendOffers();
      that.setAudioMonitor(that.localMediaStream, null)
    });
  };


  /*************************流处理部分*******************************/
  //访问用户媒体设备的兼容方法
  function getUserMediaFun(constraints, success, error) {
    if (navigator.mediaDevices.getUserMedia) {
      //最新的标准API
      navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    } else if (navigator.webkitGetUserMedia) {
      //webkit核心浏览器
      navigator.webkitGetUserMedia(constraints, success, error)
    } else if (navigator.mozGetUserMedia) {
      //firfox浏览器
      navigator.mozGetUserMedia(constraints, success, error);
    } else if (navigator.getUserMedia) {
      //旧版API
      navigator.getUserMedia(constraints, success, error);
    } else {
      that.emit("stream_create_error", new Error('WebRTC is not yet supported in this browser.'));
    }
  }

  function createStreamSuccess(stream) {
    if (gThat) {
      gThat.localMediaStream = stream;
      gThat.initializedStreams++;
      gThat.emit("stream_created", stream);
      if (gThat.initializedStreams === gThat.numStreams) {
        gThat.emit("ready");
      }
    }
  }

  function createStreamError(error) {
    if (gThat) {
      // gThat.emit("stream_create_error", error);
      getUserMediaFun({video: false, audio: true}, createStreamSuccess, createStreamError2);
    }
  }
  function createStreamError2(error) {
    getUserMediaFun({video: true, audio: false}, createStreamSuccess, function(error){constant_vm.$Message.error('摄像头和麦克风至少需要开启一个才能正常使用！')});
  }

  wzrtc.prototype.joinVideo = function (eleData) {
    var that = this;
    that.socket.send(JSON.stringify({
      "eventName": "__joinVideo",
      "data": {
      }
    }));
  }
  wzrtc.prototype.join = function (eleData) {
    var that = this;
    that.socket.send(JSON.stringify({
      "eventName": "__joinUser",
      "data": {
        "token": eleData.token,
        "name": eleData.userName,
        "photo": eleData.photo,
        "meetingId": eleData.meetingId,
        "meetingPassword": eleData.meetingPassword
      }
    }));
    // 打开等待遮罩
    base_vm.openMask();
    that.socket.send(JSON.stringify({
      "eventName": "__getOnlineList",
      "data": {
        "id": eleData.userId,
        "name": eleData.userName,
        "photo": eleData.photo,
        "meetingId": eleData.meetingId
      }
    }));
    if (eleData.meetingId) {
      eleData.talkType = 'meeting'
    }
    that.emit("socket_opened", that.socket);
  }

  wzrtc.prototype.createStream = function (options) {
    var that = this;
    gThat = this;
    options.video = !!options.video;
    options.audio = !!options.audio;

    if (getUserMedia) {
      this.numStreams++;
      // 调用用户媒体设备, 访问摄像头
      getUserMediaFun(options, createStreamSuccess, createStreamError);
    } else {
      that.emit("stream_create_error", new Error('WebRTC is not yet supported in this browser.'));
    }
  };

  //将本地流添加到所有的PeerConnection实例中
  wzrtc.prototype.addStreams = function () {
    const vm = this;
    var i, m,
      stream,
      connection;
    for (connection in vm.peerConnections) {
      // vm.peerConnections[connection].addStream(vm.localMediaStream);
      vm.localMediaStream.getTracks().forEach(
        track => vm.peerConnections[connection].addTrack(track, vm.localMediaStream)
    );
    }
  };

  // 将流绑定到video标签上用于输出
  wzrtc.prototype.attachStream = function (stream, domId, vm) {
    console.log("domId---" + domId + "    " + "stream--:" + stream);
    var element = vm.swiperSlideEle.find(`video[id^="${domId}"]`);
    try {
      element[0].style.background = '#c7c7c7'
      var elementBtnMuted = vm.swiperSlideEle.find(`div[id^="${domId}-muted"]`);
      vm.swiperSlideEle.find(`div[id^="${domId}-box"]`).find('.culmelarge')[0].style.display= 'block'
      if (!element[0]) {
        vm.$Message.error('连接超时，请重新加入房间！')
      }
      if (navigator.mediaDevices.getUserMedia) {
        element[0].srcObject = stream;
        console.log(stream)
        constant_vm.videoREGSelf(element[0], domId)
      } else {
        element[0].src = webkitURL.createObjectURL(stream);
      }

      // 处理其他用户静音事件
      setMutedEvent(elementBtnMuted[0], element[0]);

    } catch(e) {
      console.log("加载其他用户出现问题");
      // this.socket.close();
    }

    element[0].play();

    // 双击大视频事件
    element.dblclick(function(){
      setBigScreenEvent(element[0])
    })
    // 处理其他用户静音事件
    setMutedEvent(elementBtnMuted, element[0])
    var btns = $('#'+ domId + '-box').find('.button-group')
    Object.keys(btns).forEach(function (key){
      if (!isNaN(key)){
        btns[key].style.display= 'block'
      }
    })
  };

  // 关闭摄像头
  wzrtc.prototype.closeVideo = function(bool) {
    this.localMediaStream.getVideoTracks().forEach(function (track) {
      track.enabled = !!bool;
    });
  }

  // 关闭麦克风
  wzrtc.prototype.closeAudio = function(bool) {
    this.localMediaStream.getAudioTracks().forEach(function (track) {
      track.enabled = !!bool;
    });
  }

  /***********************信令交换部分*******************************/


  //向所有PeerConnection发送Offer类型信令
  wzrtc.prototype.sendOffers = function () {
    var i, m,
      pc,
      that = this,
      mediaConstraints = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      };
    pcCreateOfferCbGen = function (pc, socketId) {
      return function (session_desc) {
        pc.setLocalDescription(session_desc);
        that.socket.send(JSON.stringify({
          "eventName": "__offer",
          "data": {
            "sdp": session_desc,
            "socketId": socketId
          }
        }));
      };
    },
      pcCreateOfferErrorCb = function (error) {
        console.log(error);
      };
    for (i = 0, m = this.connections.length; i < m; i++) {
      pc = this.peerConnections[this.connections[i].id];
      pc.createOffer(pcCreateOfferCbGen(pc, this.connections[i].id), pcCreateOfferErrorCb, mediaConstraints);
    }
  };

  //接收到Offer类型信令后作为回应返回answer类型信令
  wzrtc.prototype.receiveOffer = function (socketId, sdp) {
    var pc = this.peerConnections[socketId];
    this.sendAnswer(socketId, sdp);
  };

  //发送answer类型信令
  wzrtc.prototype.sendAnswer = function (socketId, sdp) {
    var pc = this.peerConnections[socketId];
    var that = this;
    pc.setRemoteDescription(new nativeRTCSessionDescription(sdp));
    pc.createAnswer(function (session_desc) {
      pc.setLocalDescription(session_desc);
      that.socket.send(JSON.stringify({
        "eventName": "__answer",
        "data": {
          "socketId": socketId,
          "sdp": session_desc
        }
      }));
    }, function (error) {
      console.log(error);
    });
  };

  //接收到answer类型信令后将对方的session描述写入PeerConnection中
  wzrtc.prototype.receiveAnswer = function (socketId, sdp) {
    var pc = this.peerConnections[socketId];
    pc.setRemoteDescription(new nativeRTCSessionDescription(sdp));
  };


  /***********************点对点连接部分*****************************/


  //创建与其他用户连接的PeerConnections
  wzrtc.prototype.createPeerConnections = function () {
    var i, m;
    for (i = 0, m = this.connections.length; i < m; i++) {
      this.createPeerConnection(this.connections[i]);
    }
  };

  //创建单个PeerConnection
  wzrtc.prototype.createPeerConnection = function (conn) {
    var that = this;
    var pc = new PeerConnection(iceServer);
    pc.userName = conn.name;
    console.log(pc.userName, '加入连接')
    pc.enableDataChannels = that.enableDataChannels;
    this.peerConnections[conn.id] = pc;
    pc.onicecandidate = function (evt) {
      if (evt.candidate)
        that.socket.send(JSON.stringify({
          "eventName": "__ice_candidate",
          "data": {
            "id": evt.candidate.sdpMid,
            "label": evt.candidate.sdpMLineIndex,
            "candidate": evt.candidate.candidate,
            "socketId": conn.id,
            "candidatePC": evt.candidate
          }
        }));
      that.emit("pc_get_ice_candidate", evt.candidate, conn.id, pc);
    };

    pc.onopen = function () {
      that.emit("pc_opened", conn.id, pc);
    };

    pc.onaddstream = function (evt) {
      that.emit('pc_add_stream', evt.stream, conn.id, pc);
    };

    pc.ondatachannel = function (evt) {
      that.addDataChannel(conn.id, evt.channel);
      that.emit('pc_add_data_channel', evt.channel, conn.id, pc);
    };
    return pc;
  };

  //关闭PeerConnection连接
  wzrtc.prototype.closePeerConnection = function (pc) {
    if (!pc) return;
    pc.close();
  };


  /***********************数据通道连接部分*****************************/


  //消息广播
  wzrtc.prototype.broadcast = function (message) {
    var socketId;
    for (socketId in this.dataChannels) {
      this.sendMessage(message, socketId);
    }
  };

  //发送消息方法
  wzrtc.prototype.sendMessage = function (message, socketId, type) {
    if (this.dataChannels[socketId].readyState.toLowerCase() === 'open') {
      this.dataChannels[socketId].send(JSON.stringify({
        type: type || "__msg",
        data: message
      }));
    }
  };

  wzrtc.prototype.volumeChange = function (volume, treshold) {
    const vm = this;
    this.localVolumeChange(volume)
    if (!vm.hardMuted && vm.peerConnections) {
      // FIXME: should use sendDirectlyToAll, but currently has different semantics wrt payload
      Object.keys(vm.peerConnections).forEach(function (key) {
        if (vm.peerConnections[key].enableDataChannels) {
          Object.keys(vm.dataChannels).forEach(function(key){
            // var  channel = that.dataChannels[key];
            vm.sendMessage({socketId: vm.me, volume: volume}, key, '__volume')
          })
        }
      });
    }
  };

  wzrtc.prototype.localVolumeChange = function (volume, id = '') {
    if (!isNaN(volume)){
      var ele = $('#culme' + id)
      var height = parseInt(((volume + 100))/10) * 10 + "%"
      ele.css('height', height)
    }
  }

  wzrtc.prototype.setAudioMonitor = function (stream, harkOptions) {
    var audio = hark(stream, harkOptions);
    var self = this;
    var timeout;

    audio.on('speaking', function () {
      self.emit('speaking');
    });

    audio.on('stopped_speaking', function () {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(function () {
        self.emit('stoppedSpeaking');
      }, 1000);
    });
    audio.on('volume_change', function (volume, threshold) {
      self.volumeChange(volume, threshold);
    });

    // this._audioMonitors.push({audio: audio, stream: stream});
  }

  //对所有的PeerConnections创建Data channel
  wzrtc.prototype.addDataChannels = function () {
    var connection;
    for (connection in this.peerConnections) {
      this.createDataChannel(connection);
    }
  };

  //对某一个PeerConnection创建Data channel
  wzrtc.prototype.createDataChannel = function (socketId, label) {
    var pc, key, channel;
    pc = this.peerConnections[socketId];

    if (!socketId) {
      this.emit("data_channel_create_error", socketId, new Error("attempt to create data channel without socket id"));
    }

    if (!(pc instanceof PeerConnection)) {
      this.emit("data_channel_create_error", socketId, new Error("attempt to create data channel without peerConnection"));
    }
    try {
      channel = pc.createDataChannel(label);
    } catch (error) {
      this.emit("data_channel_create_error", socketId, error);
    }

    return this.addDataChannel(socketId, channel);
  };

  //为Data channel绑定相应的事件回调函数
  wzrtc.prototype.addDataChannel = function (socketId, channel) {
    var that = this;
    channel.onopen = function () {
      console.log('打开通道!')
      if (!that.dataChannels[socketId]) {
        that.dataChannels[socketId] = channel;
      }
      that.emit('data_channel_opened', channel, socketId);
    };

    channel.onclose = function (event) {
      delete that.dataChannels[socketId];
      console.log('关闭通道!')
      that.emit('data_channel_closed', channel, socketId);
    };

    channel.onmessage = function (message) {
      var json;
      json = JSON.parse(message.data);
      if (json.type === '__file') {
        /*that.receiveFileChunk(json);*/
        that.parseFilePacket(json, socketId);
      } else if (json.type === '__volume') {
        that.localVolumeChange(json.data.volume, json.data.socketId)
      } else {
        that.emit('data_channel_message', channel, socketId, json.data);
      }
    };

    channel.onerror = function (err) {
      that.emit('data_channel_error', channel, socketId, err);
    };

    return channel;
  };


  /**********************************************************/
  /*                                                        */
  /*                       文件传输                         */
  /*                                                        */
  /**********************************************************/

  /************************公有部分************************/

  //解析Data channel上的文件类型包,来确定信令类型
  wzrtc.prototype.parseFilePacket = function (json, socketId) {
    var signal = json.signal,
      that = this;
    if (signal === 'ask') {
      that.receiveFileAsk(json.sendId, json.name, json.size, socketId, json.userName);
    } else if (signal === 'accept') {
      that.receiveFileAccept(json.sendId, socketId);
    } else if (signal === 'refuse') {
      that.receiveFileRefuse(json.sendId, socketId);
    } else if (signal === 'chunk') {
      that.receiveFileChunk(json.data, json.sendId, socketId, json.last, json.percent);
    } else if (signal === 'close') {
      //TODO
    }
  };

  /***********************发送者部分***********************/


  //通过Dtata channel向房间内所有其他用户广播文件
  wzrtc.prototype.shareFile = function (dom) {
    var socketId,
      that = this;
    for (socketId in that.dataChannels) {
      that.sendFile(dom, socketId);
    }
  };

  wzrtc.prototype.sayHello = function (eleData) {
    var that = this;
    var message = eleData.sendMessage
    that.socket.send(JSON.stringify({
      "eventName": "NOTICE",
      "serverFunc": "onTalk",
      "clientFunc": "onTalk",
      "sendId": eleData.userId,
      "meetingId": eleData.meetingId,
      "name": eleData.userName,
      "type": eleData.talkType || 'meeting',
      "targetIds": eleData.otherPhone,
      "data": {
        "msg": message
      }
    }))
  };
  //
  // wzrtc.prototype.joinMeeting = function (meeting) {
  //   var that = this;
  //   that.socket.send(JSON.stringify({
  //     "eventName": "__join",
  //     "data": {
  //       "meetingId": meetingId
  //     }
  //   }))
  // }

  //向某一单个用户发送文件
  wzrtc.prototype.sendFile = function (dom, socketId) {
    var that = this,
      file,
      reader,
      fileToSend,
      sendId;
    if (typeof dom === 'string') {
      dom = document.getElementById(dom);
    }
    if (!dom) {
      that.emit("send_file_error", new Error("Can not find dom while sending file"), socketId);
      return;
    }
    if (!dom.files || !dom.files[0]) {
      that.emit("send_file_error", new Error("No file need to be sended"), socketId);
      return;
    }
    file = dom.files[0];
    that.fileChannels[socketId] = that.fileChannels[socketId] || {};
    sendId = that.getRandomString();
    fileToSend = {
      file: file,
      state: "ask"
    };
    that.fileChannels[socketId][sendId] = fileToSend;
    that.sendAsk(socketId, sendId, fileToSend);
    that.emit("send_file", sendId, socketId, file);
  };

  //发送多个文件的碎片
  wzrtc.prototype.sendFileChunks = function () {
    var socketId,
      sendId,
      that = this,
      nextTick = false;
    for (socketId in that.fileChannels) {
      for (sendId in that.fileChannels[socketId]) {
        if (that.fileChannels[socketId][sendId].state === "send") {
          nextTick = true;
          that.sendFileChunk(socketId, sendId);
        }
      }
    }
    if (nextTick) {
      setTimeout(function () {
        that.sendFileChunks();
      }, 10);
    }
  };

  //发送某个文件的碎片
  wzrtc.prototype.sendFileChunk = function (socketId, sendId) {
    var that = this,
      fileToSend = that.fileChannels[socketId][sendId],
      packet = {
        type: "__file",
        signal: "chunk",
        sendId: sendId
      },
      channel;

    fileToSend.sendedPackets++;
    fileToSend.packetsToSend--;


    if (fileToSend.fileData.length > packetSize) {
      packet.last = false;
      packet.data = fileToSend.fileData.slice(0, packetSize);
      packet.percent = fileToSend.sendedPackets / fileToSend.allPackets * 100;
      that.emit("send_file_chunk", sendId, socketId, fileToSend.sendedPackets / fileToSend.allPackets * 100, fileToSend.file);
    } else {
      packet.data = fileToSend.fileData;
      packet.last = true;
      fileToSend.state = "end";
      that.emit("sended_file", sendId, socketId, fileToSend.file);
      that.cleanSendFile(sendId, socketId);
    }

    channel = that.dataChannels[socketId];

    if (!channel) {
      that.emit("send_file_error", new Error("Channel has been destoried"), socketId, sendId, fileToSend.file);
      return;
    }
    channel.send(JSON.stringify(packet));
    fileToSend.fileData = fileToSend.fileData.slice(packet.data.length);
  };

  //发送文件请求后若对方同意接受,开始传输
  wzrtc.prototype.receiveFileAccept = function (sendId, socketId) {
    var that = this,
      fileToSend,
      reader,
      initSending = function (event, text) {
        fileToSend.state = "send";
        fileToSend.fileData = event.target.result;
        fileToSend.sendedPackets = 0;
        fileToSend.packetsToSend = fileToSend.allPackets = parseInt(fileToSend.fileData.length / packetSize, 10);
        that.sendFileChunks();
      };
    fileToSend = that.fileChannels[socketId][sendId];
    reader = new window.FileReader(fileToSend.file);
    reader.readAsDataURL(fileToSend.file);
    reader.onload = initSending;
    that.emit("send_file_accepted", sendId, socketId, that.fileChannels[socketId][sendId].file);
  };

  //发送文件请求后若对方拒绝接受,清除掉本地的文件信息
  wzrtc.prototype.receiveFileRefuse = function (sendId, socketId) {
    var that = this;
    that.fileChannels[socketId][sendId].state = "refused";
    that.emit("send_file_refused", sendId, socketId, that.fileChannels[socketId][sendId].file);
    that.cleanSendFile(sendId, socketId);
  };

  //清除发送文件缓存
  wzrtc.prototype.cleanSendFile = function (sendId, socketId) {
    var that = this;
    if (!that.fileChannels[socketId]) {
      constant_vm.$Message.info('请先选择文件！')
    }
    delete that.fileChannels[socketId][sendId];
  };

  //发送文件请求
  wzrtc.prototype.sendAsk = function (socketId, sendId, fileToSend) {
    var that = this,
      channel = that.dataChannels[socketId],
      packet;
    if (!channel) {
      that.emit("send_file_error", new Error("Channel has been closed"), socketId, sendId, fileToSend.file);
    }
    packet = {
      name: fileToSend.file.name,
      size: fileToSend.file.size,
      userName: constant_vm.eleData.userName,
      sendId: sendId,
      type: "__file",
      signal: "ask"
    };
    channel.send(JSON.stringify(packet));
  };

  //获得随机字符串来生成文件发送ID
  wzrtc.prototype.getRandomString = function () {
    return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
  };

  /***********************接收者部分***********************/


  //接收到文件碎片
  wzrtc.prototype.receiveFileChunk = function (data, sendId, socketId, last, percent) {
    var that = this,
      fileInfo = that.receiveFiles[sendId];
    if (!fileInfo.data) {
      fileInfo.state = "receive";
      fileInfo.data = "";
    }
    fileInfo.data = fileInfo.data || "";
    fileInfo.data += data;
    if (last) {
      fileInfo.state = "end";
      that.getTransferedFile(sendId);
    } else {
      that.emit("receive_file_chunk", sendId, socketId, fileInfo.name, percent);
    }
  };

  //接收到所有文件碎片后将其组合成一个完整的文件并自动下载
  wzrtc.prototype.getTransferedFile = function (sendId) {
    var that = this,
      fileInfo = that.receiveFiles[sendId],
      hyperlink = document.createElement("a"),
      mouseEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
    hyperlink.href = fileInfo.data;
    hyperlink.target = '_blank';
    hyperlink.download = fileInfo.name || dataURL;

    hyperlink.dispatchEvent(mouseEvent);
    (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
    that.emit("receive_file", sendId, fileInfo.socketId, fileInfo.name);
    that.cleanReceiveFile(sendId);
  };

  //接收到发送文件请求后记录文件信息
  wzrtc.prototype.receiveFileAsk = function (sendId, fileName, fileSize, socketId, userName) {
    var that = this;
    that.receiveFiles[sendId] = {
      socketId: socketId,
      state: "ask",
      name: fileName,
      size: fileSize
    };
    that.emit("receive_file_ask", sendId, socketId, fileName, fileSize, userName);
  };

  //发送同意接收文件信令
  wzrtc.prototype.sendFileAccept = function (sendId) {
    var that = this,
      fileInfo = that.receiveFiles[sendId],
      channel = that.dataChannels[fileInfo.socketId],
      packet;
    if (!channel) {
      that.emit("receive_file_error", new Error("Channel has been destoried"), sendId, socketId);
    }
    packet = {
      type: "__file",
      signal: "accept",
      sendId: sendId
    };
    channel.send(JSON.stringify(packet));
  };

  //发送拒绝接受文件信令
  wzrtc.prototype.sendFileRefuse = function (sendId) {
    var that = this,
      fileInfo = that.receiveFiles[sendId],
      channel = that.dataChannels[fileInfo.socketId],
      packet;
    if (!channel) {
      that.emit("receive_file_error", new Error("Channel has been destoried"), sendId, socketId);
    }
    packet = {
      type: "__file",
      signal: "refuse",
      sendId: sendId
    };
    channel.send(JSON.stringify(packet));
    that.cleanReceiveFile(sendId);
  };

  //清除接受文件缓存
  wzrtc.prototype.cleanReceiveFile = function (sendId) {
    var that = this;
    delete that.receiveFiles[sendId];
  };

  return new wzrtc();
};
