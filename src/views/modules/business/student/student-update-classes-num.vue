<template>
  <el-dialog
    title="购买课时"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="教师" prop="">
        <el-input placeholder="教师" :disabled="true" :value="teacherName"></el-input>
      </el-form-item>
      <el-form-item label="其它教师" prop="classTeacherSelect">
        <el-select v-model="classTeacherSelect" clearable placeholder="选择其它教师作为该课程的任课教师" filterable multiple style="width: 50%">
          <el-option
            v-for="item in classTeacherList"
            :key="item.bdTeacherId"
            :label="item.bdTeacherName"
            :value="item.bdTeacherId">
          </el-option>
        </el-select>
        <el-tooltip placement="top" effect="light">
          <div slot="content">选择其它教师，系统则会认为所选择的教师都一起任教该课程、指导该学员。</div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="课程" prop="">
        <el-input placeholder="课程" :disabled="true" :value="classesName"></el-input>
      </el-form-item>
      <el-form-item label="课时" prop="num">
        <el-input v-model="dataForm.num" placeholder="课时数量" type="number" @input="numChange()"></el-input>
      </el-form-item>
      <el-form-item label="剩余课时" prop="remainNum">
        <el-input v-model="dataForm.remainNum" placeholder="剩余课时" :disabled="true" type="number"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      var valiNum = (rule, value, callback) => {
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
          num: 0,
          remainNum: 0,
          remark: ''
        },
        dataRule: {
          bdClassesId: [
            { required: true, message: '课程不能为空', trigger: 'blur' }
          ],
          num: [
            { required: true, message: '课时数量不能为空', trigger: 'blur' },
            { validator: valiNum, trigger: 'blur' }
          ]
        },
        teacherList: [],
        classList: [],
        classSelectVisible: true,
        // 课程教师关系
        classTeacherList: [],
        classTeacherPreSelect: [],
        classTeacherSelect: []
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
              this.dataForm.num = data.classesStudent.num
              this.dataForm.remainNum = data.classesStudent.remainNum
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
        // 如果变更使课时大于(剩余课时+原始已用课时)，剩余课时等于新课时-原始已用课时
        if (this.dataForm.num > this.originalRemainNum + this.diffNum) {
          this.dataForm.remainNum = this.dataForm.num - this.diffNum
        // 如果变更使课时小于(剩余课时+原始已用课时) 且 课时大于剩余课时，剩余课时不变
        } else if (this.dataForm.num > this.originalRemainNum && this.dataForm.num < this.originalRemainNum + this.diffNum) {
          this.dataForm.remainNum = this.originalRemainNum
        // 如果变更为原来的课时，则剩余课时也变更为原来的数值
          // eslint-disable-next-line eqeqeq
        } else if (this.dataForm.num == 9) {
          this.dataForm.remainNum = this.originalRemainNum
        } else {
          this.dataForm.remainNum = this.dataForm.num
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

</style>
