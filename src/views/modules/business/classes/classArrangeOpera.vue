<template>
  <el-dialog
    :title="'【' + className + '】 ' + startTime + ' 至 ' + endTime"
    :visible.sync="visible"
    width="35%"
    center
    @close="closeDialog"
  >
    <div style="text-align: center">
      <el-divider content-position="left">
        <span style="color: #00a0e9;font-size: 13px">相关操作</span>
      </el-divider>
      <div style="margin-top: 30px;margin-bottom: 30px">
        <el-button type="success" @click="signButtonClick">
          微信签到
        </el-button>
        <el-button type="primary" @click="artificialSignButtonClick">
          人工签到
        </el-button>
        <el-button type="primary" @click="modifyButtonClick">
          课程修改
        </el-button>
        <el-button type="danger" @click="deleteButtonClick">
          删除课程
        </el-button>
        <el-button type="danger" @click="multiDeleteButtonClick">
          批量删除
        </el-button>
      </div>
      <el-divider content-position="left">
        <span style="color: #00a0e9;font-size: 13px">自动提醒</span>
      </el-divider>
      <div style="margin-top: 30px;margin-bottom: 30px">
        <el-switch
          v-model="isAutoNotice"
          active-text="是否自动提醒"
          inactive-value="0"
          active-value="1"
          @change="changeAutoNotice"
        />
        <el-tooltip placement="top" effect="light" style="margin-left: 10px">
          <div slot="content">
            系统会将第二天的课程提醒信息于当天10点通过微信公众号群发给对应的教师、家长。
          </div>
          <i class="el-icon-question" />
        </el-tooltip>
      </div>
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
      <!-- 弹窗，显示课程的时间段修改 -->
      <class-arrange-modify v-if="classArrangeModifyVisible" ref="classArrangeModify" @updateTimeData="updateTimeData" />
      <!-- 弹窗，显示微信签到 -->
      <class-arrange-wechat-sign v-if="classArrangeWechatSignVisible" ref="classArrangeWechatSign" @signSuccess="signSuccess" />
    </div>
  </el-dialog>
</template>

<script>
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
        length: 0,
        isModify: false,
        className: '',
        startTime: '',
        endTime: '',
        arrangeDate: '',
        noticeText: '',
        classArrangeModifyVisible: false,
        classArrangeWechatSignVisible: false,
        remark: '',
        checkList: ['学员', '教师'],
        isAutoNotice: '0'
      }
    },
    methods: {
      init (id, bdTeacherId, bdStudentId, className, startTime, endTime, arrangeDate, bdClassesStudentId, length, remark, isAutoNotice) {
        this.visible = true
        this.id = id
        this.bdClassesStudentId = bdClassesStudentId
        this.bdTeacherId = bdTeacherId
        this.bdStudentId = bdStudentId
        this.className = className
        this.startTime = startTime
        this.endTime = endTime
        this.arrangeDate = arrangeDate
        this.length = length
        this.remark = remark
        this.isAutoNotice = isAutoNotice.toString()
        console.log(this.isAutoNotice)
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
          this.noticeText = ''
          this.isAutoNotice = '0'
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
      // 人工签到
      artificialSignButtonClick () {
        this.type = 'sign'
        this.$http({
          url: this.$http.adornUrl('/business/studentclassarrange/artificialSign'),
          method: 'post',
          data: this.$http.adornData({
            'bdStudentClassArrangeId': this.id,
            'bdStudentId': this.bdStudentId
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.isModify = true
            this.$message({
              message: '人工签到成功！微信消息已发送！',
              type: 'success',
              duration: 3000
            })
          }
        })
      },
      signSuccess () {
        this.isModify = true
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
      },
      // 课程修改
      modifyButtonClick () {
        this.type = 'modify'
        this.isModify = true
        this.classArrangeModifyVisible = true
        this.$nextTick(() => {
          this.$refs.classArrangeModify.init(this.id, this.arrangeDate, this.startTime, this.endTime, this.bdTeacherId, this.bdClassesStudentId, this.length, this.remark)
        })
      },
      // 删除课程
      deleteButtonClick () {
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
              this.type = 'delete'
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
      },
      // 接收下级界面返回的数据并进行更新
      updateTimeData (arrangeDate, startTime, endTime, length) {
        this.arrangeDate = arrangeDate
        this.startTime = startTime
        this.endTime = endTime
        this.length = length
      },
      // 变更自动提醒
      changeAutoNotice () {
        this.$http({
          url: this.$http.adornUrl('/business/studentclassarrange/update'),
          method: 'post',
          data: this.$http.adornData({
            'id': this.id,
            'isAutoNotice': this.isAutoNotice
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.type = 'modify'
            this.isModify = true
            if (this.isAutoNotice === '1') {
              this.$message({
                message: '设置成功，将在上课前一天自动微信通知相关学员、家长和教师！',
                type: 'success',
                duration: 3000
              })
            } else {
              this.$message({
                message: '取消成功，将取消自动微信提醒！',
                type: 'success',
                duration: 3000
              })
            }
          } else {
            this.$message({
              message: data.msg,
              type: 'error',
              duration: 5000
            })
          }
        })
      },
      // 批量删除该批循环产生的课程
      multiDeleteButtonClick () {
        this.$confirm('此操作将会批量删除与该课程一起循环产生的课程，是否继续', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/business/studentclassarrange/multiDelete'),
            method: 'post',
            data: this.$http.adornData({
              'id': this.id
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.type = 'delete'
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
        }).catch(() => {
          console.log('取消批量删除')
        })
      }
    }
  }
</script>

<style scoped>

</style>
