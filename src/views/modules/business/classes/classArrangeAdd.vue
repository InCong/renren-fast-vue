<template>
  <el-dialog
    :title="'排课 — 【' + title + '】'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog">
    <el-divider content-position="left"><span style="color: #00a0e9">日期与时间</span></el-divider>
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <div style="text-align: center;margin-bottom: 30px;margin-top: 30px">
        <el-radio-group v-model="dataForm.arrangeDate" @change="clearClassSelect">
          <el-radio-button v-for="item in dayList" v-bind:key="item.id" v-if="item.length > 5" :label="item" style="margin-right: 20px">
            <div>
              <el-row style="margin-bottom: 5px">{{showWeek(item)}}</el-row>
              <el-row>{{item.substring(5)}}</el-row>
            </div>
          </el-radio-button>
        </el-radio-group>
      </div>
      <div style="text-align: center;margin-bottom: 30px">
        <el-switch
          v-model="isTimeSelect"
          active-text="选择时间"
          inactive-text="填写时间"
          style="margin-right: 10px">
        </el-switch>
        <el-input
          v-model="hours"
          v-if="!isTimeSelect"
          type="number"
          placeholder="时"
          style="width: 80px"
          @change="hourChange">
        </el-input>
        <a v-if="!isTimeSelect">：</a>
        <el-input
          v-model="minutes"
          v-if="!isTimeSelect"
          type="number"
          placeholder="分"
          style="width: 80px"
          @change="minuteChange">
        </el-input>
        <el-time-select
          placeholder="起始时间"
          v-model="dataForm.startTime"
          v-if="isTimeSelect"
          style="width: 120px"
          @change="startTimeChange"
          :editable="false"
          :clearable="false"
          :picker-options="{
              start: '07:00',
              step: '00:15',
              end: '22:00'
            }">
        </el-time-select>
        <span style="margin-left: 10px;margin-right: 20px">至</span>
        <el-time-select
          placeholder="结束时间"
          v-model="dataForm.endTime"
          style="width: 120px"
          :clearable="false"
          :disabled="true"
          :picker-options="{
              start: '07:00',
              step: '00:01',
              end: '23:00',
              minTime: dataForm.startTime
            }">
        </el-time-select>
        <el-switch
          v-model="isTimeChange"
          active-text="修改时长"
          :disabled="classLength <= 0"
          style="margin-left: 10px">
        </el-switch>
        <el-input
          v-model="classLength"
          :disabled="!isTimeChange || classLength <= 0"
          type="number"
          style="width: 80px"
          @change="classLengthChange">
        </el-input>
      </div>
      <el-divider content-position="left"><span style="color: #00a0e9">课程</span></el-divider>
      <div style="text-align: center;margin-bottom: 30px;margin-top: 30px">
        <el-radio-group v-model="radioClassWay" @change="classWayChange">
          <el-radio-button v-for="item in classWayList" v-bind:key="item.id" :label="item" style="margin-right: 20px">{{item.name}}</el-radio-button>
        </el-radio-group>
        <el-button type="success" @click="specialClassClick">班课参考</el-button>
      </div>
      <div style="text-align: center;margin-bottom: 20px">
        <el-radio-group v-model="dataForm.bdClassesStudentId" @change="classChange">
          <el-tooltip v-for="item in classesList" v-bind:key="item.id" effect="light" placement="right">
            <div slot="content" style="text-align: left;font-size: 16px">
              <el-row style="margin-bottom: 10px"><span>剩余课时：</span>{{item.remainNum}}</el-row>
              <el-row style="margin-bottom: 10px"><span>课程时长（分钟）：</span>{{item.length}}</el-row>
              <el-row><span>备注：</span>{{item.remark}}</el-row>
            </div>
            <el-radio-button :label="item.id + '_' + item.length" style="margin-right: 20px;margin-bottom: 10px">{{item.className}}</el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </div>
      <div style="text-align: center;margin-bottom: 10px">
        <span v-if="count !== ''">已安排学员数量：{{count}}</span>
      </div>
      <el-divider content-position="left"><span style="color: #00a0e9">自动提醒</span></el-divider>
      <div style="margin-top: 30px;margin-bottom: 30px;text-align: center">
        <el-switch
          v-model="isAutoNotice"
          active-text="是否自动提醒"
          inactive-value="0"
          active-value="1"
          @change="changeAutoNotice">
        </el-switch>
        <el-tooltip placement="top" effect="light" style="margin-left: 10px">
          <div slot="content">系统会将第二天的课程提醒信息于当天10点通过微信公众号群发给对应的教师、家长。</div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <el-divider content-position="left"><span style="color: #00a0e9">备注</span></el-divider>
      <div style="text-align: center;margin-top: 30px">
        <el-input type="text" v-model="dataForm.remark" placeholder="请输入备注" maxlength="50" show-word-limit style="width: 70%"></el-input>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-radio v-model="radioType" label="1">单次</el-radio>
      <el-radio v-model="radioType" label="2">循环</el-radio>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
    <select-reference-class v-if="selectReferenceClassVisible" ref="selectReferenceClass" @getReferenceTime="getReferenceTime" @referenceTimeClose="referenceTimeClose"></select-reference-class>
  </el-dialog>
