<template>
  <el-dialog
    id="dialog"
    :visible.sync="visible"
    :append-to-body="true"
    :show-close="false"
    width="480px"
    @close="closeDialog"
    center>
    <span slot="title"><h1 id = "title">绑定微信</h1></span>
    <div class="marginCenter">
      <img id="qrImg" :src="qrCodeUrl" alt="qrCodeUrl"/>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        qrCodeUrl: ''
      }
    },
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
        // let websocket = new WebSocket('ws://127.0.0.1:8080/renren-fast/websocket/subscribe')
        let websocket = new WebSocket('ws://www.lejiao88.com:8080/renren-fast/websocket/subscribe')
        websocket.onopen = this.webSocketOnOpen
        websocket.onerror = this.webSocketOnError
        websocket.onmessage = this.webSocketOnMessage
        websocket.onclose = this.webSocketClose
        // 组件看不见时调用，中断websocket链接
        this.over = () => {
          websocket.close()
        }
      },
      webSocketOnOpen: function () {
        console.log('WebSocket连接成功')
      },
      webSocketOnError: function (e) {
        console.log('WebSocket连接发生错误')
      },
      webSocketOnMessage: function (e) {
        if (e.data === 'subscribe_success') {
          console.log(e.data)
          this.visible = false
          this.$message({
            message: '已关注公众号，绑定成功！',
            type: 'sucess',
            duration: 3000
          })
        } else if (e.data === 'subscribe_fail') {
          console.log(e.data)
          this.$message({
            message: '绑定失败！请尝试取消关注再重新关注，如果还没成功，请联系管理员！！！',
            type: 'error',
            duration: 4500
          })
        } else if (e.data === 'is_subscribed') {
          this.visible = false
          console.log(e.data)
          this.$message({
            message: '已绑定，无需再次绑定！！！',
            type: 'warning',
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
      webSocketClose: function (e) {
        console.log('WebSocket连接关闭')
      }
    }
  }
</script>

<style scoped>

</style>
