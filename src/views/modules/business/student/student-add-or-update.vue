<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px">
    <el-form-item label="昵称" prop="nickname">
      <el-input v-model="dataForm.nickname" placeholder="昵称"></el-input>
    </el-form-item>
    <el-form-item label="性别" prop="sex">
      <el-radio-group v-model="dataForm.sex" placeholder="性别，1-男，0-女">
        <el-radio :label="1">男</el-radio>
        <el-radio :label="0">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="出生日期" prop="birthday">
      <el-date-picker
        v-model="dataForm.birthday"
        type="date"
        placeholder="选择日期">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="手机号码" prop="mobile">
      <el-input v-model="dataForm.mobile" placeholder="手机号码"></el-input>
    </el-form-item>
    <el-form-item label="联系电话1" prop="mobile2">
      <el-input v-model="dataForm.mobile2" placeholder="紧急联系人电话"></el-input>
    </el-form-item>
    <el-form-item label="联系电话2" prop="mobile3">
      <el-input v-model="dataForm.mobile3" placeholder="紧急联系人电话"></el-input>
    </el-form-item>
    <el-form-item label="邮箱地址" prop="email">
      <el-input v-model="dataForm.email" placeholder="邮箱地址"></el-input>
    </el-form-item>
    <el-form-item label="所属地区" prop="bdAreaId">
      <el-select v-model="dataForm.bdAreaId" clearable placeholder="请选择">
        <el-option
          v-for="item in areaList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="学员水平" prop="bdStudentLevelId">
      <el-select v-model="dataForm.bdStudentLevelId" clearable placeholder="请选择">
        <el-option
          v-for="item in studentLevelList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="成员状态" prop="status">
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
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { isMobile } from '@/utils/validate'
  import moment from 'moment'
  export default {
    data () {
      var validateMobile = (rule, value, callback) => {
        if (value && !isMobile(value)) {
          callback(new Error('手机号格式错误'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        dataForm: {
          id: 0,
          nickname: '',
          sex: 0,
          age: '',
          year: '',
          month: '',
          day: '',
          birthday: '',
          mobile: '',
          mobile2: '',
          mobile3: '',
          email: '',
          bdAreaId: '',
          bdStudentLevelId: '',
          bdOrgId: 0,
          status: '',
          createTime: ''
        },
        areaList: [],
        studentLevelList: [],
        statusList: [{
          value: 0,
          label: '未知'
        }, {
          value: 1,
          label: '已缴费'
        }, {
          value: 2,
          label: '未续费'
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
          birthday: [
            { required: true, message: '出生年月日不能为空', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '手机号码不能为空', trigger: 'blur' },
            { validator: validateMobile, trigger: 'blur' }
          ],
          mobile3: [
            { validator: validateMobile, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id
        this.visible = true
        this.getAreaList()
        this.getStudentLevelList()
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/business/student/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.dataForm.nickname = data.student.nickname
              this.dataForm.sex = data.student.sex
              this.dataForm.year = data.student.year
              this.dataForm.month = data.student.month
              this.dataForm.day = data.student.day
              this.dataForm.mobile = data.student.mobile
              this.dataForm.mobile2 = data.student.mobile2
              this.dataForm.mobile3 = data.student.mobile3
              this.dataForm.email = data.student.email
              this.dataForm.bdAreaId = data.student.bdAreaId
              this.dataForm.bdStudentLevelId = data.student.bdStudentLevelId
              this.dataForm.bdOrgId = data.student.bdOrgId
              this.dataForm.status = data.student.status
              this.dataForm.createTime = data.student.createTime
              // 拼装出生年月日
              if (this.dataForm.year) {
                this.dataForm.birthday = moment(this.dataForm.year + '-' + this.dataForm.month + '-' + this.dataForm.day)
              } else {
                this.dataForm.birthday = ''
              }
            }
          })
        }
      },
      // 获取地区ID
      getAreaList () {
        this.$http({
          url: this.$http.adornUrl('/basic/area/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 0,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.areaList = data.page.list
        })
      },
      // 获取学员水平ID
      getStudentLevelList () {
        this.$http({
          url: this.$http.adornUrl('/basic/studentLevel/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 0,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.studentLevelList = data.page.list
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/business/student/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'nickname': this.dataForm.nickname,
                'sex': this.dataForm.sex,
                'year': moment(this.dataForm.birthday).year(),
                'month': moment(this.dataForm.birthday).month() + 1,
                'day': moment(this.dataForm.birthday).date(),
                'mobile': this.dataForm.mobile,
                'mobile2': this.dataForm.mobile2,
                'mobile3': this.dataForm.mobile3,
                'email': this.dataForm.email,
                'bdAreaId': this.dataForm.bdAreaId,
                'bdStudentLevelId': this.dataForm.bdStudentLevelId,
                'bdOrgId': this.dataForm.bdOrgId || this.$store.state.user.bdOrgId,
                'status': this.dataForm.status
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
