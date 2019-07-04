<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.name" placeholder="名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="20">
      <el-col :span="8" v-for="item in dataList" :key=item.id style="margin-bottom:40px" >
        <el-card :body-style="{ padding: '0px'}">
          <el-row>
            <el-col :span="14"><img src="https://github.githubassets.com/images/modules/site/home-illo-team.svg" class="image" style="background: #a2e1da"></el-col>
            <el-col :span="10" style="background: #0BB2D4">
              <h2>{{item.name}}</h2>
              <el-row>
                <el-col :span="24" style="margin-bottom:10px"><label>手机：{{item.mobile}}</label></el-col>
              </el-row>
              <el-row>
                <el-col :span="24" style="margin-bottom:10px"><label>邮箱：{{item.email}}</label></el-col>
              </el-row>
              <el-row>
                <el-col :span="24" style="margin-bottom:10px"><label>介绍：{{item.remark}}</label></el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        dataForm: {
          name: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false
      }
    },
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/teacher/list'),
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
      }
    }
  }
</script>

<style>

</style>
