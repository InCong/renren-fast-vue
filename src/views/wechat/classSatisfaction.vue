<template>
  <div>
    <el-rate v-model="rate"></el-rate>
    <el-button>测试</el-button>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        rate: ''
      }
    }
  }
</script>

<style scoped>

</style>
