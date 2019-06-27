<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="昵称" prop="nickname">
      <el-input v-model="dataForm.nickname" placeholder="昵称"></el-input>
    </el-form-item>
    <el-form-item label="性别" prop="sex">
      <el-radio-group v-model="dataForm.sex" placeholder="性别，1-男，0-女">
        <el-radio :label="1">男</el-radio>
        <el-radio :label="0">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="手机号码" prop="mobile">
      <el-input v-model="dataForm.mobile" placeholder="手机号码"></el-input>
    </el-form-item>
    <el-form-item label="邮箱地址" prop="email">
      <el-input v-model="dataForm.email" placeholder="邮箱地址"></el-input>
    </el-form-item>
    <el-form-item label="成员状态" prop="status">
<!--      <el-input v-model="dataForm.status" placeholder="成员状态，0-未知，1-在职，2-离职，9-其它"></el-input>-->
      <el-select v-model="dataForm.status" placeholder="请选择">
        <el-option
          v-for="item in status"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="创建时间" :disabled="true"></el-input>
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
          nickname: '',
          sex: 0,
          mobile: '',
          email: '',
          status: 1,
          createTime: ''
        },
        status: [{
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
          nickname: [
            { required: true, message: '昵称不能为空', trigger: 'blur' }
          ],
          sex: [
            { required: true, message: '性别，1-男，0-女不能为空', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '手机号码不能为空', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '邮箱地址不能为空', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '成员状态，0-未知，1-在职，2-离职，9-其它不能为空', trigger: 'blur' }
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
              url: this.$http.adornUrl(`/wechat/member/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.nickname = data.member.nickname
                this.dataForm.sex = data.member.sex
                this.dataForm.mobile = data.member.mobile
                this.dataForm.email = data.member.email
                this.dataForm.status = data.member.status
                this.dataForm.createTime = data.member.createTime
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
              url: this.$http.adornUrl(`/wechat/member/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'nickname': this.dataForm.nickname,
                'sex': this.dataForm.sex,
                'mobile': this.dataForm.mobile,
                'email': this.dataForm.email,
                'status': this.dataForm.status,
                'createTime': this.dataForm.createTime
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
