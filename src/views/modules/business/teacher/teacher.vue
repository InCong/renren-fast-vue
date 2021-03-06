<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.name" placeholder="名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">
          查询
        </el-button>
        <el-button v-if="isAuth('business:teacher:save')" type="primary" @click="addOrUpdateHandle()">
          新增
        </el-button>
        <el-button v-if="isAuth('business:teacher:save')" type="primary" :disabled="dataListSelections.length <= 0" @click="multiBindingClass()">
          批量绑定课程
        </el-button>
        <el-button v-if="isAuth('business:teacher:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="deleteHandle()">
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
        label="id"
      />
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        label="名称"
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
        prop="age"
        header-align="center"
        align="center"
        width="80"
        label="年龄"
      />
      <el-table-column
        prop="mobile"
        header-align="center"
        align="center"
        label="联系电话"
      />
      <el-table-column
        prop="email"
        header-align="center"
        align="center"
        label="邮箱"
      />
      <el-table-column
        prop="isFullTime"
        header-align="center"
        align="center"
        width="80"
        label="是否全职"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isFullTime === 0" size="small" type="warning">
            否
          </el-tag>
          <el-tag v-if="scope.row.isFullTime === 1" size="small">
            是
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        width="80"
        label="状态"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="danger">
            未知
          </el-tag>
          <el-tag v-if="scope.row.status === 1" size="small">
            在职
          </el-tag>
          <el-tag v-if="scope.row.status === 2" size="small" type="warning">
            离职
          </el-tag>
          <el-tag v-if="scope.row.status === 9" size="small" type="warning">
            其它
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="classCount"
        header-align="center"
        align="center"
        width="80"
        label="拥有课程"
      />
      <el-table-column
        prop="studentCount"
        header-align="center"
        align="center"
        width="80"
        label="拥有学生"
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
        prop="remark"
        header-align="center"
        align="center"
        show-overflow-tooltip
        label="备注"
      />
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
        width="250"
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
            <el-col :span="8">
              <el-button size="mini" type="success" @click="bindingWechat(scope.row.id)">
                微信
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button size="mini" type="primary" @click="uploadMultimedia(scope.row.id)">
                多媒体
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button size="mini" type="primary" @click="classSettlement(scope.row.id)">
                结算
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
    <teacherBindingWechat v-if="teacherBindingWechatVisible" ref="teacherBindingWechat" @refreshDataList="getDataList" />
    <!-- 弹窗，上传图片与视频 -->
    <teacherUploadMultimedia v-if="teacherUploadMultimediaVisible" ref="teacherUploadMultimedia" />
    <!-- 弹窗，课程结算汇总 -->
    <teacher-class-settlement-sum v-if="teacherClassSettlementVisibleSum" ref="teacherClassSettlementSum" />
    <!-- 弹窗，批量绑定课程 -->
    <multi-binding-class v-if="multiBindingClassVisible" ref="multiBindingClass" />
  </div>
</template>

<script>
  import AddOrUpdate from './teacher-add-or-update'
  import TeacherBindingWechat from '../binding-wechat'
  import TeacherUploadMultimedia from './teacher-multimedia-add-or-delete'
  import TeacherClassSettlementSum from './teacher-class-settlement-sum'
  import MultiBindingClass from './multi-binding-class'
  import XLSX from 'xlsx'
  export default {
    components: {
      AddOrUpdate,
      TeacherBindingWechat,
      TeacherUploadMultimedia,
      TeacherClassSettlementSum,
      MultiBindingClass
    },
    data () {
      return {
        dataForm: {
          name: ''
        },
        dataList: [],
        orgList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        teacherBindingWechatVisible: false,
        teacherUploadMultimediaVisible: false,
        teacherClassSettlementVisibleSum: false,
        multiBindingClassVisible: false
      }
    },
    activated () {
      this.getDataList()
      this.getOrgList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/teacher/listTeacher'),
          method: 'post',
          data: this.$http.adornData({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'name': this.dataForm.name,
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
            url: this.$http.adornUrl('/business/teacher/delete'),
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
      bindingWechat: function (teacherId) {
        console.log('对教师：' + teacherId + ' 进行微信绑定')
        this.$http({
          url: this.$http.adornUrl(`/business/teacher/getQrCodeUrl/${teacherId}`),
          method: 'post',
          data: this.$http.adornData()
        }).then(({data}) => {
          if (data && data.code === 0) {
            if (data.url) {
              this.teacherBindingWechatVisible = true
              this.$nextTick(() => {
                this.$refs.teacherBindingWechat.init(data.url)
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
      uploadMultimedia: function (teacherId) {
        console.log('对教师：' + teacherId + ' 进行图片与视频上传')
        this.teacherUploadMultimediaVisible = true
        this.$nextTick(() => {
          this.$refs.teacherUploadMultimedia.init(this.$store.state.user.bdOrgId, teacherId, 1)
        })
      },
      classSettlement: function (teacherId) {
        this.teacherClassSettlementVisibleSum = true
        this.$nextTick(() => {
          this.$refs.teacherClassSettlementSum.init(teacherId)
        })
      },
      multiBindingClass () {
        let ids = this.dataListSelections.map(item => {
          return item.id
        })
        this.multiBindingClassVisible = true
        this.$nextTick(() => {
          this.$refs.multiBindingClass.init(ids)
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
              url: this.$http.adornUrl('/business/teacher/multiSave'),
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
