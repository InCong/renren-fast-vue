<template>
  <el-dialog
    id="dialog"
    :visible.sync="visible"
    :append-to-body="true"
    :show-close="false"
    width="480px"
    @close="closeDialog"
    center>
    <span slot="title"><h1 id = "title">微信签到</h1></span>
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
        qrCodeUrl: '',
        bdStudentId: 0,
        id: 0
      }
    },
    methods: {
      // 初始化
      init (url, bdStudentId, id) {
        this.visible = true
        this.qrCodeUrl = url
        this.bdStudentId = bdStudentId
        this.id = id
        this.initWebSocket()
      },
      closeDialog () {
        this.over()
      },
      initWebSocket: function () {
        // WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
        let websocket = new WebSocket('ws://127.0.0.1:80/renren-fast/websocket/sign')
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
        if (e.data === 'sign_success') {
          console.log(e.data)
          this.$message({
            message: '已成功签到！',
            type: 'sucess',
            duration: 3000,
            onClose: () => {
              this.$http({
                url: this.$http.adornUrl('/business/studentclassarrange/sendWeChatSignMsg'),
                method: 'post',
                data: this.$http.adornData({
                  'id': this.id,
                  'bdStudentId': this.bdStudentId
                })
              }).then(({data}) => {
                if (data && data.code === 0) {
                  this.$message({
                    message: '微信消息推送成功！',
                    type: 'success',
                    duration: 3000
                  })
                } else {
                  this.$message({
                    message: '微信消息推送失败！',
                    type: 'error',
                    duration: 3000
                  })
                }
              })
            }
          })
          this.visible = false
        } else if (e.data === 'sign_unbinding') {
          console.log(e.data)
          this.$message({
            message: '该微信用户尚未与该学员绑定，无法签到！！！',
            type: 'error',
            duration: 4500
          })
        } else if (e.data === 'sign_fail') {
          this.visible = false
          console.log(e.data)
          this.$message({
            message: '无法找到对应记录，无法签到！！！',
            type: 'warning',
            duration: 4500
          })
        } else {
          this.$message({
            message: '签到失败！未知情况，请联系管理员！！！',
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
