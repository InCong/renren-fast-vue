<template>
  <el-dialog
    title="课程修改"
    :close-on-click-modal="false"
    :visible.sync="visible"
    append-to-body
    @close="closeDialog"
  >
    <el-switch
      v-model="isMultiModify"
      active-text="是否批量修改"
      style="margin-left: 10px; margin-bottom: 10px"
    />
    <el-divider content-position="left">
      <span style="color: #00a0e9">排课日期与时间</span>
    </el-divider>
    <div v-if="!isMultiModify" style="text-align: center;margin-top: 30px">
      <el-date-picker
        v-model="arrangeDate"
        value-format="yyyy-MM-dd"
        type="date"
        placeholder="选择排课日期"
      />
    </div>
    <div style="text-align: center;margin-bottom: 30px;margin-top: 30px">
      <el-switch
        v-model="isTimeSelect"
        active-text="选择时间"
        inactive-text="填写时间"
        style="margin-right: 10px"
      />
      <el-input
        v-if="!isTimeSelect"
        v-model="hours"
        type="number"
        placeholder="时"
        style="width: 80px"
        @change="hourChange"
      />
      <a v-if="!isTimeSelect">：</a>
      <el-input
        v-if="!isTimeSelect"
        v-model="minutes"
        type="number"
        placeholder="分"
        style="width: 80px"
        @change="minuteChange"
      />
      <el-time-select
        v-if="isTimeSelect"
        v-model="startTime"
        placeholder="起始时间"
        style="width: 120px"
        :editable="false"
        :clearable="false"
        :picker-options="{
          start: '07:00',
          step: '00:15',
          end: '22:00'
        }"
        @change="startTimeChange"
      />
      <span style="margin-left: 10px;margin-right: 20px">至</span>
      <el-time-select
        v-model="endTime"
        placeholder="结束时间"
        style="width: 120px"
        :clearable="false"
        :disabled="true"
        :picker-options="{
          start: '07:00',
          step: '00:01',
          end: '23:00',
          minTime: startTime
        }"
      />
      <el-switch
        v-model="isTimeChange"
        active-text="修改时长"
        style="margin-left: 10px"
      />
      <el-input
        v-model="length"
        :disabled="!isTimeChange"
        type="number"
        style="width: 80px"
        @change="classLengthChange"
      />
    </div>
    <el-divider content-position="left">
      <span v-if="!isMultiModify" style="color: #00a0e9">备注</span>
    </el-divider>
    <div v-if="!isMultiModify" style="text-align: center;margin-top: 30px">
      <el-input v-model="remark" type="text" placeholder="请输入备注" maxlength="50" show-word-limit style="width: 70%" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="!isMultiModify" type="primary" @click="dataFormSubmit()">确定</el-button>
      <el-button v-if="isMultiModify" type="primary" @click="multiModify">批量修改</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import moment from 'moment'
  export default {
    data () {
      return {
        visible: false,
        id: '',
        arrangeDate: '',
        startTime: '',
        endTime: '',
        bdTeacherId: '',
        length: 0,
        remark: '',
        isTimeSelect: true,
        hours: '',
        minutes: '',
        isTimeChange: false,
        isMultiModify: false
      }
    },
    methods: {
      init (id, arrangeDate, startTime, endTime, bdTeacherId, bdClassesStudentId, length, remark) {
        this.visible = true
        this.id = id
        this.bdClassesStudentId = bdClassesStudentId
        this.arrangeDate = arrangeDate
        this.startTime = startTime
        this.hours = moment(this.arrangeDate + ' ' + this.startTime).hour()
        this.minutes = moment(this.arrangeDate + ' ' + this.startTime).minute()
        this.endTime = endTime
        this.bdTeacherId = bdTeacherId
        this.length = length
        this.remark = remark

        // 组件看不见时调用
        this.over = () => {
          this.isTimeChange = false
          this.isMultiModify = false
        }
      },
      dataFormSubmit () {
        let num = this.endTime.substr(0, 2) - this.startTime.substr(0, 2) + (this.endTime.substr(3, 2) - this.startTime.substr(3, 2)) / 60
        // 四舍五入取整
        // num = Math.ceil(num)
        // 截取小数点后2位
        num = parseFloat(num).toFixed(2)
        // let remainNum = 0
        // this.$http({
        //   url: this.$http.adornUrl(`/business/classesstudent/info/${this.bdClassesStudentId}`),
        //   method: 'get',
        //   params: this.$http.adornParams()
        // }).then(({data}) => {
        //   if (data && data.code === 0) {
        //     remainNum = data.classesStudent.remainNum
        //     if (remainNum < num) {
        //       this.$message({
        //         message: '当前剩余课时不足！最新剩余课时：' + remainNum,
        //         type: 'warning',
        //         duration: 3000
        //       })
        //     } else {
        //
        //     }
        //   } else {
        //     this.$message({
        //       message: '无法找到记录！请确认！',
        //       type: 'warning',
        //       duration: 3000
        //     })
        //   }
        // })
        this.$http({
          url: this.$http.adornUrl('/business/studentclassarrange/updateForOne'),
          method: 'post',
          data: this.$http.adornData({
            'id': this.id,
            'bdClassesStudentId': this.bdClassesStudentId,
            'arrangeDate': this.arrangeDate,
            'startTime': this.startTime,
            'endTime': this.endTime,
            'num': num,
            'length': this.length,
            'bdTeacherId': this.bdTeacherId,
            'remark': this.remark
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.$message({
              message: '保存成功！',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.$emit('updateTimeData', this.arrangeDate, this.startTime, this.endTime, this.length)
              }
            })
          } else {
            this.$message({
              message: data.msg,
              type: 'error',
              duration: 5000
            })
          }
        })
      },
      startTimeChange () {
        if (this.length > 0) {
          let date = moment(this.arrangeDate + ' ' + this.startTime)
          this.endTime = date.add(this.length, 'minutes').format('HH:mm')
          this.hours = moment(this.arrangeDate + ' ' + this.startTime).hour()
          this.minutes = moment(this.arrangeDate + ' ' + this.startTime).minute()
        }
      },
      // 数字左补零
      prefixInt (num, length) {
        return (Array(length).join('0') + num).slice(-length)
      },
      hourChange () {
        if (this.hours !== '') {
          if (this.minutes === '') {
            this.minutes = 0
          }
          this.startTime = this.prefixInt(this.hours, 2) + ':' + this.prefixInt(this.minutes, 2)
          console.log(this.startTime)
        } else {
          this.minutes = ''
          this.startTime = ''
        }
        if (this.length > 0) {
          let date = moment(this.arrangeDate + ' ' + this.startTime)
          this.endTime = date.add(this.length, 'minutes').format('HH:mm')
        }
      },
      minuteChange () {
        if (this.minutes !== '') {
          this.startTime = this.prefixInt(this.hours, 2) + ':' + this.prefixInt(this.minutes, 2)
        } else if (this.hours !== '' && this.minutes === '') {
          this.minutes = 0
          this.startTime = this.prefixInt(this.hours, 2) + ':' + this.prefixInt(this.minutes, 2)
        }
        console.log(this.startTime)
        if (this.length > 0) {
          let date = moment(this.arrangeDate + ' ' + this.startTime)
          this.endTime = date.add(this.length, 'minutes').format('HH:mm')
        }
      },
      classLengthChange () {
        if (this.length > 0) {
          let date = moment(this.arrangeDate + ' ' + this.startTime)
          this.endTime = date.add(this.length, 'minutes').format('HH:mm')
        }
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      },
      multiModify () {
        this.$confirm('此操作将会批量修改与该课程一起循环产生的课程，如果时间上与其它课程冲突，则默认不修改时间。是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let num = this.endTime.substr(0, 2) - this.startTime.substr(0, 2) + (this.endTime.substr(3, 2) - this.startTime.substr(3, 2)) / 60
          num = parseFloat(num).toFixed(2)
          this.$http({
            url: this.$http.adornUrl('/business/studentclassarrange/updateForCircle'),
            method: 'post',
            data: this.$http.adornData({
              'id': this.id,
              'bdClassesStudentId': this.bdClassesStudentId,
              'startTime': this.startTime,
              'endTime': this.endTime,
              'num': num,
              'length': this.length,
              'bdTeacherId': this.bdTeacherId
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: data.msg,
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('updateTimeData', this.arrangeDate, this.startTime, this.endTime, this.length)
                }
              })
            } else {
              this.$message({
                message: data.msg,
                type: 'error',
                duration: 5000
              })
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
