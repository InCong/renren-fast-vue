<template>
  <el-dialog
    title="修改"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog"
  >
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="教师" prop="">
        <el-input placeholder="教师" :disabled="true" :value="teacherName" />
      </el-form-item>
      <el-form-item label="其它教师" prop="classTeacherSelect">
        <el-select v-model="classTeacherSelect" clearable placeholder="选择其它教师作为该课程的任课教师" filterable multiple style="width: 50%">
          <el-option
            v-for="item in classTeacherList"
            :key="item.bdTeacherId"
            :label="item.bdTeacherName"
            :value="item.bdTeacherId"
          />
        </el-select>
        <el-tooltip placement="top" effect="light">
          <div slot="content">
            选择其它教师，系统则会认为所选择的教师都一起任教该课程、指导该学员。
          </div>
          <i class="el-icon-question" />
        </el-tooltip>
      </el-form-item>
      <el-form-item label="课程" prop="">
        <el-input placeholder="课程" :disabled="true" :value="classesName" />
      </el-form-item>
      <el-form-item label="现价(元)" prop="currentPrice">
        <el-input-number v-model="dataForm.currentPrice" placeholder="限价" :min="0" :step="1" :precision="2" :disabled="true" />
      </el-form-item>
      <el-form-item label="课时" prop="num">
        <el-input v-model="dataForm.num" placeholder="课时数量" type="number" @input="numChange()" />
      </el-form-item>
      <el-form-item label="剩余课时" prop="remainNum">
        <el-input v-model="dataForm.remainNum" placeholder="剩余课时" :disabled="true" type="number" />
      </el-form-item>
      <el-form-item label="类型" prop="otherType">
        <el-select v-model="dataForm.otherType" placeholder="请选择">
          <el-option
            v-for="item in otherTypeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button @click="openChangeDialog">转移课程</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
    <el-dialog
      title="转移课程"
      :append-to-body="true"
      :close-on-click-modal="false"
      :visible.sync="changeTeacherDialogVisible"
      width="30%"
    >
      <el-form ref="dataForm1" :model="dataForm1" :rules="dataRule1" label-width="80px">
        <el-form-item label="教师" prop="targetTeacherId">
          <el-select v-model="dataForm1.targetTeacherId" clearable placeholder="选择目标教师" filterable style="width: 50%">
            <el-option
              v-for="item in classTeacherList"
              :key="item.bdTeacherId"
              :label="item.bdTeacherName"
              :value="item.bdTeacherId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="转移课时" prop="num">
          <el-input-number v-model="dataForm1.targetNum" :min="1" :max="dataForm.remainNum" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeTeacherDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changeClassTeacher">确定</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      const valiNum = (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('课时不能小于等于0'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        teacherName: '',
        classesName: '',
        bdClassesId: '',
        bdTeacherId: '',
        diffNum: 0,
        originalRemainNum: 0,
        dataForm: {
          id: 0,
          currentPrice: 0,
          num: 0,
          remainNum: 0,
          otherType: 1,
          remark: ''
        },
        dataRule: {
          bdClassesId: [
            { required: true, message: '课程不能为空', trigger: 'blur' }
          ],
          num: [
            { required: true, message: '课时数量不能为空', trigger: 'blur' },
            { validator: valiNum, trigger: 'blur' }
          ],
          otherType: [
            { required: true, message: '其它类型不能为空', trigger: 'blur' }
          ]
        },
        teacherList: [],
        classList: [],
        classSelectVisible: true,
        // 课程教师关系
        classTeacherList: [],
        classTeacherPreSelect: [],
        classTeacherSelect: [],
        // 弹出界面 选择转移教师
        changeTeacherDialogVisible: false,
        dataForm1: {
          targetTeacherId: '',
          targetNum: 0
        },
        dataRule1: {
          targetTeacherId: [
            { required: true, message: '目标教师不能为空', trigger: 'blur' }
          ]
        },
        // 其它类型
        otherTypeList: [{
          id: 1,
          name: '普通'
        }, {
          id: 2,
          name: '赠送'
        }]
      }
    },
    methods: {
      init (id, teacherName, classesName, bdClassesId, bdTeacherId) {
        this.visible = true
        this.teacherName = teacherName
        this.classesName = classesName
        this.bdClassesId = bdClassesId
        this.bdTeacherId = bdTeacherId
        this.dataForm.id = id
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/business/classesstudent/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.currentPrice = data.classesStudent.currentPrice
              this.dataForm.num = data.classesStudent.num
              this.dataForm.remainNum = data.classesStudent.remainNum
              this.dataForm.otherType = data.classesStudent.otherType
              this.dataForm.remark = data.classesStudent.remark
              this.diffNum = this.dataForm.num - this.dataForm.remainNum
              this.originalRemainNum = this.dataForm.remainNum
              this.$http({
                url: this.$http.adornUrl('/business/classesteacher/listTeacherByBdClassesId'),
                method: 'post',
                data: this.$http.adornData({
                  'bdClassesId': this.bdClassesId,
                  'bdTeacherId': this.bdTeacherId
                })
              }).then(({data}) => {
                if (data && data.code === 0) {
                  this.classTeacherList = data.list
                } else {
                  this.classTeacherList = []
                }
              })
              this.$http({
                url: this.$http.adornUrl('/business/classesstudentotherteacher/listOtherTeacher'),
                method: 'post',
                data: this.$http.adornData({
                  'bdClassesStudentId': this.dataForm.id
                })
              }).then(({data}) => {
                if (data && data.code === 0) {
                  this.classTeacherPreSelect = data.list
                  this.classTeacherSelect = data.list
                } else {
                  this.classTeacherPreSelect = []
                  this.classTeacherSelect = []
                }
              })
            }
          })
        }
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.classTeacherList = []
          this.classTeacherPreSelect = []
          this.classTeacherSelect = []
          this.changeTeacherDialogVisible = false
        }
      },
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl('/business/classesstudent/update'),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id,
                'num': this.dataForm.num,
                'remainNum': this.dataForm.remainNum,
                'otherType': this.dataForm.otherType,
                'remark': this.dataForm.remark
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$http({
                  url: this.$http.adornUrl('/business/classesstudentotherteacher/saveOtherTeacher'),
                  method: 'post',
                  data: this.$http.adornData({
                    'preValue': this.classTeacherPreSelect,
                    'currentValue': this.classTeacherSelect,
                    'bdClassesStudentId': this.dataForm.id
                  })
                }).then(({data}) => {
                  if (data && data.code === 0) {
                    this.$message({
                      message: '修改成功',
                      type: 'success',
                      duration: 1500,
                      onClose: () => {
                        this.visible = false
                        this.$emit('refreshDataList')
                      }
                    })
                  } else {
                    this.$message({
                      message: '保存出错！',
                      type: 'error',
                      duration: 1500
                    })
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      // 课时变更时，同步变更剩余课时
      numChange () {
        // 如果变更使课时大于(原始剩余课时 + 原始已用课时)，剩余课时等于新课时-原始已用课时
        if (this.dataForm.num > this.originalRemainNum + this.diffNum) {
          this.dataForm.remainNum = this.dataForm.num - this.diffNum
          // 如果变更使课时小于(原始剩余课时 + 原始已用课时) 且 课时大于剩余课时，剩余课时不变
        } else if (this.dataForm.num > this.originalRemainNum && this.dataForm.num < this.originalRemainNum + this.diffNum) {
          this.dataForm.remainNum = this.originalRemainNum
          // 如果变更为原来的课时，则剩余课时也变更为原来的数值
        } else if (this.dataForm.num === this.originalRemainNum + this.diffNum) {
          this.dataForm.remainNum = this.originalRemainNum
        } else {
          this.dataForm.remainNum = this.dataForm.num
        }
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      },
      changeClassTeacher () {
        this.$refs['dataForm1'].validate((valid) => {
          if (valid) {
            let targetTeacherName = ''
            for (let i = 0; i < this.classTeacherList.length; i++) {
              let item = this.classTeacherList[i]
              if (item.bdTeacherId === this.dataForm1.targetTeacherId) {
                targetTeacherName = item.bdTeacherName
                break
              }
            }
            this.$http({
              url: this.$http.adornUrl('/business/classesstudent/changeTeacher'),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id,
                'targetTeacherId': this.dataForm1.targetTeacherId,
                'targetTeacherName': targetTeacherName,
                'targetNum': this.dataForm1.targetNum
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '转移成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.changeTeacherDialogVisible = false
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              }
            })
          }
        })
      },
      openChangeDialog () {
        if (this.dataForm.remainNum > 0) {
          this.changeTeacherDialogVisible = true
          this.$nextTick(() => {
            this.$refs['dataForm1'].resetFields()
          })
          this.dataForm1.targetNum = this.dataForm.remainNum
        } else {
          this.$message({
            message: '剩余课时为0，无法转移！',
            type: 'warning',
            duration: 1500
          })
        }
      }
    }
  }
</script>

<style>

</style>
