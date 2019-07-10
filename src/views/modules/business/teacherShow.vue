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
          <el-row :gutter="10">
            <el-col :span="12"><img :src="item.url ? item.url : 'src/assets/img/avatar.png'" class="image" width="250px" height="250px"></el-col>
            <el-col :span="12">
              <el-row>
                <el-col :span="12">
                  <h1>
                    {{item.name}}
                  </h1>
                </el-col>
                <el-col :span="12">
                  <h1>
                    <el-button type="primary" icon="el-icon-view" size="mini" @click="showTeacherVideo(item.id)"></el-button>
                  </h1>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24" style="margin-bottom:15px"><i class="el-icon-phone"></i><label class="label-content">{{item.mobile}}</label></el-col>
              </el-row>
              <el-row>
                <el-col :span="24" style="margin-bottom:15px"><i class="el-icon-message"></i><label class="label-content">{{item.email}}</label></el-col>
              </el-row>
              <el-row>
                <el-col :span="24" style="margin-bottom:15px"><label>课程：</label><label class="label-content">7门</label></el-col>
              </el-row>
              <el-row>
                <el-col :span="24" style="margin-bottom:0px">
                  <label>科目：</label>
                  <el-tag type="danger">钢琴</el-tag>
                  <el-tag type="danger">跳舞</el-tag>
                </el-col>
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
    <!-- 弹窗，查看该教师的视频 -->
    <teacher-video v-if="teacherVideoVisible" ref="teacherVideo"></teacher-video>
  </div>
</template>

<script>
  import TeacherVideo from './teacherVideo'
  export default {
    components: {TeacherVideo},
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
        teacherVideoVisible: false
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
          url: this.$http.adornUrl('/business/teacher/forShow'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'name': this.dataForm.name,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以获取全部列表
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
      // 显示该教师的视频
      showTeacherVideo (id) {
        this.teacherVideoVisible = true
        this.$nextTick(() => {
          this.$refs.teacherVideo.init(id)
        })
      }
    }
  }
</script>

<style>
  i.el-icon-message {
    font-size: 20px;
    padding-right: 10px;
  }
  i.el-icon-phone {
    font-size: 20px;
    padding-right: 10px;
  }
  label {
    font-size: 16px;
    font-family: "PingFang SC",sans-serif;
  }
  label.label-content {
    color: gray;
    font-size: 14px;
  }
</style>
