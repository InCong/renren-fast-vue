<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.nickname" placeholder="名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.bdAreaId" clearable placeholder="所属区域">
          <el-option
            v-for="item in areaList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.bdStudentLevelId" clearable placeholder="学历水平">
          <el-option
            v-for="item in studentLevelList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.bdClassesId" clearable placeholder="课程">
          <el-option
            v-for="item in classList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">
          查询
        </el-button>
        <el-button v-if="isAuth('business:student:save')" type="primary" @click="addOrUpdateHandle()">
          新增
        </el-button>
        <el-button v-if="isAuth('business:student:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="deleteHandle()">
          批量删除
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-upload
          ref="upload"
          accept=".xls,.xlsx"
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-change="upload"
          :multiple="false"
          :show-file-list="false"
          :auto-upload="false"
        >
          <el-button slot="trigger" type="primary">
            模板批量导入
          </el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="dataListLoading"
      :data="dataList"
      border
      stripe
      style="width: 100%;"
      @selection-change="selectionChangeHandle"
    >
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50"
      />
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        width="50"
        label="ID"
      />
      <el-table-column
        prop="nickname"
        header-align="center"
        align="center"
        label="名称"
      />
      <el-table-column
        prop="age"
        header-align="center"
        align="center"
        width="80"
        label="年龄"
      />
      <el-table-column
        prop="sex"
        header-align="center"
        align="center"
        width="80"
        label="性别"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.sex === 0" size="small">
            女
          </el-tag>
          <el-tag v-if="scope.row.sex === 1" size="small">
            男
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="mobile"
        header-align="center"
        align="center"
        label="手机号码"
      />
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="学员状态"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="danger">
            未知
          </el-tag>
          <el-tag v-if="scope.row.status === 1" size="small">
            已缴费
          </el-tag>
          <el-tag v-if="scope.row.status === 2" size="small" type="warning">
            未续费
          </el-tag>
          <el-tag v-if="scope.row.status === 9" size="small" type="warning">
            其它
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="className"
        header-align="center"
        align="center"
        show-overflow-tooltip
        label="拥有课程"
      />
      <el-table-column
        prop="bdAreaId"
        header-align="center"
        align="center"
        :formatter="formatArea"
        label="所在地区"
      />
      <el-table-column
        prop="bdStudentLevelId"
        header-align="center"
        align="center"
        :formatter="formatStudentLevel"
        label="学习水平"
      />
      <el-table-column
        prop="isBindWechat"
        header-align="center"
        align="center"
        label="是否绑定微信"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isBindWechat === 0" size="small" type="danger">
            否
          </el-tag>
          <el-tag v-if="scope.row.isBindWechat === 1" size="small">
            是
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="bdOrgId"
        header-align="center"
        align="center"
        :formatter="formatOrg"
        label="所属机构"
      />
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作"
      >
        <template slot-scope="scope">
          <el-row style="margin-bottom:10px">
            <el-col :span="12">
              <el-button size="mini" @click="addOrUpdateHandle(scope.row.id)">
                修改
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button size="mini" type="danger" @click="deleteHandle(scope.row.id)">
                删除
              </el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-button size="mini" type="success" @click="bindingWechat(scope.row.id)">
                微信
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button size="mini" type="primary" @click="StudentClassesQuery(scope.row.id)">
                买课
              </el-button>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
    />
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList" />
    <!-- 弹窗, 绑定微信 -->
    <studentBindingWechat v-if="studentBindingWechatVisible" ref="studentBindingWechat" @refreshDataList="getDataList" />
    <!-- 弹窗，查看指定学员的课时情况 -->
    <studentClassesQuery v-if="studentClassesQueryVisible" ref="studentClassesQuery" />
  </div>
</template>