</template>

<script>
  import moment from 'moment'
  import 'moment/locale/zh-cn'
  import DatePicker from 'vue2-datepicker'
  import SelectReferenceClass from './selectReferenceClass'
  export default {
    components: {
      SelectReferenceClass,
      DatePicker
    },
    data () {
      return {
        // 以下是基本变量
        visible: false,
        bdTeacherId: null,
        bdStudentId: null,
        title: '',
        dayList: [],
        classWayList: [{
          id: 1,
          name: '一对一'
        }, {
          id: 2,
          name: '一对多'
        }, {
          id: 3,
          name: '多对一'
        }, {
          id: 4,
          name: '多对多'
        }],
        classesList: [],
        // classDisabled: true,
        classLength: 0,
        isSpecialClassClick: false,
        selectReferenceClassVisible: false,
        count: '',
        // 时间选择或填写的模式
        isTimeSelect: true,
        hours: null,
        minutes: null,
        // 时长修改选择
        isTimeChange: false,
        // 以下是单选的变量
        radioClassWay: '',
        radioType: '1',
        isAutoNotice: '1',
        // 以下是表单变量
        dataForm: {
          arrangeDate: '',
          startTime: '',
          endTime: '',
          bdClassesStudentId: '',
          remark: ''
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
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.classesList = []
          this.dataForm.arrangeDate = ''
          this.dataForm.startTime = ''
          this.dataForm.endTime = ''
          this.dataForm.bdClassesStudentId = ''
          this.dataForm.remark = ''
          this.radioClassWay = ''
          this.radioType = '1'
          this.visible = false
          // this.classDisabled = true
          this.classLength = 0
          this.isSpecialClassClick = false
          this.count = ''
          this.isTimeSelect = true
          this.hours = ''
          this.minutes = ''
          this.isTimeChange = false
          this.isAutoNotice = '1'
          this.$emit('refreshClassArrange')
        }
      },
      dataFormSubmit: function () {
        if (!this.isTimeSelect && this.hours < 7) {
          this.$message({
            message: '起始时间需要大于或等于7点！！',
            type: 'warning',
            duration: 1500
          })
        } else if (this.classLength < 30) {
          this.$message({
            message: '课程时长不能小于30分钟！！',
            type: 'warning',
            duration: 1500
          })
        } else if (this.dataForm.arrangeDate === '') {
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
        } else if (this.radioClassWay === 1 && this.count > 0) {
          this.$message({
            message: '该教师在该日期时间内已安排一对一的课程，无法再安排其它一对一课程！！',
            type: 'warning',
            duration: 1500
          })
        } else {
          // 先检查选定的学生课程所剩课时足不足够，若足够再保存
          let num = this.dataForm.endTime.substr(0, 2) - this.dataForm.startTime.substr(0, 2) + (this.dataForm.endTime.substr(3, 2) - this.dataForm.startTime.substr(3, 2)) / 60
          // 四舍五入取整
          // num = Math.ceil(num)
          // 截取小数点后2位
          num = parseFloat(num).toFixed(2)
          let remainNum = 0
          this.$http({
            url: this.$http.adornUrl(`/business/classesstudent/info/${this.dataForm.bdClassesStudentId.substring(0, this.dataForm.bdClassesStudentId.indexOf('_'))}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              remainNum = data.classesStudent.remainNum
              if (remainNum < 1) {
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
                      'remark': this.dataForm.remark,
                      'num': num,
                      'length': this.classLength,
                      'isAutoNotice': this.isAutoNotice,
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
                      this.dataForm.remark = ''
                      this.radioClassWay = ''
                      // this.classDisabled = true
                      this.hours = ''
                      this.minutes = ''
                      this.isTimeChange = false
                      this.classLength = 0
                      this.isAutoNotice = '1'
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
                      'remark': this.dataForm.remark,
                      'num': num,
                      'length': this.classLength,
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
                      this.dataForm.remark = ''
                      this.radioClassWay = ''
                      this.hours = ''
                      this.minutes = ''
                      this.isTimeChange = false
                      this.classLength = 0
                      this.isAutoNotice = '1'
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
          // this.classDisabled = false
          this.hours = moment(this.dataForm.arrangeDate + ' ' + this.dataForm.startTime).hour()
          this.minutes = moment(this.dataForm.arrangeDate + ' ' + this.dataForm.startTime).minute()
        } else {
          this.hours = ''
          this.minutes = ''
        }
        if (this.classLength > 0) {
          let date = moment(this.dataForm.arrangeDate + ' ' + this.dataForm.startTime)
          this.dataForm.endTime = date.add(this.classLength, 'minutes').format('HH:mm')
        }
        this.clearClassSelect()
      },
      // 课程类型选择变更事件
      classWayChange () {
        this.clearClassSelect()
        let classWay = this.radioClassWay.id
        this.$http({
          url: this.$http.adornUrl('/business/studentclassarrange/targetClassArrange'),
          method: 'post',
          data: this.$http.adornData({
            'bdTeacherId': this.bdTeacherId,
            'bdStudentId': this.bdStudentId,
            'bdClassWayId': classWay
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.classesList = data.list
          } else {
            this.classesList = []
          }
        })
        this.isSpecialClassClick = false
      },
      // 课程选择变更事件
      classChange (bdClassesStudentId) {
        let id = bdClassesStudentId.substring(0, bdClassesStudentId.indexOf('_'))
        if (!this.isSpecialClassClick) {
          this.classLength = bdClassesStudentId.substring(bdClassesStudentId.indexOf('_') + 1)
          let date = moment(this.dataForm.arrangeDate + ' ' + this.dataForm.startTime)
          this.dataForm.endTime = date.add(this.classLength, 'minutes').format('HH:mm')
          // 获取该课程在指定日期时间里的学员数量
          this.$http({
            url: this.$http.adornUrl('/business/studentclassarrange/getClassStudentCount'),
            method: 'post',
            data: this.$http.adornData({
              'bdClassesStudentId': id,
              'arrangeDate': this.dataForm.arrangeDate,
              'startTime': this.dataForm.startTime
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.count = data.count
            } else {
              this.count = 0
            }
          })
        } else {
          this.selectReferenceClassVisible = true
          this.$nextTick(() => {
            let endDate = ''
            for (var i = 0; i < 7; i++) {
              if (this.dayList[i] === null) {
                endDate = this.dayList[i - 1]
                break
              }
              if (i === 6) {
                if (this.dayList[i] != null) {
                  endDate = this.dayList[i]
                } else {
                  endDate = this.dayList[0]
                }
              }
            }
            this.$refs.selectReferenceClass.init(id, this.dayList[0], endDate)
          })
        }
      },
      // 获取作为参考的班课开始、结束时间
      getReferenceTime (arrangeDate, startTime, endTime, length) {
        this.dataForm.arrangeDate = arrangeDate
        this.dataForm.startTime = startTime
        this.dataForm.endTime = endTime
        this.classLength = length
      },
      // 取消选择参考班课的对话框
      referenceTimeClose () {
        this.dataForm.bdClassesStudentId = ''
      },
      // 待定班课点击
      specialClassClick () {
        this.dataForm.startTime = ''
        this.dataForm.endTime = ''
        this.dataForm.bdClassesStudentId = ''
        this.radioClassWay = ''
        this.classLength = 0
        // this.classDisabled = true
        this.$http({
          url: this.$http.adornUrl('/business/studentclassarrange/targetClassArrange'),
          method: 'post',
          data: this.$http.adornData({
            'bdTeacherId': this.bdTeacherId,
            'bdStudentId': this.bdStudentId
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.classesList = data.list
          } else {
            this.classesList = []
          }
        })
        this.isSpecialClassClick = true
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      },
      // 清除课程选择
      clearClassSelect () {
        this.dataForm.bdClassesStudentId = ''
        this.count = ''
      },
      // 数字左补零
      prefixInt (num, length) {
        return (Array(length).join('0') + num).slice(-length)
      },
      // 小时变化
      hourChange () {
        if (this.hours !== '') {
          if (this.minutes === '') {
            this.minutes = 0
          }
          // this.classDisabled = false
          this.dataForm.startTime = this.prefixInt(this.hours, 2) + ':' + this.prefixInt(this.minutes, 2)
          console.log(this.dataForm.startTime)
        } else {
          this.minutes = ''
          this.dataForm.startTime = ''
        }
        if (this.classLength > 0) {
          let date = moment(this.dataForm.arrangeDate + ' ' + this.dataForm.startTime)
          this.dataForm.endTime = date.add(this.classLength, 'minutes').format('HH:mm')
        }
      },
      // 分钟变化
      minuteChange () {
        if (this.minutes !== '') {
          this.dataForm.startTime = this.prefixInt(this.hours, 2) + ':' + this.prefixInt(this.minutes, 2)
        } else if (this.hours !== '' && this.minutes === '') {
          this.minutes = 0
          this.dataForm.startTime = this.prefixInt(this.hours, 2) + ':' + this.prefixInt(this.minutes, 2)
        }
        console.log(this.dataForm.startTime)
        if (this.classLength > 0) {
          let date = moment(this.dataForm.arrangeDate + ' ' + this.dataForm.startTime)
          this.dataForm.endTime = date.add(this.classLength, 'minutes').format('HH:mm')
        }
      },
      // 时长变化
      classLengthChange () {
        if (this.classLength > 0) {
          let date = moment(this.dataForm.arrangeDate + ' ' + this.dataForm.startTime)
          this.dataForm.endTime = date.add(this.classLength, 'minutes').format('HH:mm')
        }
      },
      // 变更自动提醒
      changeAutoNotice () {

      },
      showWeek (date) {
        return moment(date).format('ddd')
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
