<template>
  <el-dialog
    title="绑定微信"
    id="dialog"
    :visible.sync="visible"
    :append-to-body="true"
    width="470px"
    center>
    <span slot="title"><h1 id = "title">绑定微信</h1></span>
    <div class="marginCenter">
      <img id="qrImg" :src="qrCodeUrl"/>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        name: 'test',
        qrCodeUrl: ''
      }
    },
    computed: {},
    methods: {
      // 初始化
      init (url) {
        this.visible = true
        this.qrCodeUrl = url
      }
    }
  }
</script>

<style scoped>

</style>
