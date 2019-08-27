<template>
  <el-dialog
    title="购买课时"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="教师" prop="bdTeacherId">
        <el-select v-model="dataForm.bdTeacherId" clearable placeholder="先选择教师，再选择课程" filterable @change="handleITeacherChange">
          <el-option
            v-for="item in teacherList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="课程" prop="bdClassesId">
        <el-select v-model="dataForm.bdClassesId" clearable placeholder="请选择课程" filterable :disabled="classSelectDisable" @change="handleClassChange">
          <el-option
            v-for="item in classList"
            :key="item.bdClassesId"
            :label="item.bdClassesName"
            :value="item.bdClassesId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="其它教师" prop="classTeacherSelect">
        <el-select v-model="classTeacherSelect" clearable placeholder="选择其它教师作为该课程的任课教师" filterable multiple :disabled="classTeacherDisable" style="width: 50%">
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
        studentId: 0,
        visible: false,
        dataForm: {
          bdClassesId: '',
          bdTeacherId: '',
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
        // 教师
        teacherList: [],
        // 课程
        classList: [],
        classSelectDisable: true,
        // 课程教师关系
        classTeacherList: [],
        classTeacherPreSelect: [],
        classTeacherSelect: [],
        classTeacherDisable: true
      }
    },
    methods: {
      init (id) {
        this.visible = true
        this.studentId = id
        this.classList = []
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
        this.$http({
          url: this.$http.adornUrl('/business/teacher/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以获取全部机构部门的列表
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.teacherList = data.page.list
          } else {
            this.teacherList = []
          }
        })
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.teacherList = []
          this.classList = []
          this.classSelectDisable = true
          this.classTeacherList = []
          this.classTeacherPreSelect = []
          this.classTeacherSelect = []
          this.classTeacherDisable = true
        }
      },
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl('/business/classesstudent/save'),
              method: 'post',
              data: this.$http.adornData({
                'bdStudentId': this.studentId,
                'bdClassesId': this.dataForm.bdClassesId,
                'bdTeacherId': this.dataForm.bdTeacherId,
                'num': this.dataForm.num,
                'remainNum': this.dataForm.remainNum,
                'remark': this.dataForm.remark
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '购买成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
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
        this.dataForm.remainNum = this.dataForm.num
      },
      // 教师选择器变更选择时的事件
      handleITeacherChange () {
        if (this.dataForm.bdTeacherId != null && this.dataForm.bdTeacherId !== '') {
          this.classSelectDisable = false
          this.$http({
            url: this.$http.adornUrl('/business/classesteacher/listClassesByTeacherId'),
            method: 'post',
            data: this.$http.adornData({
              'bdTeacherId': this.dataForm.bdTeacherId
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.classList = data.list
            } else {
              this.classList = []
            }
          })
        } else {
          this.classSelectDisable = true
          this.classList = []
        }
      },
      // 课程选择变更
      handleClassChange () {
        if (this.dataForm.bdClassesId != null && this.dataForm.bdClassesId !== '') {
          this.classTeacherDisable = false
          this.$http({
            url: this.$http.adornUrl('/business/classesteacher/listTeacherByBdClassesId'),
            method: 'post',
            data: this.$http.adornData({
              'bdClassesId': this.dataForm.bdClassesId,
              'bdTeacherId': this.dataForm.bdTeacherId
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.classTeacherList = data.list
            } else {
              this.classTeacherList = []
            }
          })
        } else {
          this.classTeacherDisable = true
          this.classTeacherPreSelect = []
          this.classTeacherSelect = []
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
  .el-scrollbar__wrap { overflow: scroll; width: 110%; height: 120%; }
</style>
