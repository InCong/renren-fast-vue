<template>
  <el-dialog
    title="绑定微信"
    id="dialog"
    :visible.sync="visible"
    :append-to-body="true"
    :show-close="false"
    width="480px"
    @close="closeDialog"
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
    created () { // 页面创建生命周期函数
      // this.initWebSocket()
    },
    destroyed: function () { // 离开页面生命周期函数
      // console.log('关闭了websocket')
      // this.websocketclose()
    },
    computed: {},
    methods: {
      // 初始化
      init (url) {
        this.visible = true
        this.qrCodeUrl = url
        this.initWebSocket()
      },
      closeDialog () {
        this.over()
      },
      initWebSocket: function () {
        // WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
        let websock = new WebSocket('ws://127.0.0.1:80/renren-fast/websocket/subscribe')
        websock.onopen = this.websocketonopen
        websock.onerror = this.websocketonerror
        websock.onmessage = this.websocketonmessage
        websock.onclose = this.websocketclose
        // 组件看不见时调用，中断websocket链接
        this.over = () => {
          websock.close()
        }
      },
      websocketonopen: function () {
        console.log('WebSocket连接成功')
      },
      websocketonerror: function (e) {
        console.log('WebSocket连接发生错误')
      },
      websocketonmessage: function (e) {
        console.log(e.data)
        if (e.data === 'subscribe_success') {
          this.visible = false
          this.$message({
            message: '已关注公众号，绑定成功！',
            type: 'sucess',
            duration: 3000
          })
        } else if (e.data === 'subscribe_success') {
          this.$message({
            message: '绑定失败！请尝试取消关注再重新关注，如果还没成功，请联系管理员！！！',
            type: 'error',
            duration: 4500
          })
        } else {
          this.$message({
            message: '绑定失败！未知情况，请联系管理员！！！',
            type: 'error',
            duration: 4500
          })
        }
      },
      websocketclose: function (e) {
        console.log('WebSocket连接关闭')
      }
    }
  }
</script>

<style scoped>

</style>
