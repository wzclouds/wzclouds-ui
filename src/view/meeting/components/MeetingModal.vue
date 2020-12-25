<template>
	<Modal
        v-model="createModal"
        title="新增会议"
        :mask-closable="false">
        <Form :model="dataForm"
              :label-width="80"
              :rules="validate"
              ref="dataForm">
          <FormItem label="会议名称" prop="name">
              <Input v-model="dataForm.name" placeholder="请输入会议名称"></Input>
          </FormItem>
          <FormItem label="会议标签" prop="tags">
              <CheckboxGroup v-model="dataForm.tags">
                  <Checkbox label="日常例会"></Checkbox>
                  <Checkbox label="重要事宜"></Checkbox>
                  <Checkbox label="互动娱乐"></Checkbox>
                  <Checkbox label="家庭小聚"></Checkbox>
              </CheckboxGroup>
          </FormItem>
          <FormItem label="是否加密" prop="ispassword"><!-- 
              <i-switch v-model="formItem.ispassword" size="large">
                  <span slot="true">on</span>
                  <span slot="false">否</span>
              </i-switch> -->
              <i-switch v-model="dataForm.ispassword" size="large" :true-value="true" :false-value="false">
                <span slot="open">是</span>
                <span slot="close">否</span>
            </i-switch>
          </FormItem>
          <FormItem label="密码" prop="password">
              <Input type="password" v-model="dataForm.password" :disabled="!dataForm.ispassword" placeholder="请设置会议密码"></Input>
          </FormItem>
          <FormItem label="最大人数" prop="maxClient">
              <Slider v-model="dataForm.maxClient" :max="8"></Slider>
          </FormItem>
          <FormItem label="会议描述" prop="descs">
              <Input v-model="dataForm.descs" type="textarea" placeholder="请输入会议描述,不可超过400个字"></Input>
          </FormItem>
        </Form>

        <div slot="footer">
          <Button class="modalBtn" type="default" @click="createModal = false" size="large">关闭</Button>
          <Button class="modalBtn" type="primary" @click="submit" size="large">确定</Button>
        </div>
      </Modal>
</template>


<script>
import apiList from '@/view/meeting/api/apiList'
function initDataForm () {
  return {
    name: null,
    ispassword: false,
    password: null,
    tags: [],
    maxClient: 6,
    descs: null
  };
}

export default {
  data() {
    const vm = this;
  	return {
  	  formTagList: ['日常例会','重要事宜','互动娱乐','家庭小聚'],
      modalType: 'create',
      dataForm: {
        name: null,
        ispassword: false,
        password: null,
        tags: [],
        maxClient: 6,
        descs: null,
        owner: null
      },
      createModal: false,
      validate: {
        name: [{
          required: true,
          validator: (rule, value, cb) => {
          if (!value) {
            cb(new Error('会议名称不能为空!'))
            return
          }
          cb()
        }}],
        password: [{
          validator: (rule, value, cb) => {
          if (!value && vm.dataForm.ispassword) {
            cb(new Error('启用加密会议后,密码不能为空!'))
            return
          }
          cb()
        }}],
        descs: [{
          validator: (rule, value, cb) => {
          if (value && value.length > 400) {
            cb(new Error('会议描述不可以超过400!'))
            return
          }
          cb()
        }}], 
      }
  	}
  },
  methods: {
  	create() {
      this.createModal = true;
      this.modalType = modalType.create;
      this.dataForm = initDataForm();
    },
    edit(data) {
      this.createModal = true;
      this.modalType = modalType.edit;
      this.dataForm = data;
    },
    async doUpdateSome(row) {
      const vm = this;
      var save = {
        ...row,
        tags: row.tags ? row.tags.join(',') : ''
      };
      var data = await apiList.updateMeeting(save);
      if (data.data.code === 0) {
        vm.$Message.info('更新成功!');
        vm.$emit('page');
      } else {
        vm.$emit('page');
        vm.$Message.info(data.data.msg);
      }
    },
    async doUpdate() {
      const vm = this;
      vm.$refs.dataForm.validate(async (valid) => {
        if (valid) {
          var save = {
            ...vm.dataForm,
            tags: vm.dataForm.tags.join(',')
          };
          var data = await apiList.updateMeeting(save);
          if (data.data.code === 0) {
            vm.$Message.info('更新成功!');
            vm.$emit('page');
            vm.createModal = false;
            vm.dataForm = initDataForm();
          } else {
            vm.$emit('page');
            vm.$Message.info(data.data.msg);
          }
        } else {
          vm.$Message.info('表单验证失败!');
        }
      })
    },
    async doSave() {
      const vm = this;
      vm.dataForm.owner = constant_vm.eleData.userId;
      vm.$refs.dataForm.validate(async (valid) => {
        if (valid) {
          var save = {
            ...vm.dataForm,
            tags: vm.dataForm.tags.join(',')
          };
          var data = await apiList.saveMeeting(save);
          if (data.data.code === 0) {
            vm.$Message.info('新增成功!');
            vm.$emit('page');
            vm.createModal = false;
            vm.dataForm = initDataForm();
          } else {
            vm.$Message.info(data.data.msg);
          }
        } else {
          vm.$Message.info('表单验证失败!');
        }
      })
    },
    submit() {
      if(this.modalType === modalType.edit) {
        this.doUpdate();
      } else if(this.modalType === modalType.create){
        this.doSave();
      }
    }
  }
}
</script>