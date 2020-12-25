<!-- 门户后台管理首页 -->
<template>
  <Content>
    <div class="ivu-layout-content right-block">
        <div class="title clearfix" style="height: 100%;position: absolute; z-index: -1;"></div>
        <div class="form-group">
          搜索:
          <Input v-model="selectData.model.name" placeholder="请输入查找会议名称" style="width: 200px">
            <Icon type="ios-search" slot="suffix" />
          </Input>
          <Button class="form-fiel" type="primary" @click="page">确定</Button>
          <Button class="form-fiel" type="primary" @click="reset">重置</Button>
          <Button class="form-fiel" style="float: right; margin-left: 5px;" type="warning" @click="create">创建新会议</Button>
          <Button class="form-fiel" style="float: right; margin-left: 5px;" type="error" @click="deleteAct">删除会议</Button>
        </div>
        <Divider />
        <Table border ref="selection"
              :data="meetings"
              :columns="columns"
              @on-selection-change="selectAll"></Table>
        <div class="page">
          <Page size="small" show-elevator show-sizer show-total
                :total="allNum"
                :current="selectData.pageNo"
                :page-size="selectData.pageSize"
                @on-page-size-change="pageBySize"
                @on-change="pageByNo"
          />
        </div>
        <meeting-modal ref='dataModal' v-on:page="page"></meeting-modal>
        <hy-upload ref="hyUpload"></hy-upload>
    </div>
  </Content>
</template>


