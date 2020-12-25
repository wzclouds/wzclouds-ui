<template>
  <div class="chart-card">
    <div class="card-title">{{title}}</div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['title']
}
</script>

<style lang="less" scoped>
.chart-card{
  padding: 0 10px;
  margin-top: 20px;
  .card-title{
    height: 40px;
    line-height: 40px;
    color: #333;
    font-size: 14px;
    border-bottom: 1px solid #EBEBEB;
  }
}
</style>
