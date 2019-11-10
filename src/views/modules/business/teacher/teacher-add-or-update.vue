<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    width="52%"
    @close="closeDialog">
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="信息填写" name="editInfo">
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
          <el-form-item label="入职时间" prop="entryTime">
            <el-date-picker
              v-model="dataForm.entryTime"
              type="date"
              placeholder="入职时间">
            </el-date-picker>
          </el-form-item>
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
      </el-tab-pane>
      <el-tab-pane label="课程绑定" name="bindingClass">
        <div style="text-align: center">
          <el-transfer
            v-model="currentValue"
            :titles="['待选课程','已选课程']"
            :data="classesList"
            :filterable="true"
            :props="{key:'id',label:'name'}"
            style="text-align: left;display: inline-block">
          </el-transfer>
        </div>
      </el-tab-pane>
    </el-tabs>
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
          entryTime: '',
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
        },
        // 课程选择的相关参数
        classesList: [],
        preValue: [],
        currentValue: [],
        activeName: 'editInfo'
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
                this.dataForm.entryTime = data.teacher.entryTime
                this.dataForm.descImgUrl = data.teacher.descImgUrl
                this.dataForm.bdOrgId = data.teacher.bdOrgId
                this.dataForm.createTime = data.teacher.createTime
                this.dataForm.remark = data.teacher.remark
              }
            })
          }
          this.$http({
            url: this.$http.adornUrl('/business/classes/list'),
            method: 'get',
            params: this.$http.adornParams({
              'page': 1,
              'limit': 1000,
              'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.classesList = data.page.list
            } else {
              this.classesList = []
            }
          }).then(() => {
            if (this.dataForm.id) {
              this.$http({
                url: this.$http.adornUrl('/business/classesteacher/listClassId'),
                method: 'get',
                params: this.$http.adornParams({
                  'teacherId': this.dataForm.id
                })
              }).then(({data}) => {
                if (data && data.code === 0) {
                  this.preValue = data.list
                  this.currentValue = data.list
                } else {
                  this.preValue = []
                  this.currentValue = []
                }
              })
            }
          })
        })
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.preValue = []
          this.currentValue = []
          this.classesList = []
          this.activeName = 'editInfo'
        }
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/business/teacher/${!this.dataForm.id ? 'saveAndGetId' : 'update'}`),
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
                'entryTime': this.dataForm.entryTime ? moment(this.dataForm.entryTime).format('YYYY-MM-DD') : '1900-01-01',
                'descImgUrl': this.dataForm.descImgUrl,
                'bdOrgId': this.dataForm.bdOrgId || this.$store.state.user.bdOrgId,
                'createUserId': this.dataForm.createUserId,
                'remark': this.dataForm.remark
              })
            }).then(({data}) => {
              if (data.id > 0) {
                this.dataForm.id = data.id
              }
              if (this.dataForm.id) {
                this.$http({
                  url: this.$http.adornUrl('/business/classesteacher/saveByTeacherId'),
                  method: 'post',
                  data: this.$http.adornData({
                    'preValue': this.preValue,
                    'currentValue': this.currentValue,
                    'teacherId': this.dataForm.id
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
                    this.$message({
                      message: '保存出错！',
                      type: 'error',
                      duration: 1500
                    })
                  }
                })
              }
            })
          }
        })
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      }
    }
  }
</script>

<style>
  .el-transfer-panel {
    height: 400px;
    width: 400px;
  }
  .el-transfer-panel__list.is-filterable {
    height: 400px;
  }
  .el-checkbox__label {
    font-size: 16px;
  }
</style>
