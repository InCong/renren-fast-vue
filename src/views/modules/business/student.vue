<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.nickname" placeholder="名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.bdAreaId" clearable placeholder="所属区域">
          <el-option
            v-for="item in areaList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.bdStudentLevelId" clearable placeholder="学历水平">
          <el-option
            v-for="item in studentLevelList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('business:student:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('business:student:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      stripe
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        width="50"
        label="ID">
      </el-table-column>
      <el-table-column
        prop="nickname"
        header-align="center"
        align="center"
        label="名称">
      </el-table-column>
      <el-table-column
        prop="age"
        header-align="center"
        align="center"
        label="年龄">
      </el-table-column>
      <el-table-column
        prop="sex"
        header-align="center"
        align="center"
        label="性别">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.sex === 0" size="small">女</el-tag>
          <el-tag v-if="scope.row.sex === 1" size="small">男</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="mobile"
        header-align="center"
        align="center"
        label="手机号码">
      </el-table-column>
      <el-table-column
        prop="email"
        header-align="center"
        align="center"
        label="邮箱地址">
      </el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="学员状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="danger">未知</el-tag>
          <el-tag v-if="scope.row.status === 1" size="small">已缴费</el-tag>
          <el-tag v-if="scope.row.status === 2" size="small" type="warning">未续费</el-tag>
          <el-tag v-if="scope.row.status === 9" size="small" type="warning">其它</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="bdAreaId"
        header-align="center"
        align="center"
        :formatter="formatArea"
        label="所在地区">
      </el-table-column>
      <el-table-column
        prop="bdStudentLevelId"
        header-align="center"
        align="center"
        :formatter="formatStudentLevel"
        label="学习水平">
      </el-table-column>
      <el-table-column
        prop="bdOrgId"
        header-align="center"
        align="center"
        :formatter="formatOrg"
        label="所属机构">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
          <el-button type="text" size="small" @click="bindingWechat(scope.row.id)">绑定微信</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    <!-- 弹窗, 绑定微信 -->
    <studentBindingWechat v-if="studentBindingWechatVisible" ref="studentBindingWechat"></studentBindingWechat>
  </div>
</template>

<script>
  import AddOrUpdate from './student-add-or-update'
  import StudentBindingWechat from './student-binding-wechat'
  export default {
    data () {
      return {
        dataForm: {
          nickname: '',
          bdAreaId: '',
          bdStudentLevelId: ''
        },
        dataList: [],
        orgList: [],
        areaList: [],
        studentLevelList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        studentBindingWechatVisible: false
      }
    },
    components: {
      AddOrUpdate,
      StudentBindingWechat
    },
    activated () {
      this.getOrgList()
      this.getDataList()
      this.getAreaList()
      this.getStudentLevelList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/student/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'nickname': this.dataForm.nickname,
            'bdAreaId': this.dataForm.bdAreaId,
            'bdStudentLevelId': this.dataForm.bdStudentLevelId,
            'id': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以获取全部机构部门的列表
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
        var ids = id ? [id] : this.dataListSelections.map(item => {
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
              this.$message({
                message: '成功获取微信二维码Url！',
                type: 'sucess',
                duration: 1500
              })
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
      }
    }
  }
</script>
