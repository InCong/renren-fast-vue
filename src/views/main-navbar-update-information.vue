<template>
  <el-dialog
    title="修改个人信息"
    :visible.sync="visible"
    :append-to-body="true">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="账号">
        <span>{{ userName }}</span>
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input type="text" v-model="dataForm.nickName"></el-input>
      </el-form-item>
      <el-form-item label="手机号码" prop="mobile">
        <el-input type="text" v-model="dataForm.mobile"></el-input>
      </el-form-item>
      <el-form-item label="邮箱地址" prop="email">
        <el-input type="text" v-model="dataForm.email"></el-input>
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
    // name: 'main-navbar-update-information'
    data () {
      var validateEmail = (rule, value, callback) => {
        if (!isEmail(value) && value !== '') {
          callback(new Error('邮箱格式错误'))
        } else {
          callback()
        }
      }
      var validateMobile = (rule, value, callback) => {
        if (!isMobile(value) && value !== '') {
          callback(new Error('手机号格式错误'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        dataForm: {
          id: 0,
          userName: '',
          nickName: '',
          mobile: '',
          email: ''
        },
        dataRule: {
          nickName: [
            { required: true, message: '昵称不能为空', trigger: 'blur' }
          ],
          mobile: [
            // { required: false, message: '手机号码不能为空', trigger: 'blur' },
            { validator: validateMobile, trigger: 'blur' }
          ],
          email: [
            // { required: false, message: '邮箱不能为空', trigger: 'blur' },
            { validator: validateEmail, trigger: 'blur' }
          ]
        }
      }
    },
    computed: {
      userName: {
        get () { return this.$store.state.user.name }
      }
    },
    methods: {
      // 初始化
      init () {
        this.dataForm.id = this.$store.state.user.id
        this.dataForm.userName = this.$store.state.user.name

        this.$http({
          url: this.$http.adornUrl(`/sys/user/info/${this.dataForm.id}`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dataForm.email = data.user.email
            this.dataForm.mobile = data.user.mobile
          }
        }).then(() => {
          this.visible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
          })
        })
      },
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/user/update`),
              method: 'post',
              data: this.$http.adornData({
                'username': this.dataForm.userName,
                'userId': this.dataForm.id || undefined,
                'email': this.dataForm.email,
                'mobile': this.dataForm.mobile
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500
                })
                this.visible = false
              } else {
                this.visible = true
                this.$message.error(data.msg)
              }
            })
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
