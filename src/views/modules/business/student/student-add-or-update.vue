<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog">
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="信息填写" name="editInfo">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="100px">
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
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系电话1" prop="mobile2">
                <el-input v-model="dataForm.mobile2" placeholder="紧急联系人电话"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话2" prop="mobile3">
                <el-input v-model="dataForm.mobile3" placeholder="紧急联系人电话"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="邮箱地址" prop="email">
            <el-input v-model="dataForm.email" placeholder="邮箱地址"></el-input>
          </el-form-item>
          <el-form-item label="入学时间" prop="entryTime">
            <el-date-picker
              v-model="dataForm.entryTime"
              type="date"
              placeholder="入学时间">
            </el-date-picker>
          </el-form-item>
          <el-row>
            <el-col :span="8">
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
            </el-col>
            <el-col :span="8">
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
            </el-col>
            <el-col :span="8">
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
            </el-col>
          </el-row>
          <el-form-item label="创建时间" prop="createTime">
            <el-input v-model="dataForm.createTime" placeholder="创建时间，自动生成，无需填写" :disabled="true"></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="课程购买" name="buyClass" v-if="!dataForm.id">
        <div style="margin-bottom: 20px;margin-left: 20px">
          <el-switch
            v-model="buyMode"
            active-text="单节购买"
            active-value="1"
            inactive-text="套餐购买"
            inactive-value="2"
            @change="buyModeChange">
          </el-switch>
        </div>
        <div v-if="buyMode === '1'">
          <el-form :model="dataForm1" ref="dataForm1" label-width="80px">
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
            <el-form-item label="课程" prop="bdClassesId">
              <el-select v-model="dataForm1.bdClassesId" clearable placeholder="请选择课程" filterable :disabled="classSelectDisable">
                <el-option
                  v-for="item in classList"
                  :key="item.bdClassesId"
                  :label="item.bdClassesName"
                  :value="item.bdClassesId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="课时" prop="num">
              <el-input v-model="dataForm1.num" placeholder="课时数量" type="number" @input="numChange()"></el-input>
            </el-form-item>
            <el-form-item label="剩余课时" prop="remainNum">
              <el-input v-model="dataForm1.remainNum" placeholder="剩余课时" :disabled="true" type="number"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="dataForm1.remark" placeholder="备注"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div v-if="buyMode === '2'">
          <div style="margin-bottom: 10px">
            <el-row :gutter="10">
              <el-col :span="4">
                <el-input v-model="name" placeholder="名称" clearable></el-input>
              </el-col>
              <el-col :span="20">
                <el-button @click="getDataList()" type="primary">查询</el-button>
              </el-col>
            </el-row>
          </div>
          <div>
            <el-table
              :data="packageList"
              border
              highlight-current-row
              @current-change="handleCurrentChange"
              v-loading="dataListLoading"
              style="width: 100%;">
              <el-table-column
                prop="id"
                header-align="center"
                align="center"
                label="id"
                width="50">
              </el-table-column>
              <el-table-column
                prop="name"
                header-align="center"
                align="center"
                label="名称">
              </el-table-column>
              <el-table-column
                prop="originalAmount"
                header-align="center"
                align="center"
                label="原金额">
              </el-table-column>
              <el-table-column
                prop="amount"
                header-align="center"
                align="center"
                label="实际金额">
              </el-table-column>
              <el-table-column
                prop="num"
                header-align="center"
                align="center"
                label="总课时">
              </el-table-column>
              <el-table-column
                prop="createTime"
                header-align="center"
                align="center"
                show-overflow-tooltip
                label="创建时间">
              </el-table-column>
              <el-table-column
                prop="remark"
                header-align="center"
                align="center"
                show-overflow-tooltip
                label="备注">
              </el-table-column>
            </el-table>
            <el-pagination
              @size-change="sizeChangeHandle"
              @current-change="currentChangeHandle"
              :current-page="pageIndex"
              :hide-on-single-page="true"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pageSize"
              :total="totalPage"
              layout="total, sizes, prev, pager, next, jumper"
              style="margin-top: 10px;text-align: right">
            </el-pagination>
          </div>
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
        if (value && !isMobile(value)) {
          callback(new Error('手机号格式错误'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        isNew: true,
        dataForm: {
          // 学员信息
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
          entryTime: '',
          bdAreaId: '',
          bdStudentLevelId: '',
          bdOrgId: 0,
          status: '',
          createTime: ''
        },
        dataForm1: {
          // 购买课时
          bdClassesId: '',
          bdTeacherId: '',
          num: 0,
          remainNum: 0,
          remark: ''
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
          mobile: [
            { required: true, message: '手机号码不能为空', trigger: 'blur' },
            { validator: validateMobile, trigger: 'blur' }
          ],
          mobile3: [
            { validator: validateMobile, trigger: 'blur' }
          ]
        },
        // 课程购买的相关参数
        activeName: 'editInfo',
        // 教师
        teacherList: [],
        // 课程
        classList: [],
        classSelectDisable: true,
        // 购买模式
        buyMode: '1',
        // 套餐相关
        name: '',
        packageList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        currentRow: null
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id
        this.visible = true
        this.isNew = !this.dataForm.id
        this.getAreaList()
        this.getStudentLevelList()
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
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
                this.dataForm.entryTime = data.student.entryTime
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
          } else {
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
          }
        })
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.activeName = 'editInfo'
          this.teacherList = []
          this.classList = []
          this.classSelectDisable = true
          this.buyMode = '1'
          this.currentRow = null
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
              url: this.$http.adornUrl(`/business/student/${!this.dataForm.id ? 'saveAndGetId' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'nickname': this.dataForm.nickname,
                'sex': this.dataForm.sex,
                'year': this.dataForm.birthday ? moment(this.dataForm.birthday).year() : '',
                'month': this.dataForm.birthday ? moment(this.dataForm.birthday).month() + 1 : '',
                'day': this.dataForm.birthday ? moment(this.dataForm.birthday).date() : '',
                'mobile': this.dataForm.mobile,
                'mobile2': this.dataForm.mobile2,
                'mobile3': this.dataForm.mobile3,
                'email': this.dataForm.email,
                'entryTime': this.dataForm.entryTime ? moment(this.dataForm.entryTime).format('YYYY-MM-DD') : '1900-01-01',
                'bdAreaId': this.dataForm.bdAreaId,
                'bdStudentLevelId': this.dataForm.bdStudentLevelId,
                'bdOrgId': this.dataForm.bdOrgId || this.$store.state.user.bdOrgId,
                'status': this.dataForm.status
              })
            }).then(({data}) => {
              if (data.id > 0) {
                this.dataForm.id = data.id
              }
              // 新增时才对购买课时进行保存
              if (this.dataForm.id && this.isNew) {
                // 选择单节购买
                if (this.buyMode === '1') {
                  this.$http({
                    url: this.$http.adornUrl('/business/classesstudent/save'),
                    method: 'post',
                    data: this.$http.adornData({
                      'bdStudentId': this.dataForm.id,
                      'bdClassesId': this.dataForm1.bdClassesId,
                      'bdTeacherId': this.dataForm1.bdTeacherId,
                      'num': this.dataForm1.num,
                      'remainNum': this.dataForm1.remainNum,
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
                } else if (this.buyMode === '2') {
                  let bdPackageId = this.currentRow.id
                  this.$http({
                    url: this.$http.adornUrl('/business/studentpackage/save'),
                    method: 'post',
                    data: this.$http.adornData({
                      'bdStudentId': this.dataForm.id,
                      'bdPackageId': bdPackageId
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
                } else {
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
                }
              } else {
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
              }
            })
          }
        })
      },
      // 课时变更时，同步变更剩余课时
      numChange () {
        this.dataForm1.remainNum = this.dataForm1.num
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
      },
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/package/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'name': this.name,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.packageList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.packageList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getDataList()
      },
      // 单选变更
      handleCurrentChange (val) {
        this.currentRow = val
      },
      // 购买模式变更
      buyModeChange (val) {
        // 如果是购买套餐，则刷新套餐界面
        if (val === '2') {
          this.getDataList()
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
  .el-table__body tr.current-row>td{
    background-color: mediumseagreen !important;
    color: wheat;
  }
</style>
