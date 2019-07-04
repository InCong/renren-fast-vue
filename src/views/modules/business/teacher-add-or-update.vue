<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="名称" prop="name">
      <el-input v-model="dataForm.name" placeholder="名称"></el-input>
    </el-form-item>
    <el-form-item label="性别，0-女，1-男" prop="sex">
      <el-input v-model="dataForm.sex" placeholder="性别，0-女，1-男"></el-input>
    </el-form-item>
    <el-form-item label="年龄" prop="age">
      <el-input v-model="dataForm.age" placeholder="年龄"></el-input>
    </el-form-item>
    <el-form-item label="联系电话" prop="mobile">
      <el-input v-model="dataForm.mobile" placeholder="联系电话"></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="dataForm.email" placeholder="邮箱"></el-input>
    </el-form-item>
    <el-form-item label="是否全职，1-是，0-否" prop="isFullTime">
      <el-input v-model="dataForm.isFullTime" placeholder="是否全职，1-是，0-否"></el-input>
    </el-form-item>
    <el-form-item label="状态，0-未知，1-在职，2-离职，9-其它" prop="status">
      <el-input v-model="dataForm.status" placeholder="状态，0-未知，1-在职，2-离职，9-其它"></el-input>
    </el-form-item>
    <el-form-item label="所属机构ID" prop="bdOrgId">
      <el-input v-model="dataForm.bdOrgId" placeholder="所属机构ID"></el-input>
    </el-form-item>
    <el-form-item label="创建人ID" prop="createUserId">
      <el-input v-model="dataForm.createUserId" placeholder="创建人ID"></el-input>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="创建时间"></el-input>
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
      return {
        visible: false,
        dataForm: {
          id: 0,
          name: '',
          sex: '',
          age: '',
          mobile: '',
          email: '',
          isFullTime: '',
          status: '',
          bdOrgId: '',
          createUserId: '',
          createTime: '',
          remark: ''
        },
        dataRule: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' }
          ],
          sex: [
            { required: true, message: '性别，0-女，1-男不能为空', trigger: 'blur' }
          ],
          age: [
            { required: true, message: '年龄不能为空', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '联系电话不能为空', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '邮箱不能为空', trigger: 'blur' }
          ],
          isFullTime: [
            { required: true, message: '是否全职，1-是，0-否不能为空', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '状态，0-未知，1-在职，2-离职，9-其它不能为空', trigger: 'blur' }
          ],
          bdOrgId: [
            { required: true, message: '所属机构ID不能为空', trigger: 'blur' }
          ],
          createUserId: [
            { required: true, message: '创建人ID不能为空', trigger: 'blur' }
          ],
          createTime: [
            { required: true, message: '创建时间不能为空', trigger: 'blur' }
          ],
          remark: [
            { required: true, message: '备注不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/business/teacher/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.name = data.teacher.name
                this.dataForm.sex = data.teacher.sex
                this.dataForm.age = data.teacher.age
                this.dataForm.mobile = data.teacher.mobile
                this.dataForm.email = data.teacher.email
                this.dataForm.isFullTime = data.teacher.isFullTime
                this.dataForm.status = data.teacher.status
                this.dataForm.bdOrgId = data.teacher.bdOrgId
                this.dataForm.createUserId = data.teacher.createUserId
                this.dataForm.createTime = data.teacher.createTime
                this.dataForm.remark = data.teacher.remark
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/business/teacher/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'name': this.dataForm.name,
                'sex': this.dataForm.sex,
                'age': this.dataForm.age,
                'mobile': this.dataForm.mobile,
                'email': this.dataForm.email,
                'isFullTime': this.dataForm.isFullTime,
                'status': this.dataForm.status,
                'bdOrgId': this.dataForm.bdOrgId,
                'createUserId': this.dataForm.createUserId,
                'createTime': this.dataForm.createTime,
                'remark': this.dataForm.remark
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
      }
    }
  }
</script>
