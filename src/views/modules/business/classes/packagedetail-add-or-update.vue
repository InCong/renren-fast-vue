<template>
  <el-dialog
    :title="!dataForm1.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    :append-to-body="true"
    @close="closeDialog">
    <el-form :model="dataForm1" :rules="dataRule" ref="dataForm1" @keyup.enter.native="dataForm1Submit()" label-width="80px">
      <el-form-item label="教师" prop="bdTeacherId">
        <el-select v-model="dataForm1.bdTeacherId" clearable placeholder="先选择教师，再选择课程" filterable @change="handleITeacherChange">
          <el-option
            v-for="item in teacherList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="课程" prop="bdClassesTeacherId">
        <el-select v-model="dataForm1.bdClassesTeacherId" clearable placeholder="请选择课程" filterable :disabled="classSelectDisable" @change="handleClassChange()">
          <el-option
            v-for="item in classList"
            :key="item.id"
            :label="item.bdClassesName"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="原价" prop="originalPrice">
        <el-input-number v-model="dataForm1.originalPrice" :disabled="true"></el-input-number>
      </el-form-item>
      <el-form-item label="现价" prop="currentPrice">
        <el-input-number v-model="dataForm1.currentPrice" :precision="2"></el-input-number>
      </el-form-item>
      <el-form-item label="课时" prop="originalPrice">
        <el-input-number v-model="dataForm1.num"></el-input-number>
      </el-form-item>
      <el-form-item label="类型" prop="otherType">
        <el-select v-model="dataForm1.otherType" placeholder="请选择">
          <el-option
            v-for="item in otherTypeList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-input v-model="dataForm1.createTime" placeholder="创建时间，自动生成，无需填写" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm1.remark" placeholder="备注"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataForm1Submit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        dataForm1: {
          id: 0,
          name: '',
          teacherName: '',
          originalPrice: '',
          currentPrice: '',
          num: '',
          otherType: '',
          bdClassesTeacherId: '',
          bdPackageId: '',
          createUserId: '',
          createTime: '',
          remark: '',
          bdTeacherId: ''
        },
        dataRule: {
          num: [
            { required: true, message: '课时不能为空', trigger: 'blur' }
          ],
          otherType: [
            { required: true, message: '类型不能为空', trigger: 'blur' }
          ],
          currentPrice: [
            { required: true, message: '现价不能为空', trigger: 'blur' }
          ]
        },
        // 教师
        teacherList: [],
        // 课程
        classList: [],
        classSelectDisable: true,
        // 类型
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
      init (id, bdPackageId) {
        this.dataForm1.id = id || 0
        this.dataForm1.bdPackageId = bdPackageId
        this.classList = []
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm1'].resetFields()
          if (this.dataForm1.id) {
            this.$http({
              url: this.$http.adornUrl(`/business/packagedetail/info/${this.dataForm1.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm1.name = data.packageDetail.name
                this.dataForm1.originalPrice = data.packageDetail.originalPrice
                this.dataForm1.currentPrice = data.packageDetail.currentPrice
                this.dataForm1.num = data.packageDetail.num
                this.dataForm1.otherType = data.packageDetail.otherType
                this.dataForm1.bdClassesTeacherId = data.packageDetail.bdClassesTeacherId
                this.dataForm1.bdTeacherId = data.packageDetail.bdTeacherId
                this.dataForm1.bdPackageId = data.packageDetail.bdPackageId
                this.dataForm1.createTime = data.packageDetail.createTime
                this.dataForm1.remark = data.packageDetail.remark
                this.handleITeacherChange()
              }
            })
          }
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
        })
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.teacherList = []
          this.classList = []
          this.classSelectDisable = true
          this.dataForm1.num = 0
        }
      },
      // 表单提交
      dataForm1Submit () {
        this.$refs['dataForm1'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/business/packagedetail/${!this.dataForm1.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm1.id || undefined,
                'name': this.dataForm1.name,
                'teacherName': this.dataForm1.teacherName,
                'originalPrice': this.dataForm1.originalPrice,
                'currentPrice': this.dataForm1.currentPrice,
                'num': this.dataForm1.num,
                'otherType': this.dataForm1.otherType,
                'bdClassesTeacherId': this.dataForm1.bdClassesTeacherId,
                'bdTeacherId': this.dataForm1.bdTeacherId,
                'bdPackageId': this.dataForm1.bdPackageId,
                'remark': this.dataForm1.remark
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
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
      // 教师选择器变更选择时的事件
      handleITeacherChange () {
        if (this.dataForm1.bdTeacherId != null && this.dataForm1.bdTeacherId !== '') {
          this.classSelectDisable = false
          this.$http({
            url: this.$http.adornUrl('/business/classesteacher/listClassesByTeacherId'),
            method: 'post',
            data: this.$http.adornData({
              'bdTeacherId': this.dataForm1.bdTeacherId
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
        for (let i = 0; i < this.teacherList.length; i++) {
          let item = this.teacherList[i]
          if (item.id === this.dataForm1.bdTeacherId) {
            this.dataForm1.teacherName = item.name
            break
          } else {
            this.dataForm1.teacherName = ''
          }
        }
      },
      handleClassChange () {
        for (let i = 0; i < this.classList.length; i++) {
          let item = this.classList[i]
          if (item.id === this.dataForm1.bdClassesTeacherId) {
            this.dataForm1.bdClassesTeacherId = item.id
            this.dataForm1.name = item.name
            this.dataForm1.originalPrice = item.price
            break
          } else {
            this.dataForm1.name = ''
          }
        }
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      }
    }
  }
</script>
