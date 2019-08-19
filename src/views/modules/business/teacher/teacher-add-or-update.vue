<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-row>
      <el-col :span="16">
        <el-form-item label="名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="dataForm.sex" placeholder="性别，1-男，0-女">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
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
      </el-col>
    </el-row>
    <el-form-item label="是否全职" prop="isFullTime">
      <el-radio-group v-model="dataForm.isFullTime" placeholder="是否全职，1-是，0-否">
        <el-radio :label="1">是</el-radio>
        <el-radio :label="0">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-select v-model="dataForm.status" placeholder="请选择">
        <el-option
          v-for="item in statusList"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="创建时间，自动生成，无需填写" :disabled="true"></el-input>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model="dataForm.remark" placeholder="备注" type="textarea"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { isEmail, isMobile } from '@/utils/validate'
  export default {
    data () {
      var validateMobile = (rule, value, callback) => {
        if (!isMobile(value)) {
          callback(new Error('手机号格式错误'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        imgFlag: false,
        percent: 0,
        dataForm: {
          id: 0,
          name: '',
          sex: '',
          age: '',
          mobile: '',
          email: '',
          isFullTime: '',
          status: '',
          descImgUrl: '',
          bdOrgId: '',
          createUserId: '',
          createTime: '',
          remark: ''
        },
        statusList: [{
          value: 0,
          label: '未知'
        }, {
          value: 1,
          label: '在职'
        }, {
          value: 2,
          label: '离职'
        }, {
          value: 9,
          label: '其它'
        }],
        dataRule: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' }
          ],
          sex: [
            { required: true, message: '性别不能为空', trigger: 'blur' }
          ],
          age: [
            { required: true, message: '年龄不能为空', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '联系电话不能为空', trigger: 'blur' },
            { validator: validateMobile, trigger: 'blur' }
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
                this.dataForm.descImgUrl = data.teacher.descImgUrl
                this.dataForm.bdOrgId = data.teacher.bdOrgId
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
                'descImgUrl': this.dataForm.descImgUrl,
                'bdOrgId': this.dataForm.bdOrgId || this.$store.state.user.bdOrgId,
                'createUserId': this.dataForm.createUserId,
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

<style>

</style>
