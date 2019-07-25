<template>
  <el-dialog
    :title="'【' + className + '】 ' + startTime + ' 至 ' + endTime"
    :visible.sync="visible"
    @close="closeDialog"
    width="30%"
    center>
    <div style="text-align: center">
      <el-button type="success" @click="signButtonClick">微信签到</el-button>
      <el-button type="success" @click="noticeButtonClick">微信通知</el-button>
      <el-button type="primary" @click="modifyButtonClick">课程修改</el-button>
      <el-button type="danger" @click="deleteButtonClick">删除课程</el-button>

      <!-- 弹窗，显示课程的时间段修改 -->
      <class-arrange-modify v-if="classArrangeModifyVisible" ref="classArrangeModify"></class-arrange-modify>
      <!-- 弹窗，显示微信签到 -->
      <class-arrange-wechat-sign v-if="classArrangeWechatSignVisible" ref="classArrangeWechatSign"></class-arrange-wechat-sign>
    </div>
  </el-dialog>
</template>

<script>
  import moment from 'moment'
  import 'moment/locale/zh-cn'
  import ClassArrangeModify from './classArrangeModify'
  import ClassArrangeWechatSign from './classArrangeWechatSign'
  export default {
    components: {
      ClassArrangeModify,
      ClassArrangeWechatSign
    },
    data () {
      return {
        visible: false,
        id: '',
        bdClassesStudentId: '',
        bdTeacherId: '',
        bdStudentId: '',
        type: '',
        isModify: false,
        className: '',
        startTime: '',
        endTime: '',
        arrangeDate: '',
        classArrangeModifyVisible: false,
        classArrangeWechatSignVisible: false
      }
    },
    methods: {
      init (id, bdTeacherId, bdStudentId, className, startTime, endTime, arrangeDate, bdClassesStudentId) {
        this.visible = true
        this.id = id
        this.bdClassesStudentId = bdClassesStudentId
        this.bdTeacherId = bdTeacherId
        this.bdStudentId = bdStudentId
        this.className = className
        this.startTime = startTime
        this.endTime = endTime
        this.arrangeDate = arrangeDate
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.visible = false
          if (this.type === 'modify' || this.type === 'delete' || this.isModify) {
            this.$emit('refreshClassArrange')
          }
          // 清空变量
          this.id = ''
          this.bdTeacherId = ''
          this.bdStudentId = ''
          this.type = ''
          this.isModify = false
        }
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      },
      // 微信签到
      signButtonClick () {
        this.type = 'sign'
        this.$http({
          url: this.$http.adornUrl('/business/studentclassarrange/getQrCodeUrl'),
          method: 'post',
          data: this.$http.adornData({
            'bdStudentClassArrangeId': this.id
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            if (data.url) {
              this.classArrangeWechatSignVisible = true
              this.$nextTick(() => {
                this.$refs.classArrangeWechatSign.init(data.url, this.bdStudentId, this.id)
              })
            } else {
              this.$message({
                message: '获取失败！',
                type: 'error',
                duration: 1500
              })
            }
          }
        })
      },
      // 微信通知
      noticeButtonClick () {
        this.type = 'notice'
      },
      // 课程修改
      modifyButtonClick () {
        // 判断是否超过当前时间
        if (moment() > moment(this.arrangeDate + ' ' + this.endTime)) {
          this.$message({
            message: '当前日期时间已超过该排课的结束时间！无法修改！',
            type: 'warning',
            duration: 3000
          })
        } else {
          this.type = 'modify'
          this.isModify = true
          this.classArrangeModifyVisible = true
          this.$nextTick(() => {
            this.$refs.classArrangeModify.init(this.id, this.arrangeDate, this.startTime, this.endTime, this.bdTeacherId, this.bdClassesStudentId)
          })
        }
      },
      // 删除课程
      deleteButtonClick () {
        // 判断是否超过当前时间
        if (moment() > moment(this.arrangeDate + ' ' + this.startTime)) {
          this.$message({
            message: '当前日期时间已超过该排课的开始时间！无法删除！',
            type: 'warning',
            duration: 3000
          })
        } else {
          this.type = 'delete'
          this.$confirm(`确定对该课程进行删除操作？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$http({
              url: this.$http.adornUrl('/business/studentclassarrange/delete'),
              method: 'post',
              data: this.$http.adornData([this.id], false)
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '删除成功！',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
