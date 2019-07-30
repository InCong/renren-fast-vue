<template>
  <el-dialog
    title="课程修改"
    :close-on-click-modal="false"
    :visible.sync="visible"
    append-to-body>
    <div style="text-align: center;margin-bottom: 30px">
      <el-date-picker
        v-model="arrangeDate"
        value-format="yyyy-MM-dd"
        type="date"
        placeholder="选择排课日期">
      </el-date-picker>
    </div>
    <div style="text-align: center">
      <el-time-select
        placeholder="起始时间"
        v-model="startTime"
        @change="startTimeChange"
        :editable="false"
        :clearable="false"
        :picker-options="{
            start: '06:00',
            step: '00:15',
            end: '23:00'
          }">
      </el-time-select>
      <span style="margin-left: 10px;margin-right: 20px">至</span>
      <el-time-select
        placeholder="结束时间"
        v-model="endTime"
        :clearable="false"
        :disabled="true"
        :picker-options="{
            start: '06:00',
            step: '00:15',
            end: '23:00',
            minTime: startTime
          }">
      </el-time-select>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
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
        length: 0
      }
    },
    methods: {
      init (id, arrangeDate, startTime, endTime, bdTeacherId, bdClassesStudentId, length) {
        this.visible = true
        this.id = id
        this.bdClassesStudentId = bdClassesStudentId
        this.arrangeDate = arrangeDate
        this.startTime = startTime
        this.endTime = endTime
        this.bdTeacherId = bdTeacherId
        this.length = length
      },
      dataFormSubmit () {
        let num = this.endTime.substr(0, 2) - this.startTime.substr(0, 2) + (this.endTime.substr(3, 2) - this.startTime.substr(3, 2)) / 60
        let remainNum = 0
        this.$http({
          url: this.$http.adornUrl(`/business/classesstudent/info/${this.bdClassesStudentId}`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          if (data && data.code === 0) {
            remainNum = data.classesStudent.remainNum
            if (remainNum < num) {
              this.$message({
                message: '当前剩余课时不足！最新剩余课时：' + remainNum,
                type: 'warning',
                duration: 3000
              })
            } else {
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
                  'bdTeacherId': this.bdTeacherId
                })
              }).then(({data}) => {
                if (data && data.code === 0) {
                  this.$message({
                    message: '保存成功！',
                    type: 'success',
                    duration: 1500
                  })
                } else {
                  this.$message({
                    message: data.msg,
                    type: 'error',
                    duration: 5000
                  })
                }
              })
            }
          } else {
            this.$message({
              message: '无法找到记录！请确认！',
              type: 'warning',
              duration: 3000
            })
          }
        })
      },
      startTimeChange () {
        if (this.length > 0) {
          let date = moment(this.arrangeDate + ' ' + this.startTime)
          this.endTime = date.add(this.length, 'minutes').format('HH:mm')
        }
      }
    }
  }
</script>

<style scoped>

</style>
