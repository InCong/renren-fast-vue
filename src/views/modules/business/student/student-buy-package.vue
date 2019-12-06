<template>
  <el-dialog
    title="购买课时"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog">
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
    <div v-if="isShowTeacherSelector" style="margin-top: 30px">
      <div style="margin-bottom: 30px">
        <el-divider content-position="left"><span style="color: #00a0e9">选择任课教师</span></el-divider>
      </div>
      <el-table
        :data="classesList"
        :header-cell-style="headerCellClass"
        border
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
          label="课程名">
        </el-table-column>
        <el-table-column
          prop="bdTeacherId"
          header-align="center"
          align="center"
          label="任课教师"
          width="200px">
          <template slot-scope="scope">
            <el-select v-model="scope.row.bdTeacherId" filterable placeholder="请选择任课教师" @change="changeRowTeacher($event, scope.$index)">
              <el-option
                v-for="item in teacherList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          prop="originalPrice"
          header-align="center"
          align="center"
          label="原价">
        </el-table-column>
        <el-table-column
          prop="currentPrice"
          header-align="center"
          align="center"
          label="现价">
        </el-table-column>
        <el-table-column
          prop="num"
          header-align="center"
          align="center"
          label="课时">
        </el-table-column>
        <el-table-column
          prop="otherType"
          header-align="center"
          align="center"
          label="类型">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.otherType === 1" size="small">普通</el-tag>
            <el-tag v-if="scope.row.otherType === 2" size="small">赠送</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          header-align="center"
          align="center"
          show-overflow-tooltip
          label="备注">
        </el-table-column>
      </el-table>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        studentId: 0,
        name: '',
        packageList: [],
        classesList: [],
        teacherList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        currentRow: null,
        isShowTeacherSelector: false
      }
    },
    methods: {
      init (id) {
        this.visible = true
        this.studentId = id
        this.getDataList()
        this.getTeacherList()
        // 组件看不见时调用
        this.over = () => {
          this.currentRow = null
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
      // 提交所选的套餐
      submit () {
        if (this.currentRow === null) {
          this.$message({
            message: '请选择套餐，再按确定！',
            type: 'warning',
            duration: 1500
          })
        } else {
          // 检查是否都有选择任课教师
          let isSelectTeacher = true
          for (let i = 0; i < this.classesList.length; i++) {
            if (this.classesList[i].bdTeacherId === null || this.classesList[i].bdTeacherId === '') {
              isSelectTeacher = false
              break
            }
          }
          if (isSelectTeacher) {
            let bdPackageId = this.currentRow.id
            this.$http({
              url: this.$http.adornUrl('/business/studentpackage/multiSave'),
              method: 'post',
              data: this.$http.adornData({
                'bdStudentId': this.studentId,
                'bdPackageId': bdPackageId,
                'classesList': this.classesList
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
            this.$message({
              message: '请选择课程对应的任课教师！！！',
              type: 'warning',
              duration: 3000
            })
          }
        }
      },
      // 单选变更
      handleCurrentChange (val) {
        this.currentRow = val
        if (this.currentRow != null) {
          this.isShowTeacherSelector = true
          this.$http({
            url: this.$http.adornUrl('/business/packagedetail/list'),
            method: 'get',
            params: this.$http.adornParams({
              'page': 1,
              'limit': 1000,
              'bdPackageId': this.currentRow.id
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.classesList = data.page.list
            } else {
              this.classesList = []
            }
          })
        } else {
          this.isShowTeacherSelector = false
          this.classesList = []
        }
      },
      closeDialog () {
        this.over()
      },
      getTeacherList () {
        this.$http({
          url: this.$http.adornUrl('/business/teacher/listTeacher'),
          method: 'post',
          data: this.$http.adornData({
            'page': 1,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以获取全部机构部门的列表
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.teacherList = data.page.records
          } else {
            this.teacherList = []
          }
        })
      },
      changeRowTeacher (val, index) {
        if (this.teacherList != null) {
          for (let i = 0; i < this.teacherList.length; i++) {
            let item = this.teacherList[i]
            if (item.id === val) {
              this.classesList[index].teacherName = item.name
              break
            }
          }
        }
      },
      headerCellClass ({row, column, rowIndex, columnIndex}) {
        if (rowIndex === 0 && columnIndex === 2) {
          return 'background: #C7F5ED'
        } else {
          return ''
        }
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
