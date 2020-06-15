<template>
  <div class="mod-user">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.userName" placeholder="用户名" clearable />
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">
          查询
        </el-button>
        <el-button v-if="isAuth('sys:user:save')" type="primary" @click="addOrUpdateHandle()">
          新增
        </el-button>
        <el-button v-if="isAuth('sys:user:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="deleteHandle()">
          批量删除
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
        prop="userId"
        header-align="center"
        align="center"
        width="80"
        label="ID"
      />
      <el-table-column
        prop="username"
        header-align="center"
        align="center"
        label="用户名"
      />
      <el-table-column
        prop="email"
        header-align="center"
        align="center"
        label="邮箱"
      />
      <el-table-column
        prop="mobile"
        header-align="center"
        align="center"
        label="手机号"
      />
      <!--      <el-table-column-->
      <!--        prop="identity"-->
      <!--        header-align="center"-->
      <!--        align="center"-->
      <!--        label="身份">-->
      <!--        <template slot-scope="scope">-->
      <!--          <el-tag v-if="scope.row.identity === 0" size="small" type="danger">未知</el-tag>-->
      <!--          <el-tag v-if="scope.row.identity === 1" size="small">管理员</el-tag>-->
      <!--          <el-tag v-if="scope.row.identity === 2" size="small">教师</el-tag>-->
      <!--          <el-tag v-if="scope.row.identity === 3" size="small">学生</el-tag>-->
      <!--          <el-tag v-if="scope.row.identity === 9" size="small" type="warning">其他</el-tag>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="danger">
            禁用
          </el-tag>
          <el-tag v-else size="small">
            正常
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        width="180"
        label="创建时间"
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
        align="center"
        width="150"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button v-if="isAuth('sys:user:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.userId)">
            修改
          </el-button>
          <el-button v-if="isAuth('sys:user:delete')" type="text" size="small" @click="deleteHandle(scope.row.userId)">
            删除
          </el-button>
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
  </div>
</template>

<script>
  import AddOrUpdate from './user-add-or-update'
  export default {
    components: {
      AddOrUpdate
    },
    data () {
      return {
        dataForm: {
          userName: ''
        },
        dataList: [],
        orgList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false
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
          url: this.$http.adornUrl('/sys/user/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'username': this.dataForm.userName
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
          url: this.$http.adornUrl('/business/org/list'),
          method: 'get',
          params: this.$http.adornParams({
            'name': this.$store.state.user.id === 1 ? null : this.dataForm.name, // 超级管理员可以获取全部机构部门的列表
            'id': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以获取全部机构部门的列表
          })
        }).then(({data}) => {
          this.orgList = data
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
          this.$refs.addOrUpdate.init(id, this.orgList)
        })
      },
      // 删除
      deleteHandle (id) {
        const userIds = id ? [id] : this.dataListSelections.map(item => {
          return item.userId
        })
        this.$confirm(`确定对[id=${userIds.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/sys/user/delete'),
            method: 'post',
            data: this.$http.adornData(userIds, false)
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
        }).catch(() => {})
      },
      formatOrg: function (row, column) {
        let orgName = '未知'
        for (let i = 0; i < this.orgList.length; i++) {
          let item = this.orgList[i]
          if (item.id === row.bdOrgId) {
            orgName = item.name
            break
          }
        }
        return orgName
      }
    }
  }
</script>
