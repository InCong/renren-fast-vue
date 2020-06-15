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
        <el-button v-if="isAuth('business:principal:save')" type="primary" @click="addOrUpdateHandle()">
          新增
        </el-button>
        <el-button v-if="isAuth('business:principal:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="deleteHandle()">
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
        prop="id"
        header-align="center"
        align="center"
        label="ID"
        width="50"
      />
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        label="名称"
      />
      <el-table-column
        prop="mobile"
        header-align="center"
        align="center"
        label="联系电话"
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
    <principalBindingWechat v-if="principalBindingWechatVisible" ref="principalBindingWechat" @refreshDataList="getDataList" />
  </div>
</template>

<script>
  import AddOrUpdate from './principal-add-or-update'
  import PrincipalBindingWechat from '../binding-wechat'
  export default {
    components: {
      AddOrUpdate,
      PrincipalBindingWechat
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
        principalBindingWechatVisible: false
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
          url: this.$http.adornUrl('/business/principal/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'name': this.dataForm.name,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以获取全部机构部门的列表
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
            url: this.$http.adornUrl('/business/principal/delete'),
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
      bindingWechat: function (principalId) {
        console.log('对负责人：' + principalId + ' 进行微信绑定')
        this.$http({
          url: this.$http.adornUrl(`/business/principal/getQrCodeUrl/${principalId}`),
          method: 'post',
          data: this.$http.adornData()
        }).then(({data}) => {
          if (data && data.code === 0) {
            if (data.url) {
              this.principalBindingWechatVisible = true
              this.$nextTick(() => {
                this.$refs.principalBindingWechat.init(data.url)
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
