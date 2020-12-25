<!-- 门户后台管理首页 -->
<template>
  <Content>
    <div>
      <div class="canvas-head">
        <div class="center leftmenu utils">
          <span click-btn="select" class="dot-btn utils-bar" original-title="指针" @click="pointers()">
            <i class="icons iconmove"></i>
          </span>
          <span click-btn="draw" class="dot-btn active utils-bar" original-title="画笔" disabletitle="true" @click="pen()">
            <i class="icons iconpen"></i>
            <div class="canvas-panel-popup padding draw-settings-panel" refer="draw" @click.stop style="display: none">
              <div class="brush-thinkness">
                  <Slider class="brush-thinkness" v-model="lineStyle.thinkness" :max="10"></Slider>
                <div class="desc">
                  <span>细</span>
                  <span>粗</span>
                </div></div>
                <div class="color-palette" id="colors">
                  <span class="color-item" color="#C0C9D6" style="background-color: #C0C9D6;"></span>
                  <span class="color-item" color="#41D7B7" style="background-color: #41D7B7;"></span>
                  <span class="color-item" color="#9FDF75" style="background-color: #9FDF75;"></span>
                  <span class="color-item" color="#FFDA55" style="background-color: #FFDA55;"></span>
                  <span class="color-item selected" color="#939AA8" style="background-color: #939AA8;"></span>
                  <span class="color-item" color="#58B1FC" style="background-color: #58B1FC;"></span>
                  <span class="color-item" color="#4386F5" style="background-color: #4386F5;"></span>
                  <span class="color-item" color="#FD8342" style="background-color: #FD8342;"></span>
                  <span class="color-item" color="#1D2129" style="background-color: #1D2129;"></span>
                  <span class="color-item" color="#DC74FC" style="background-color: #DC74FC;"></span>
                  <span class="color-item" color="#9C27B0" style="background-color: #9C27B0;"></span>
                  <span class="color-item" color="#FC3A3E" style="background-color: #FC3A3E;"></span>
                </div>
              </div>
            </span>
            <span click-btn="text" class="dot-btn utils-bar" original-title="文本(未实现) ">
              <i class="icons iconword"></i>
            </span>
            <span click-btn="image" class="dot-btn utils-bar" original-title="上传 (4)
              支持Word、Excel、
              PPT、PDF格式" disabletitle="true"  @click="file()">
              <i class="icons iconshangchuan-"></i>
              <div class="canvas-panel-popup upload-setting-panel" refer="upload" style="display: none">
                <div class="list">
                  <div href="javascript:;" class="file">选择图片
                      <input id="img" type="file" @change="uploadImage">
                  </div>
                  <!-- <div class="list-item" tit="image">
                    <input type="file" class="text" @change="uploadImage">上传图片</input>
                  </div> -->
                </div>
              </div>
            </span>
            <span click-btn="note" class="dot-btn utils-bar" original-title="便签(未实现)">
              <i class="icons iconnote"></i>
            </span>
            <span click-btn="shapeLib" class="dot-btn utils-bar" original-title="图库(未实现)">
              <i class="icons iconsquare" tit="square"></i>
            </span>
            <span click-btn="delete" class="dot-btn utils-bar" original-title="橡皮" @click="eraser(this)">
              <i class="icons iconeraser"></i>
            </span>
            <span click-btn="clear">
              <div class="canvas-panel-popup clear-panel" refer="clear" style="left: -50px; display: none">
                <div class="list">
                  <div class="list-item" tit="clear-only" @click.stop @click="removeAllMine()">清除我的痕迹</div>
                  <div class="list-item" tit="clear-all" @click.stop @click="removeAll()">清屏</div>
                </div>
              </div>
            </span>
          </div>
      </div>

      <div class="canvas-selected-container">
        <div class="canvas-selected select_ground ground_transform" id="selectGround" rect-refer="LZcRMXRg5855">
          <span resize-mode="lt" v-if="isEdit"></span>
          <span resize-mode="rt" v-if="isEdit"></span>
          <span resize-mode="lb" v-if="isEdit"></span>
          <span resize-mode="rb" v-if="isEdit"></span>
          <span resize-mode="ll" v-if="isEdit"></span>
          <span resize-mode="tt" v-if="isEdit"></span>
          <span resize-mode="rr" v-if="isEdit"></span>
          <span resize-mode="bb" v-if="isEdit"></span>
        </div>
      </div>

      <div class="canvas-app">
        <svg id="svg" style="width:100%; height:100%" class="cursor-draw" >

        </svg>
      </div>
    </div>
  </Content>
