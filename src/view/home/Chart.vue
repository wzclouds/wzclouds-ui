<!-- 线图 -->
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    el: {
      type: String,
      default: ''
    }
  },
  methods: {
    refresh (option) {
      const vm = this
      const dom = vm.$echarts.init(document.getElementById(vm.el))
      dom.setOption(option)
    }
  }
}
</script>
