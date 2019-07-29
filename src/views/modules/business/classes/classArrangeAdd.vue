<template>
  <el-dialog
    :title="'排课 — 【' + title + '】'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog">
    <el-divider content-position="left"><span style="color: #00a0e9">日期与时间</span></el-divider>
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <div style="text-align: center;margin-bottom: 30px;margin-top: 30px">
        <el-radio-group v-model="dataForm.arrangeDate">
          <el-radio-button v-for="item in dayList" v-bind:key="item" :label="item" style="margin-right: 20px">{{item.substring(5)}}</el-radio-button>
        </el-radio-group>
      </div>
      <div style="text-align: center;margin-bottom: 30px">
        <el-time-select
          placeholder="起始时间"
          v-model="dataForm.startTime"
          @change="startTimeChange"
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
          v-model="dataForm.endTime"
          :clearable="false"
          :disabled="true"
          :picker-options="{
              start: '06:00',
              step: '00:15',
              end: '23:00',
              minTime: dataForm.startTime
            }">
        </el-time-select>
      </div>
      <el-divider content-position="left"><span style="color: #00a0e9">课程</span></el-divider>
      <div style="text-align: center;margin-bottom: 30px;margin-top: 30px">
        <el-radio-group v-model="radioClassWay" @change="classWayChange" :disabled="classDisabled">
          <el-radio-button v-for="item in classWayList" v-bind:key="item.id" :label="item.id" style="margin-right: 20px">{{item.name}}</el-radio-button>
        </el-radio-group>
      </div>
      <div style="text-align: center">
        <el-radio-group v-model="dataForm.bdClassesStudentId" @change="classChange">
          <el-tooltip v-for="item in classesList" v-bind:key="item.id" effect="light" placement="right">
            <div slot="content" style="text-align: left;font-size: 16px">
              <el-row style="margin-bottom: 10px"><span>剩余课时：</span>{{item.remainNum}}</el-row>
              <el-row style="margin-bottom: 10px"><span>课程时长（分钟）：</span>{{item.length}}</el-row>
              <el-row><span>备注：</span>{{item.remark}}</el-row>
            </div>
            <el-radio-button :label="item.id + '_' + item.length" style="margin-right: 20px">{{item.className}}</el-radio-button>
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
  import moment from 'moment'
  import 'moment/locale/zh-cn'
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
        classDisabled: true,
        classLength: 0,
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
          this.radioClassWay = ''
          this.visible = false
          this.classDisabled = true
          this.classLength = 0
          this.$emit('refreshClassArrange')
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
          console.log(parseInt(this.dataForm.bdClassesStudentId.substring(0, this.dataForm.bdClassesStudentId.indexOf('_'))))
          // 先检查选定的学生课程所剩课时足不足够，若足够再保存
          let num = this.dataForm.endTime.substr(0, 2) - this.dataForm.startTime.substr(0, 2) + (this.dataForm.endTime.substr(3, 2) - this.dataForm.startTime.substr(3, 2)) / 60
          let remainNum = 0
          this.$http({
            url: this.$http.adornUrl(`/business/classesstudent/info/${this.dataForm.bdClassesStudentId.substring(0, this.dataForm.bdClassesStudentId.indexOf('_'))}`),
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
                if (this.radioType === '1') {
                  this.$http({
                    url: this.$http.adornUrl('/business/studentclassarrange/saveForOne'),
                    method: 'post',
                    data: this.$http.adornData({
                      'bdClassesStudentId': this.dataForm.bdClassesStudentId.substring(0, this.dataForm.bdClassesStudentId.indexOf('_')),
                      'arrangeDate': this.dataForm.arrangeDate,
                      'startTime': this.dataForm.startTime,
                      'endTime': this.dataForm.endTime,
                      'num': num,
                      'createUserId': this.$store.state.user.id,
                      'bdTeacherId': this.bdTeacherId
                    })
                  }).then(({data}) => {
                    if (data && data.code === 0) {
                      this.$message({
                        message: '保存成功！',
                        type: 'success',
                        duration: 1500
                      })
                      // 保存成功后，重置部分数据
                      this.classesList = []
                      this.dataForm.startTime = ''
                      this.dataForm.endTime = ''
                      this.dataForm.bdClassesStudentId = ''
                      this.radioClassWay = ''
                      this.classDisabled = true
                    } else {
                      this.$message({
                        message: data.msg,
                        type: 'error',
                        duration: 5000
                      })
                    }
                  })
                } else if (this.radioType === '2') {
                  this.$http({
                    url: this.$http.adornUrl('/business/studentclassarrange/saveForCircle'),
                    method: 'post',
                    data: this.$http.adornData({
                      'bdClassesStudentId': this.dataForm.bdClassesStudentId.substring(0, this.dataForm.bdClassesStudentId.indexOf('_')),
                      'arrangeDate': this.dataForm.arrangeDate,
                      'startTime': this.dataForm.startTime,
                      'endTime': this.dataForm.endTime,
                      'num': num,
                      'createUserId': this.$store.state.user.id,
                      'bdTeacherId': this.bdTeacherId,
                      'remainNum': remainNum
                    })
                  }).then(({data}) => {
                    if (data && data.code === 0) {
                      this.$message({
                        message: data.msg,
                        type: 'success',
                        duration: 5000
                      })
                      // 保存成功后，重置部分数据
                      this.classesList = []
                      this.dataForm.startTime = ''
                      this.dataForm.endTime = ''
                      this.dataForm.bdClassesStudentId = ''
                      this.radioClassWay = ''
                    } else {
                      this.$message({
                        message: data.msg,
                        type: 'error',
                        duration: 5000
                      })
                    }
                  })
                } else {
                  this.$message({
                    message: '请选择单次或循环！！',
                    type: 'warning',
                    duration: 3000
                  })
                }
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
      // 开始时间变更
      startTimeChange () {
        if (this.dataForm.startTime !== '') {
          this.classDisabled = false
        }
        if (this.classLength > 0) {
          let date = moment(this.dataForm.arrangeDate + ' ' + this.dataForm.startTime)
          this.dataForm.endTime = date.add(this.classLength, 'minutes').format('HH:mm')
        }
      },
      // 课程类型选择变更事件
      classWayChange () {
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
      },
      // 课程选择变更事件
      classChange (bdClassesStudentId) {
        this.classLength = bdClassesStudentId.substring(bdClassesStudentId.indexOf('_') + 1)
        let date = moment(this.dataForm.arrangeDate + ' ' + this.dataForm.startTime)
        this.dataForm.endTime = date.add(this.classLength, 'minutes').format('HH:mm')
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