</template>

<script>
import apiList from '@/view/meeting/api/whiteboardApi'
import comApi from '@/api/comApiList'
import mainBar from '@/components/hengyun/mainBar'
export default {
  name: 'WhiteBoard',
  components: {
    'main-bar': mainBar
  },
  data() {
    return {
      sock: null,
      svg: null,
      canvasMain: null,
      tempPath: [],
      cursor: {},
      isEdit: false,
      isDraw: false,
      isChange: false,
      cursorType: 'pen',
      meetingId: null,
      lineStyle: {
        color: '#939AA8',
        thinkness: 2,
        meetingId: null
      },
      lineList: {
        // id: {
        //   path: '',
        //   color: '',
        //   thinkness: '',
        //   user: '',
        //   matrix: [],
        //   type: '',
        //   url: '',
        //   width: '',
        //   height: '',
        //   windowX: '',
        //   windowY: '',
        //   centPoint: ''
        // }
      },
      curren:{
        currentX: 0,
        currentY: 0,
        currentMatrix: 0,
      },
      windowSize: {
        x: document.body.clientWidth,
        y: document.body.clientHeight
      }
    }
  },
  created() {
    base_vm.setMenu();
    setWhiteBoardVM(this);
    this.cursor.pointer = "url(" + require('@static/imgs/pointer.png') +") 6 1, auto"
    this.cursor.pen = "url(" + require('@static/imgs/pen.png') +") 5 28, auto"
    this.cursor.eraser =  "url(" + require('@static/imgs/ca.png') +") 12 28, auto"
  },
  mounted() {
    var meetingId = loginController.getMeetingId() || this.$route.params.meetingId
    if (!meetingId) {
      this.$Message.error("请先加入一个房间!");
      this.$router.push({
        path: '/home'
      })
      return;
    }
    this.svg = d3.select('#svg');
    this.lineStyle.meetingId = meetingId;
    this.meetingId = meetingId;
    // CHANGE_ROOM(this.roomId)
    this.init();
    this.changeColor();

  },
  methods: {
    init() {
      const vm = this;
      vm.lineList = [];
      setD3Utils(this);
      vm.initSharp();
      vm.canvasMain = vm.svg.append('g')
        .attr('id', 'canvas-main')
        .attr('transform', 'translate(0,0)');
      // svg初始化
      document.getElementById('svg').onmousedown=function(e){
        let id = vm.getRanNum();
        // 画笔初始化
        if (vm.cursorType === 'pen') {
          var line = {
            id: id,
            createUser: vm.$store.state.eleData.userId,
            path: [e.clientX, e.clientY],
            type: 'PATH',
            matrix: [1,0,0,1,0,0],
          };
          Object.keys(vm.lineStyle).forEach(function(key) {
            line[key] = vm.lineStyle[key]
          })
          // vm.draw(line);
          SHARP_PATH_DRAW(line)
          document.onmousemove=function(e){
            // if (Math.abs(e.clientX - vm.tempPath[vm.tempPath.length - 1][0]) > 2 e.clientY - vm.tempPath[vm.tempPath.length - 1][1] > 2)) {
              line.path = [
                e.clientX,
                e.clientY
              ]
              SHARP_PATH_DRAW(line)
            // }
          }
        }
        document.onmouseup=function(e){
          document.onmousemove = null;
          var subData = vm.lineList[id];
          if (subData && subData.id) {
            vm.saveSharp(subData)
            document.onmouseup = null;
            return;
          }
        }
      }
    },
    async initSharp() {
      const vm = this;
      const data = await apiList.findSharpByMeetingId({ id : vm.meetingId });
      var res = data.data;
      if (res.isSuccess) {
        res.data.forEach(function(sharp) {
          vm.lineList[sharp.id] = sharp;
          draw(sharp);
        })
      } else {
        vm.$Message.error(res.msg);
      }
    },
    async saveSharp(subData) {
      const vm = this;
      subData.centPoint = getOldParam(subData.id);
      subData.createUser = vm.$store.state.eleData.userId;
      vm.lineList[subData.id].centPoint = subData.centPoint;
      const data = await apiList.saveSharp(subData);
      var res = data.data;
      if (res.isSuccess) {
        console.log('save-ok');
      } else {
        vm.$Message.error(res.msg);
      }
    },
    async updateSharp(subData) {
      const vm = this;
      subData.createUser = vm.$store.state.eleData.userId;
      const data = await apiList.updateSharp(subData);
      var res = data.data;
      if (res.isSuccess) {
        console.log('update-ok');
      } else {
        vm.$Message.error(res.msg);
      }
    },
    async removeSharp(subData) {
      if (!subData || !subData.ids) {
        return
      }
      const res = await apiList.removeSharp({ ids: subData.ids });
      var data = res.data;
      if (data.isSuccess) {
        console.log('remove-ok');
      } else {
        this.$Message.error(data.msg);
      }
    },
    //改变颜色
    changeColor() {
      const vm = this;
      $(".color-item").click(function(e){
        $(".color-item").removeClass("selected");
        vm.lineStyle.color = $(this)[0].attributes.color.value;
        $(this).addClass("selected");
      });
    },
    getRanNum () {
      var result = [];
      for(var i=0;i<16;i++){
          var ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字
          //大写字母'A'的ASCII是65,A~Z的ASCII码就是65 + 0~25;然后调用String.fromCharCode()传入ASCII值返回相应的字符并push进数组里
          result.push(String.fromCharCode(65+ranNum));
      }
      return  result.join('');
    },
      toFixed (num) {
      if (true) {
        return num.toFixed(2)
      }
      return num;
    },
    isEmpty(obj) {
      for(var key in obj) {
          if(obj.hasOwnProperty(key))
              return false;
          }
      return true;
    },
    getSvg() {
      return $('#svg');
    },
    pointers() {
      const vm = this;
      vm.isEdit = false;
      vm.isDraw = false;
      vm.getSvg().css('cursor', vm.cursor.pointer);
      vm.cursorType = 'pointer';
      var utils = $(".leftmenu > span");
      utils.eq(0).addClass('active').siblings().removeClass('active')
      utils.find('.canvas-panel-popup').hide();
      utils.eq(0).find('.canvas-panel-popup').show();
      $("#svg").children().removeClass("hover");
      vm.pointer()
    },
    pen() {
      const vm = this;
      vm.getSvg().css('cursor', vm.cursor.pen);
      vm.cursorType = 'pen';
      var utils = $(".leftmenu > span");
      utils.eq(1).addClass('active').siblings().removeClass('active');
      utils.find('.canvas-panel-popup:eq(1)').siblings().hide();
      var hidetag = utils.eq(1).find('.canvas-panel-popup').is(":hidden");
      if (hidetag) {
        utils.find('.canvas-panel-popup').hide();
        utils.eq(1).find('.canvas-panel-popup').show();
      } else {
        utils.find('.canvas-panel-popup').hide();
      }
      $("#svg").children().removeClass("hover");

      document.onmousedown = null;
      document.onmousemove = null;
      document.onmouseup = null;
      // vm.pointer()
    },
    file() {
      const vm = this;
      vm.cursorType = 'file';
      var col = 3;
      vm.getSvg().css('cursor', vm.cursor.pointer);
      vm.cursorType = 'pointer';
      var utils = $(".leftmenu > span");
      utils.eq(col).addClass('active').siblings().removeClass('active')
      utils.find('.canvas-panel-popup').hide();
      utils.eq(col).find('.canvas-panel-popup').show();
      $("#svg").children().removeClass("hover");
      vm.pointer()
    },
    eraser() {
      const vm = this;
      vm.getSvg().css('cursor', vm.cursor.eraser);
      vm.cursorType = 'eraser';
      var utils = $(".leftmenu > span");
      utils.eq(6).addClass('active').siblings().removeClass('active');
      utils.find('.canvas-panel-popup:eq(1)').hide();
      var hidetag = utils.eq(7).find('.canvas-panel-popup').is(":hidden");
      if (hidetag) {
        utils.find('.canvas-panel-popup').hide();
        utils.eq(7).find('.canvas-panel-popup').show();
      } else {
        utils.find('.canvas-panel-popup').hide();
      }
      $("#svg").children().removeClass("hover");
      vm.pointer()
    },
    pointer() {
      const vm = this;
      // vm.isDraw = false;
      $("#canvas-main").children().hover(function() {
          if (vm.cursorType != 'pen' && !vm.isDraw) {
            var mvm = this;
            let box = document.getElementById(mvm.id).getBBox();
            var translate = mvm.transform.baseVal[0] ? mvm.transform.baseVal[0].matrix : {e: 0, f: 0};
            var selectGround = $("#selectGround")[0];
            let left = vm.lineList[mvm.id].matrix[4];
            let top = vm.lineList[mvm.id].matrix[5];
            let scaleX = vm.lineList[mvm.id].matrix[0];
            let scaleY = vm.lineList[mvm.id].matrix[3];
            selectGround.style.left = `${box.x + left}px`;
            selectGround.style.top = `${box.y + top}px`;
            selectGround.style.width = `${box.width}px`;
            selectGround.style.height = `${box.height}px`;
            selectGround.style.transform =  `scale(${scaleX}, ${scaleY})`
            console.log(left, top, scaleX, scaleY)
            if (!selectGround.style.display || selectGround.style.display == 'none') {
              selectGround.style.display = 'block';
            }
            vm.svg.select('#' + mvm.id).select('path').attr('stroke', '#58B1FC');
            switch(vm.cursorType) {
              case 'pointer':
                doPointer(mvm, selectGround);
                break;
              case 'eraser':
                doEraser(mvm, selectGround);
                break;
              default:
                break;
            }
          }
        }, function() {
          if (!vm.isEdit) {
            selectGround.style.display = 'none';
            this.onmousedown = null;
            vm.svg.select('#' + this.id).select('path').attr('stroke', vm.lineList[this.id].color);
          }
      })
    },
    removeAllMine() {
      var vm = this;
      var ids = [];
      Object.keys(vm.lineList).forEach(function(key) {
        let item = vm.lineList[key];
        if (item.createUser === vm.$store.state.eleData.userId) {
          ids.push(item.id)
        }
      });
      if (ids.length === 0) {
        return;
      }
      SHARP_REMOVE(ids);
    },
    removeAll() {
      var vm = this;
      var ids = [];
      Object.keys(vm.lineList).forEach(function(key) {
        let item = vm.lineList[key];
        ids.push(item.id)
      });
      if (ids.length === 0) {
        return;
      }
      SHARP_REMOVE(ids);
    },
    async uploadImage(e){
      const vm = this;
      let file = e.target.files[0];
      var regStr = 'image/jpeg|image/gif|image/png|image/bmp'
      var reg = new RegExp(regStr)
      var isImg = reg.test(file.type)
      if (!isImg) {
          alert("图片格式不正确");
          file.outerHTML = file.outerHTML;
          return false;
      }
      let formData = new FormData();  //新建一个FormData对象
      formData.append("file", file, file.name);  //封装formData，根据键值对的形式进行封装
      formData.append("userId", this.$store.state.eleData.userId);
      formData.append("meetingId", this.$store.state.eleData.meetingId);
      // formData.append("imgsrc", img11.attr("src"));
      let header = {'Content-Type': 'multipart/form-data', token: loginController.getUserToken()}
      const data = await comApi.uploadExtImg(formData);
      var res = data.data;
      if (res.isSuccess) {
        let id = vm.getRanNum();
        var obj = {
          id: id,
          createUser: loginController.getUserId(),
          url: res.data.url,
          type: 'IMAGE',
          matrix: [1,0,0,1,0,0],
          meetingId: vm.meetingId
        };
        SHARP_PATH_DRAW(obj);
        setTimeout(function() {
          vm.saveSharp(obj);
        }, 1000);
      } else {
        vm.$Message.error(res.msg);
      }
      console.log("清空文件!")
      $("#img").val("");
    }
  }
}
</script>

<style lang="less" scoped>
  .el-main {

    line-height: 1024px;
  }
  .canvas-app {
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  .canvas-head {
    position: absolute;
    top: 10px;
    width: 100%;
    text-align: center;
    z-index: 1001;
    pointer-events: none;
  }
  .cursor-draw {
    cursor: auto;
  }
  .g_ground {
    transition: 800ms ease all;
  }
  .g_rect {
    stroke:orange;
    stroke-width:5;
    stroke-opacity:0.5
  }
  .select_ground {
    left: 236px;
    top: 201px;
    width: 170px;
    height: 185.153px;
    display: none;
  }
  .utils {
    left: 40%;
    top: 10%;
    position: fixed;
  }
  .utils-bar {
    display: inline-block !important;
  }

</style>
