<template>
  <div>
    <div style="margin-bottom: 100px">
      <el-rate :v-model="rate" style="font-size: 100px" />
    </div>
    <el-button style="font-size: 10px">
      测试
    </el-button>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        rate: 0
      }
    }
  }
</script>

<style scoped>

</style>
