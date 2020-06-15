<template>
  <el-dialog
    :title="'【' + className + '】 ' + startTime + ' 至 ' + endTime"
    :visible.sync="visible"
    width="30%"
    center
    @close="closeDialog"
  >
    <div style="text-align: center">
      <el-divider content-position="left">
        <span style="color: #00a0e9;font-size: 13px">发送通知</span>
      </el-divider>
      <div style="margin-top: 30px">
        <el-checkbox-group v-model="checkList">
          <el-checkbox label="学员" />
          <el-checkbox label="教师" />
        </el-checkbox-group>
      </div>
      <div style="margin-top: 10px;margin-bottom: 30px">
        <el-input
          v-model="noticeText"
          type="textarea"
          :rows="3"
          placeholder="请输入通知内容"
          maxlength="50"
          show-word-limit
          style="margin-bottom: 20px"
        />
        <el-button type="success" @click="noticeButtonClick">
          微信通知
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    components: {
    },
    data () {
      return {
        visible: false,
        id: '',
        bdStudentId: '',
        type: '',
        className: '',
        startTime: '',
        endTime: '',
        arrangeDate: '',
        noticeText: '',
        checkList: ['学员', '教师']
      }
    },
    methods: {
      init (id, bdStudentId, className, startTime, endTime, arrangeDate) {
        this.visible = true
        this.id = id
        this.bdStudentId = bdStudentId
        this.className = className
        this.startTime = startTime
        this.endTime = endTime
        this.arrangeDate = arrangeDate
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.visible = false
          // 清空变量
          this.id = ''
          this.bdStudentId = ''
          this.noticeText = ''
        }
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      },
      // 微信通知
      noticeButtonClick () {
        this.type = 'notice'
        if (this.noticeText && this.checkList.length > 0) {
          this.$http({
            url: this.$http.adornUrl('/business/studentclassarrange/sendWeChatNotice'),
            method: 'post',
            data: this.$http.adornData({
              'id': this.id,
              'bdStudentId': this.bdStudentId,
              'noticeText': this.noticeText,
              'checkList': this.checkList
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '微信通知发送成功！',
                type: 'success',
                duration: 3000,
                onClose: () => {
                  this.noticeText = ''
                }
              })
            } else {
              this.$message({
                message: '微信消息推送失败！',
                type: 'error',
                duration: 3000
              })
            }
          })
        } else if (this.checkList.length === 0) {
          this.$message({
            message: '请选择通知对象！',
            type: 'warning',
            duration: 2000
          })
        } else if (!this.noticeText) {
          this.$message({
            message: '请填写通知内容！',
            type: 'warning',
            duration: 2000
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
