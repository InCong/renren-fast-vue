<template>
  <el-dialog
    title="修改个人信息"
    :visible.sync="visible"
    :append-to-body="true">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="昵称" prop="nickname">
            <el-input type="text" v-model="dataForm.nickname"></el-input>
          </el-form-item>
        </el-col>
<!--        <el-col :span="12">-->
<!--          <el-form-item label="昵称" prop="nickname">-->
<!--            <el-input type="text" v-model="dataForm.nickname"></el-input>-->
<!--          </el-form-item>-->
<!--        </el-col>-->
      </el-row>
      <el-form-item label="性别" size="mini" prop="sex">
        <el-radio-group v-model="dataForm.sex">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
        </el-radio-group>
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
          sex: 1,
          sysUserId: '',
          nickname: '',
          mobile: '',
          email: ''
        },
        dataRule: {
          nickname: [
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
        get () { return this.$store.state.user.name },
        set (val) { this.$store.commit('user/updateName', val) }
      }
    },
    methods: {
      // 初始化
      init (sysUserId) {
        this.dataForm.sysUserId = sysUserId
        this.$http({
          // url: this.$http.adornUrl(`/sys/user/info/${this.dataForm.id}`),
          url: this.$http.adornUrl(`/business/student/infoByUserId`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          if (data && data.student && data.code === 0) {
            this.dataForm.id = data.student.id
            this.dataForm.sex = data.student.sex
            this.dataForm.email = data.student.email
            this.dataForm.mobile = data.student.mobile
          }
        }).then(() => {
          this.visible = true
        })
      },
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/wechat/member/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'sex': this.dataForm.sex,
                'nickname': this.dataForm.nickname,
                'sysUserId': this.dataForm.sysUserId,
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
                this.userName = this.dataForm.nickname
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
