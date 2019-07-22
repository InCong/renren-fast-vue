<template>
  <el-dialog
    :title="'排课 — 【' + title + '】'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <div style="text-align: center;margin-bottom: 30px">
        <el-radio-group v-model="dataForm.arrangeDate">
          <el-radio-button v-for="item in dayList" v-bind:key="item" :label="item" style="margin-right: 20px">{{item.substring(5)}}</el-radio-button>
        </el-radio-group>
      </div>
      <div style="text-align: center;margin-bottom: 30px">
        <el-time-select
          placeholder="起始时间"
          v-model="dataForm.startTime"
          :picker-options="{
              start: '06:00',
              step: '00:15',
              end: '23:00',
              maxTime: this.dataForm.endTime
            }">
        </el-time-select>
        <span style="margin-left: 10px;margin-right: 20px">至</span>
        <el-time-select
          placeholder="结束时间"
          v-model="dataForm.endTime"
          :picker-options="{
              start: '06:00',
              step: '00:15',
              end: '23:00',
              minTime: this.dataForm.startTime
            }">
        </el-time-select>
      </div>
      <el-divider></el-divider>
      <div style="text-align: center;margin-bottom: 30px;margin-top: 30px">
        <el-radio-group v-model="radioClassWay" @change="classWayChange">
          <el-radio-button v-for="item in classWayList" v-bind:key="item.id" :label="item.id" style="margin-right: 20px">{{item.name}}</el-radio-button>
        </el-radio-group>
      </div>
      <div style="text-align: center">
        <el-radio-group v-model="dataForm.bdClassesStudentId" @change="">
          <el-tooltip v-for="item in classesList" v-bind:key="item.id" effect="light" placement="right">
            <div slot="content" style="text-align: left;font-size: 16px">
              <el-row><span>剩余课时：</span>{{item.remainNum}}</el-row>
              <el-row><span>备注：</span>{{item.remark}}</el-row>
            </div>
            <el-radio-button :label="item.id" style="margin-right: 20px">{{item.className}}</el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-radio v-model="radioType" label="1">单次</el-radio>
      <el-radio v-model="radioType" label="2">循环</el-radio>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        // 以下是基本变量
        visible: false,
        bdTeacherId: null,
        bdStudentId: null,
        title: '',
        dayList: [],
        classWayList: [],
        classesList: [],
        // 以下是单选的变量
        radioClassWay: '',
        radioType: '1',
        // 以下是表单变量
        dataForm: {
          arrangeDate: '',
          startTime: '',
          endTime: '',
          bdClassesStudentId: ''
        },
        dataRule: {
          arrangeDate: [
            { required: true, message: '日期不能为空', trigger: 'blur' }
          ],
          startTime: [
            { required: true, message: '开始时间不能为空', trigger: 'blur' }
          ],
          endTIme: [
            { required: true, message: '结束时间不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (bdTeacherId, bdStudentId, title, dayList) {
        this.visible = true
        this.bdTeacherId = bdTeacherId
        this.bdStudentId = bdStudentId
        this.title = title
        this.dayList = dayList
        this.dataForm.arrangeDate = dayList[0]
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
        this.$http({
          url: this.$http.adornUrl('/basic/classway/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 0,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.classWayList = data.page.list
        })

        // 组件看不见时调用，清空数组
        this.over = () => {
          this.classesList = []
          this.dataForm.arrangeDate = ''
          this.dataForm.startTime = ''
          this.dataForm.endTime = ''
          this.dataForm.bdClassesStudentId = ''
        }
      },
      dataFormSubmit: function () {
        if (this.dataForm.arrangeDate === '') {
          this.$message({
            message: '请选择安排日期！！',
            type: 'warning',
            duration: 1500
          })
        } else if (this.dataForm.startTime === '') {
          this.$message({
            message: '请选择开始时间！！',
            type: 'warning',
            duration: 1500
          })
        } else if (this.dataForm.endTime === '') {
          this.$message({
            message: '请选择结束时间！！',
            type: 'warning',
            duration: 1500
          })
        } else if (this.dataForm.bdClassesStudentId === '') {
          this.$message({
            message: '请选择指定学员的课程！！',
            type: 'warning',
            duration: 1500
          })
        } else {
          // 先检查选定的学生课程所剩课时足不足够，若足够再保存
          let num = this.dataForm.endTime.substr(0, 2) - this.dataForm.startTime.substr(0, 2) + (this.dataForm.endTime.substr(3, 2) - this.dataForm.startTime.substr(3, 2)) / 60
          console.log('选择课时：' + num)
          this.$http({
            url: this.$http.adornUrl(`/business/classesstudent/info/${this.dataForm.bdClassesStudentId}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              if (data.classesStudent.remainNum < num) {
                this.$message({
                  message: '当前剩余课时不足！最新剩余课时：' + data.classesStudent.remainNum,
                  type: 'warning',
                  duration: 3000
                })
              } else {
                console.log('提交！！！')
              }
            } else {
              this.$message({
                message: '无法找到记录！请确认！',
                type: 'warning',
                duration: 3000
              })
            }
          })
        }
      },
      // 课程类型选择变更事件
      classWayChange () {
        if (this.dataForm.arrangeDate === '') {
          this.$message({
            message: '请选择安排日期！！',
            type: 'warning',
            duration: 1500
          })
          this.radioClassWay = ''
        } else if (this.dataForm.startTime === '') {
          this.$message({
            message: '请选择开始时间！！',
            type: 'warning',
            duration: 1500
          })
          this.radioClassWay = ''
        } else if (this.dataForm.endTime === '') {
          this.$message({
            message: '请选择结束时间！！',
            type: 'warning',
            duration: 1500
          })
          this.radioClassWay = ''
        } else {
          this.$http({
            url: this.$http.adornUrl('/business/studentclassarrange/targetClassArrange'),
            method: 'post',
            data: this.$http.adornData({
              'bdTeacherId': this.bdTeacherId,
              'bdStudentId': this.bdStudentId,
              'bdClassWayId': this.radioClassWay
            })
          }).then(({data}) => {
            this.classesList = data.list
          })
        }
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      }
    }
  }
</script>

<style>
  .el-radio-button__inner {
    background: antiquewhite;
    border-left:1px;
  }

</style>