<script>
  import AddOrUpdate from './student-add-or-update'
  import StudentBindingWechat from '../binding-wechat'
  import StudentClassesQuery from './student-classes-query'
  import XLSX from 'xlsx'
  export default {
    components: {
      AddOrUpdate,
      StudentBindingWechat,
      StudentClassesQuery
    },
    data () {
      return {
        dataForm: {
          nickname: '',
          bdAreaId: '',
          bdStudentLevelId: '',
          bdClassesId: ''
        },
        dataList: [],
        orgList: [],
        areaList: [],
        studentLevelList: [],
        classList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        studentBindingWechatVisible: false,
        studentClassesQueryVisible: false
      }
    },
    activated () {
      this.getOrgList()
      this.getDataList()
      this.getAreaList()
      this.getStudentLevelList()
      this.getClassList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/student/listStudent'),
          method: 'post',
          data: this.$http.adornData({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'nickname': this.dataForm.nickname,
            'bdAreaId': this.dataForm.bdAreaId !== '' ? this.dataForm.bdAreaId : 0,
            'bdStudentLevelId': this.dataForm.bdStudentLevelId !== '' ? this.dataForm.bdStudentLevelId : 0,
            'bdClassesId': this.dataForm.bdClassesId !== '' ? this.dataForm.bdClassesId : 0,
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以获取全部机构部门的列表
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dataList = data.page.records
            this.totalPage = data.page.total
          } else {
            this.dataList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
      },
      // 获取机构（部门）ID
      getOrgList () {
        this.$http({
          url: this.$http.adornUrl('/business/org/select'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.orgList = data.orgList
        })
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
      // 获取课程ID
      getClassList () {
        this.$http({
          url: this.$http.adornUrl('/business/classes/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 0,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.classList = data.page.list
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
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },
      // 新增 / 修改
      addOrUpdateHandle (id) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id)
        })
      },
      // 删除
      deleteHandle (id) {
        const ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/business/student/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        })
      },
      formatOrg: function (row, column) {
        let orgName = '未知'
        if (this.orgList != null) {
          for (let i = 0; i < this.orgList.length; i++) {
            let item = this.orgList[i]
            if (item.id === row.bdOrgId) {
              orgName = item.name
              break
            }
          }
        }
        return orgName
      },
      formatArea: function (row, column) {
        let areaName = '未知'
        if (this.areaList != null) {
          for (let i = 0; i < this.areaList.length; i++) {
            let item = this.areaList[i]
            if (item.id === row.bdAreaId) {
              areaName = item.name
              break
            }
          }
        }
        return areaName
      },
      formatStudentLevel: function (row, column) {
        let studentLevelName = '未知'
        if (this.studentLevelList != null) {
          for (let i = 0; i < this.studentLevelList.length; i++) {
            let item = this.studentLevelList[i]
            if (item.id === row.bdStudentLevelId) {
              studentLevelName = item.name
              break
            }
          }
        }
        return studentLevelName
      },
      bindingWechat: function (studentId) {
        console.log('对学员：' + studentId + ' 进行微信绑定')
        this.$http({
          url: this.$http.adornUrl(`/business/student/getQrCodeUrl/${studentId}`),
          method: 'post',
          data: this.$http.adornData()
        }).then(({data}) => {
          if (data && data.code === 0) {
            if (data.url) {
              this.studentBindingWechatVisible = true
              this.$nextTick(() => {
                this.$refs.studentBindingWechat.init(data.url)
              })
            } else {
              this.$message({
                message: '获取失败！',
                type: 'error',
                duration: 1500
              })
            }
          }
        })
      },
      StudentClassesQuery: function (studentId) {
        this.studentClassesQueryVisible = true
        this.$nextTick(() => {
          this.$refs.studentClassesQuery.init(studentId)
        })
      },
      upload (file, fileList) {
        let files = {0: file.raw}
        this.readExcel1(files)
      },
      // 表格导入
      readExcel1 (files) {
        // 如果没有文件名
        if (files.length <= 0) {
          return false
        } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
          this.$message({
            message: '上传格式不正确，请上传xls或者xlsx格式！',
            type: 'error',
            duration: 1500
          })
          return false
        }
        const fileReader = new FileReader()
        fileReader.onload = (ev) => {
          try {
            const data = ev.target.result
            const workbook = XLSX.read(data, {
              type: 'binary'
            })
            const workSheetName = workbook.SheetNames[0]// 取第一张表
            const ws = XLSX.utils.sheet_to_json(workbook.Sheets[workSheetName])// 生成json表格内容
            const loading = this.$loading({
              lock: true,
              text: 'Loading',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })
            this.$http({
              url: this.$http.adornUrl('/business/student/multiSave'),
              method: 'post',
              data: this.$http.adornData({
                'workSheetData': ws,
                'bdOrgId': this.$store.state.user.bdOrgId
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                loading.close()
                this.$message({
                  message: '上传成功！',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.getDataList()
                  }
                })
              } else {
                setTimeout(() => {
                  loading.close()
                }, 2000)
                this.$message({
                  message: '上传错误！' + data.msg,
                  type: 'error',
                  duration: 1500
                })
              }
            })
            this.$refs.upload.value = ''
          } catch (e) {
            this.$message({
              message: '上传错误！',
              type: 'error',
              duration: 1500
            })
            return false
          }
        }
        fileReader.readAsBinaryString(files[0])
      }
    }
  }
</script>
