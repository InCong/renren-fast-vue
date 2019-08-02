<template>
  <el-dialog
    title="请选择需要推送教师简介的学员"
    :close-on-click-modal="false"
    :visible.sync="visible"
    width="20%"
    @close="closeDialog">
    <div style="margin-bottom: 20px">
      <el-input v-model="studentName" placeholder="名称" clearable style="width: 40%;margin-right: 10px"></el-input>
      <el-button type="primary" @click="getDataList">查询</el-button>
    </div>
    <div>
      <el-table
        :data="dataList"
        border
        highlight-current-row
        @current-change="handleCurrentChange"
        v-loading="dataListLoading"
        style="width: 100%;">
        <el-table-column
          prop="nickname"
          header-align="center"
          align="center"
          label="名称">
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
        :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="totalPage"
        layout="total, prev, pager, next">
      </el-pagination>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="sendWechatMsg()">推送</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        studentName: '',
        dataList: [],
        pageIndex: 1,
        pageSize: 20,
        totalPage: 0,
        dataListLoading: false,
        bdStudentId: 0,
        // 以下是传参进来的变量
        teacherName: '',
        teacherMobile: '',
        teacherUrl: '',
        teacherClassTypeName: ''
      }
    },
    methods: {
      init (name, url, mobile, classTypeName) {
        this.visible = true
        this.teacherName = name
        this.teacherUrl = url
        this.teacherMobile = mobile
        this.teacherClassTypeName = classTypeName
        this.getDataList(this.teacherName, this.teacherUrl, this.teacherMobile, this.teacherClassTypeName)
        this.initWebSocket()
      },
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/student/list'),
          method: 'post',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'nickname': this.studentName,
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
      },
      // 推送教师简介给指定的学员
      sendWechatMsg () {
        if (this.bdStudentId === 0) {
          this.$message({
            message: '请选择学员',
            type: 'warning',
            duration: 1500
          })
        } else {
          this.$http({
            url: this.$http.adornUrl('/business/teacher/pushTeacherInfo'),
            method: 'post',
            data: this.$http.adornData({
              'bdStudentId': this.bdStudentId,
              'teacherName': this.teacherName,
              'teacherMobile': this.teacherMobile,
              'teacherUrl': this.teacherUrl,
              'teacherClassTypeName': this.teacherClassTypeName
            })
          })
        }
      },
      // 单选学员
      handleCurrentChange (val) {
        this.currentRow = val
        if (this.currentRow != null) {
          this.bdStudentId = val.id
        } else {
          this.bdStudentId = 0
        }
      },
      // 对话框关闭时关闭websocket
      closeDialog () {
        this.over()
      },
      initWebSocket: function () {
        // WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
        let websocket = new WebSocket('ws://127.0.0.1:80/renren-fast/websocket/sendArticle')
        websocket.onopen = this.webSocketOnOpen
        websocket.onerror = this.webSocketOnError
        websocket.onmessage = this.webSocketOnMessage
        websocket.onclose = this.webSocketClose
        // 组件看不见时调用，中断websocket链接
        this.over = () => {
          websocket.close()
        }
      },
      webSocketOnOpen: function () {
        console.log('WebSocket连接成功')
      },
      webSocketOnError: function (e) {
        console.log('WebSocket连接发生错误')
      },
      webSocketOnMessage: function (e) {
        if (e.data === 'sendArticle_success') {
          console.log(e.data)
          this.$message({
            message: '推送成功！',
            type: 'success',
            duration: 3000
          })
          this.visible = false
        } else if (e.data === 'sendArticle_unbinding') {
          console.log(e.data)
          this.$message({
            message: '该学员未绑定微信，无法推送！！！',
            type: 'error',
            duration: 4500
          })
        } else if (e.data === 'sendArticle_all_fail') {
          this.visible = false
          console.log(e.data)
          this.$message({
            message: '该学员绑定的微信用户长时间未与公众号交互，因此无法推送消息给这些微信用户！！！',
            type: 'warning',
            duration: 4500
          })
        } else if (e.data === 'sendArticle_someone_fail') {
          this.visible = false
          console.log(e.data)
          this.$message({
            message: '该学员绑定的个别微信用户长时间未与公众号交互，因此无法推送消息给这些微信用户！！！',
            type: 'warning',
            duration: 4500
          })
        } else {
          this.$message({
            message: '推送失败！未知情况，请联系管理员！！！',
            type: 'error',
            duration: 4500
          })
        }
      },
      webSocketClose: function (e) {
        console.log('WebSocket连接关闭')
      }
    }
  }
</script>

<style>
  .el-table__body tr.current-row>td{
    background-color: #f57878 !important;
    color: wheat;
  }
</style>
