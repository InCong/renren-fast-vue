<template>
  <el-dialog
    title="绑定微信用户"
    :visible.sync="visible"
    :append-to-body="true">

  </el-dialog>
</template>

<script>
  export default {
    // name: 'main-navbar-bindingWX'
    data () {
      return {
        visible: false
      }
    },
    computed: {},
    methods: {
      init () {
        this.visible = true
      }
    }
  }
</script>

<style scoped>

</style>
