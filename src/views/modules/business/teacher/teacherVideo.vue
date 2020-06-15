<template>
  <el-dialog
    :close-on-click-modal="false"
    width="60%"
    :visible.sync="visible"
  >
    <el-table
      v-loading="dataListLoading"
      :data="dataList"
      border
      style="width: 100%;"
    >
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        width="80"
        label="ID"
      />
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        width="400"
        label="视频名称"
      />
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="上传时间"
      />
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="playVideo(scope.row.url)">
            播放
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
    <el-dialog :visible.sync="videoVisible" :append-to-body="true">
      <video :src="url" autoplay="true" controls="controls" width="100%" class="video-js vjs-default-skin">你的浏览器不支持播放该格式的视频！！</video>
    </el-dialog>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        bdTeacherId: 0,
        visible: false,
        videoVisible: false,
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        url: ''
      }
    },
    methods: {
      init (id) {
        this.visible = true
        this.bdTeacherId = id
        this.getDataList(this.bdTeacherId)
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList(this.bdTeacherId)
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getDataList(this.bdTeacherId)
      },
      getDataList (teacherId) {
        this.$http({
          url: this.$http.adornUrl('/business/teachermultimedia/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'bdTeacherId': teacherId,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId, // 超级管理员可以获取全部机构部门的列表
            'typeId': 2 // 1-图片，2-视频
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
      // 播放指定视频
      playVideo (url) {
        this.url = url
        this.videoVisible = true
        console.log(this.url)
      }
    }
  }
</script>

<style scoped>

</style>
