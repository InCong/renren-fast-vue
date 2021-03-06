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
        <el-button v-if="isAuth('business:classes:save')" type="primary" @click="addOrUpdateHandle()">
          新增
        </el-button>
        <el-button v-if="isAuth('business:classes:save')" type="primary" @click="multiAdd()">
          批量新增
        </el-button>
        <el-button v-if="isAuth('business:classes:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="deleteHandle()">
          批量删除
        </el-button>
        <el-button v-if="isAuth('business:classes:save')" type="primary" @click="packageManage()">
          套餐管理
        </el-button>
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
        label="课程别名"
      />
      <el-table-column
        prop="bdClassTypeId"
        header-align="center"
        align="center"
        width="150"
        :formatter="formatClassType"
        label="课程种类"
      />
      <el-table-column
        prop="bdClassWayId"
        header-align="center"
        align="center"
        width="150"
        label="上课方式"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.bdClassWayId === 1">
            一对一
          </el-tag>
          <el-tag v-if="scope.row.bdClassWayId === 2">
            一对多
          </el-tag>
          <el-tag v-if="scope.row.bdClassWayId === 3">
            多对一
          </el-tag>
          <el-tag v-if="scope.row.bdClassWayId === 4">
            多对多
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="price"
        header-align="center"
        align="center"
        width="150"
        label="价格"
      />
      <el-table-column
        prop="length"
        header-align="center"
        align="center"
        width="150"
        label="时长（分钟）"
      />
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        width="150"
        label="状态"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" type="danger">
            未知
          </el-tag>
          <el-tag v-if="scope.row.status === 1">
            正常
          </el-tag>
          <el-tag v-if="scope.row.status === 2" type="warning">
            暂停
          </el-tag>
          <el-tag v-if="scope.row.status === 3" type="danger">
            撤销
          </el-tag>
          <el-tag v-if="scope.row.status === 9" type="warning">
            其它
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
        fixed="right"
        header-align="center"
        align="center"
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
            <el-col :span="12">
              <el-button size="mini" type="primary" @click="classesTeacher(scope.row.id)">
                教师
              </el-button>
            </el-col>
            <!--            <el-col :span="12"><el-button size="mini" type="primary" @click="classesStudent(scope.row.id)">学员</el-button></el-col>-->
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
    <!-- 弹窗, 批量新增 -->
    <multi-add v-if="multiAddVisible" ref="multiAdd" @refreshDataList="getDataList" />
    <!-- 弹窗, 与教师绑定 -->
    <classes-teacher v-if="classesTeacherVisible" ref="classesTeacher" />
    <!-- 弹窗, 与教师绑定 -->
    <classes-student v-if="classesStudentVisible" ref="classesStudent" />
    <!-- 弹窗，显示套餐管理界面 -->
    <package v-if="packageVisible" ref="package" />
  </div>
</template>

<script>
  import AddOrUpdate from './classes-add-or-update'
  import MultiAdd from './classes-multi-add'
  import ClassesTeacher from './classesTeacher'
  import ClassesStudent from './classesStudent'
  import Package from './package'
  export default {
    components: {
      ClassesTeacher,
      ClassesStudent,
      AddOrUpdate,
      Package,
      MultiAdd
    },
    data () {
      return {
        dataForm: {
          name: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        multiAddVisible: false,
        classTypeList: [],
        classesTeacherVisible: false,
        classesStudentVisible: false,
        packageVisible: false
      }
    },
    activated () {
      this.getDataList()
      this.getClassTypeList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/classes/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'name': this.dataForm.name,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dataList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.dataList = []
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
            url: this.$http.adornUrl('/business/classes/delete'),
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
      // 获取课程种类ID
      getClassTypeList () {
        this.$http({
          url: this.$http.adornUrl('/basic/classtype/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.classTypeList = data.page.list
          } else {
            this.classTypeList = []
          }
        })
      },
      formatClassType: function (row, column) {
        let classTypeName = '未知'
        if (this.classTypeList != null) {
          for (let i = 0; i < this.classTypeList.length; i++) {
            let item = this.classTypeList[i]
            if (item.id === row.bdClassTypeId) {
              classTypeName = item.name
              break
            }
          }
        }
        return classTypeName
      },
      classesTeacher: function (id) {
        this.classesTeacherVisible = true
        this.$nextTick(() => {
          this.$refs.classesTeacher.init(id)
        })
      },
      classesStudent: function (id) {
        this.classesStudentVisible = true
        this.$nextTick(() => {
          this.$refs.classesStudent.init(id)
        })
      },
      packageManage () {
        this.packageVisible = true
        this.$nextTick(() => {
          this.$refs.package.init()
        })
      },
      multiAdd () {
        this.multiAddVisible = true
        this.$nextTick(() => {
          this.$refs.multiAdd.init()
        })
      }
    }
  }
</script>
