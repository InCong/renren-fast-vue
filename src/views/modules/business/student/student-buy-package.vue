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
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        currentRow: null
      }
    },
    methods: {
      init (id) {
        this.visible = true
        this.studentId = id
        this.getDataList()
        // 组件看不见时调用
        this.over = () => {

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
          let bdPackageId = this.currentRow.id
          this.$http({
            url: this.$http.adornUrl('/business/studentpackage/save'),
            method: 'post',
            data: this.$http.adornData({
              'bdStudentId': this.studentId,
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
        }
      },
      // 单选变更
      handleCurrentChange (val) {
        this.currentRow = val
      },
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
