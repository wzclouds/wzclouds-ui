<template>
    <Modal
        v-model="showModal"
        :title="modalTitle"
        @on-cancel="closeFun"
        :mask-closable="false"
        :styles="{top: '20px'}"
        width="70%">
      <div v-if="!uploadDisabled">
          <Upload
            ref="upload"
            multiple
            :disabled="uploadDisabled"
            type="drag"
            :data="uploadData"
            :before-upload="handleUpload"
            :action="url">
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p style="text-align: center;">点击或拖动文件上传</p>
            </div>
          </Upload>
          <div>
              <ul v-for="(list,index) in fileList" :key="index">
                  <li style="margin-left: 20px;">文件名: <span style="font-size:15px;">{{ list.name }}</span> <Icon type="ios-close" size="20" style="float:right;" @click="delFileList(index)"></Icon></li>
              </ul>
          </div>
    </div>

    <div slot="footer">
      <Button class="modalBtn" type="primary" @click="submitFun" size="large">确认上传</Button>
      <Button class="modalBtn" type="default" @click="closeFun" size="large">关闭</Button>
    </div>
    <Divider orientation="left">附件历史</Divider>

    <Table border :columns="columns" :data="table" height="400"></Table>
    <div class="page">
      <Page size="small" show-elevator show-sizer show-total
        :total="searchData.total"
        :current="searchData.pageNo"
        :page-size="searchData.pageSize"
        @on-change="pageChange"
      />
    </div>
  </Modal>
</template>
<script>

import comApi from '@/api/comApiList'
export default {
  name: 'hyUpload',
  props: {
      url: { // 默认传递的接口url前缀
        type: String,
        default: process.env.BASE_API + "/bizFile/uploadBiz"
      },
      fileSingleSizeLimit: { // 默认上传大小限制
        type: Number,
        default: 500
      }
  },
  data () {
    const vm = this
    return {
      showModal: false,
      uploadDisabled: true,
      modalTitle: "附件上传",
      fileList: [],
      uploadData:{
        bizId: null,
        bizType: "BIZ_FILE",
        meetingId: null
      },
      columns: [
        {
          title: '文件名',
          key: 'name',
          align: 'center',
          fixed: 'left'
        },
        {
          title: '文件链接',
          key: 'url',
          render: (h, params) => {
            return h('div', [
              h('span', {
                  style: {
                      display: 'inline-block',
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                  },
                  domProps: {
                      title: params.row.url
                  }
              }, params.row.url)
            ])
          }
        },
        {
          title: '用户名',
          key: 'userName',
          align: 'center',
          width: 250
        },
        {
          title: '文件类型',
          key: 'type',
          align: 'center',
          width: 150
        },
        {
          title: '创建时间',
          key: 'createTime',
          align: 'center',
          width: 200
        },
        {
        title: '操作',
        key: 'action',
        align: 'center',
        fixed: 'right',
        width: 110,
        render: (h, params) => {
            const download = h('Icon', {
                  props: {
                    type: 'md-download'
                  },
                  class: 'hvr-grow button-list',
                  attrs: {
                    title: "下载"
                  },
                  on: {
                    click: () => {
                      this.doDownload(params.row.id, params.row.name)
                  }
                }
              }, 'download')
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
                        content: '您确定要删除至回收站吗？',
                        onOk: () => {
                        this.doRemove(params.row.id)
                    }
                    })
                }
              }
            }, 'remove')
            var list = []
            list.push(download)
            list.push(remove)
            return h('div', list);
        }
      }],
      table: [],
      searchData: {
        pageNo:1,
        pageSize:10,
        total: 0,
        model: {
          name: "",
        }
      }
    }
  },
  mounted () {
    const vm = this
  },
  methods: {
    openByUser (id) {
      this.fileList = [];
      this.showModal = true;
      this.uploadData.bizId = id;
      this.uploadData.meetingId = this.$store.state.eleData.meetingId;
      this.uploadDisabled = false;
      this.pageBizFile();
    },
    openByMeeting (id) {
      this.fileList = [];
      this.showModal = true;
      this.uploadData.bizId = null;
      this.uploadData.meetingId = id;
      this.uploadDisabled = true;
      this.pageBizFile();
    },
    closeFun () {
      this.fileList = [];
      if (!this.uploadDisabled) {
        this.$refs.upload.clearFiles();
      }
      this.showModal = false;
    },
    handleUpload (file) {
      const vm = this;
        if(vm.fileList.length >= 5){
            this.$Message.info("最多只能上传5个文件");
        }else{
            vm.fileList.push(file);
        }
        return false;
    },
    delFileList(index){
      let vm = this;
      vm.fileList.splice(index, 1);
    },
    async submitFun () {
      let vm = this;
      if(vm.fileList.length === 0){
        vm.$Message.error("请至少上传一个文件");
        return;
      }
      let formData = new FormData();  //新建一个FormData对象
      for(var i=0; i< vm.fileList.length; i++){
        formData.append("file", vm.fileList[i], vm.fileList[i].name);   // 文件对象
      }
      formData.append("bizType", vm.uploadData.bizType);
      formData.append("bizId", vm.uploadData.bizId);
      formData.append("meetingId", vm.uploadData.meetingId);
      const data = await comApi.uploadBiz(formData);
      var res = data.data;
      if (res.isSuccess) {
        vm.$Message.success("上传成功!");
        vm.$refs.upload.clearFiles();
        vm.fileList = [];
        vm.pageBizFile();
      } else {
        vm.$Message.error("上传失败: " + res.msg);
      }
    },
    pageChange(pageNo) {
      const vm = this;
      vm.searchData.pageNo = pageNo;
      vm.pageBizFile()
    },
    async pageBizFile() {
      const vm = this;
      vm.searchData.model.bizId = vm.uploadData.bizId;
      vm.searchData.model.meetingId = vm.uploadData.meetingId;
      const data = await comApi.pageBizFile(vm.searchData);
      var res = data.data;
      if (res.isSuccess) {
        vm.table = res.data.records;
        vm.searchData.total = res.data.total;
      } else {
        vm.$Message.error("查询数据失败: " + res.msg);
      }
    },
    async doRemove (id) {
      const vm = this
      if (!id){
        vm.$Message.info('请先选择文件!')
        return
      }
      var ids = []
      ids.push(id)
      const data = await comApi.removeFiles({ ids: ids});
      var res = data.data;
      if (res.isSuccess) {
        vm.$Message.success("删除成功!");
        vm.pageBizFile();
      } else {
        vm.$Message.error("查询数据失败: " + res.msg);
      }
    },
    async doDownload (id, name) {
      const vm = this
      if (!id){
        vm.$Message.info('请先选择文件!')
        return
      }
      const data = await comApi.downLoad({ id: id});
      debugger
      if (data.data) {
        vm.getBlob(data.data, name);
      }
    },
    getBlob(data, name) {
      const link = document.createElement('a');
      const blob = new Blob([data]);
      link.style.display = 'none';
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
</script>
<style type="text/css">
.page{
  text-align: center;
  margin-top: 5px;
}
</style>