<script>
import apiList from '@/view/meeting/api/apiList'
import Vue from 'vue'
import hover from "@/assets/css/hover.css"
import { mapState } from 'vuex'
import meetingModal from './MeetingModal'
import mainBar from '@/components/hengyun/mainBar'
import hyUpload from '@/components/hengyun/hyUpload'
export default {
  components: {
    'meeting-modal': meetingModal,
    'main-bar': mainBar,
    'hy-upload': hyUpload
  },
  computed: {
    ...mapState([
      'authButton'
    ]),
  },
  data () {
    const vm = this;
    return {
      columns: [{
        type: 'selection',
        width: 60,
        align: 'center',
      }, {
        title: '会议名称',
        key: 'name',
        tooltip: true,
        width: 220
      }, {
        title: '会议标签',
        key: 'tags',
        whiteSpace: 'nowrap',
        render: (h, params) => {
          const row = params.row;
          var tags = row.tags || [];
          var arr = [];
          tags.forEach(obj => {
              let color;
              switch(obj) {
                case '日常例会':
                  color = 'primary'
                  break;
                case '互动娱乐':
                  color = 'warning'
                  break;
                case '重要事宜':
                  color = 'error'
                  break;
                case '家庭小聚':
                  color = '#FFA2D3'
                  break;
                default:
                  color = 'primary'
                  break;
              }
              arr.push(h('Tag', {
                  props: {
                    color: color
                  },
                  style: {
                      whiteSpace: 'nowrap'
                  },
                }, obj || '普通会议'))
          });
          return h('div',
            arr
          )
        }
      }, {
        title: '是否加密',
        key: 'ispassword',
        render: (h, params) => {
            const row = params.row;
            return h('i-switch', {
                props: {
                  type: 'primary',
                  value: row.ispassword
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': (value) => {//触发事件是on-change,用双引号括起来，
                    row.ispassword = value;
                    vm.doUpdate(row) //params.index是拿到table的行序列，可以取到对应的表格值
                  }
                }
            });
        }
      }, {
        title: '最大连接数',
        key: 'maxClient',
      }, {
        title: '会议描述',
        key: 'descs',
        tooltip: true,
        align: 'center'
      }, {
        title: '操作',
        key: 'action',
        align: 'center',
        fixed: 'right',
        width: 220,
        render: (h, params) => {
            const share = h('Icon', {
                props: {
                  type: 'ios-exit-outline'
                },
                class: 'hvr-grow button-list',
                attrs: {
                  title: "跳转会议"
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                        title: '提示',
                        content: '确定离开当前页面跳转到该会议吗?',
                        onOk: () => {
                        this.doJump(params.row.id)
                    }
                    })
                  }
                }
              }, 'share')
            const copy = h('Icon', {
                  props: {
                    type: 'ios-link'
                  },
                  class: 'hvr-grow button-list',
                  attrs: {
                    title: "复制链接"
                  },
                  on: {
                    click: () => {
                      this.doCopy(params.row.id)
                  }
                }
              }, 'copy')
            const edit = h('Icon', {
                props: {
                  type: 'ios-cog-outline'
                },
                class: 'hvr-grow button-list',
                attrs: {
                  title: "配置"
                },
                on: {
                  click: () => {
                        var data = deepCopyObject(params.row)
                        this.edit(data)
                  }
                }
            }, 'edit')
            const remove = h('Icon', {
                props: {
                  type: 'ios-trash'
                },
                class: 'hvr-grow button-list',
                attrs: {
                  title: "删除"
                },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                        title: '提示',
                        content: '您确定要删除吗？',
                        onOk: () => {
                        this.doDelete([params.row.id])
                    }
                    })
                }
              }
            }, 'remove')
            const fileManager = h('Icon', {
                props: {
                  type: 'ios-albums'
                },
                class: 'hvr-grow button-list',
                attrs: {
                  title: "附件管理"
                },
                on: {
                  click: () => {
                    this.openUpload(params.row.id)
                  }
              }
            }, 'fileManager')
            var list = []
            list.push(share)
            list.push(copy)
            list.push(edit)
            list.push(remove)
            list.push(fileManager)
            return h('div', list);
        }
      }],
      allNum: 0,
      meetings: [],
      social: [],
      selectData: {
        pageNo: 1,
        pageSize: 10,
        model: {
          name: '',
          userId: ''
        }
      }
    }
  },
  mounted () {
    const vm = this;
    base_vm.setMenu();
    if (!vm.$store.state.rtc) {
      base_vm.connectionSocket();
    }
    vm.page();
  },
  methods: {
    openUpload(meetingId) {
      this.$refs.hyUpload.openByMeeting(meetingId);
    },
    rowClick(data,index) {
      this.$refs.selection.toggleSelect(index);
    },
    pageBySize(size) {
      const vm = this;
      vm.selectData.pageSize = size;
      vm.page();
    },
    pageByNo (pageNo) {
      const vm = this;
      vm.selectData.pageNo = pageNo;
      vm.page();
    },
    async page () {
      var data = await apiList.pageMeetingListByUser(this.selectData);
      var res = data.data
      if (res.isSuccess) {
        var list = res.data.records
        list.forEach(obj => {
          if (obj.tags) {
            obj.tags = obj.tags.split(',')
          }
        })
        this.meetings = list;
        this.allNum = res.data.total;
      }
    },
    reset () {
      this.selectData.model.name = '';
    },
    doJump(id) {
      jumpMeeting(id);
    },
    doCopy(id){
      var str = '链接: ' + getMeetingPrefix() + id + '  复制这段内容，即可分享给其他人哦!';
      copyStr(str);
      this.$Message.success('分享链接已复制到剪切板，通过ctrl+v获取到该链接!');
    },
    async doDelete(ids){
      const vm = this;
      if (ids) {
        var data = await apiList.deleteMeeting({ids: ids});
        var res = data.data;
        if (res.code === 0) {
          vm.$Message.success('删除成功!');
          vm.page();
        } else {
          vm.$Message.success(res.msg);
        }
      }
    },
    selectAll(selection){
      const vm = this
      var ids = selection.map(x => {return x.id})
      vm.social = ids
    },
    create() {
      this.$refs.dataModal.create();
    },
    deleteAct() {
      if (this.social.length === 0) {
        this.$Message.info('请勾选需要删除的会议！');
        return;
      }
      this.$Modal.confirm({
          title: '提示',
          content: '您确定要删除吗？',
          onOk: () => {
          this.doDelete(this.social);
      }
      })
    },
    edit(row) {
      this.$refs.dataModal.edit(row);
    },
    doUpdate(row) {
      this.$refs.dataModal.doUpdateSome(row);
    }
  }
}
</script>
<style lang='less' scoped>
.page{
  text-align: center;
  margin-top: 5px;
}
.right-block {
    width: 82%;
    height: calc(100% - 81px);
    position: absolute;
    left: 17%;
    top: 11%;
}
</style>
