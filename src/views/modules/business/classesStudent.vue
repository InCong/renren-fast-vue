<template>
  <el-dialog
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog">
    <div style="text-align: center">
      <el-transfer
        v-model="currentValue"
        :titles="['待选','已选']"
        :data="studentList"
        :filterable="true"
        :props="{key:'id',label:'nickname'}"
        style="text-align: left;display: inline-block">
      </el-transfer>
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
        classId: 0,
        studentList: [],
        preValue: [],
        currentValue: [],
        pageIndex: 1,
        pageSize: 1000,
        totalPage: 0
      }
    },
    methods: {
      init (id) {
        this.classId = id
        this.visible = true
        this.$http({
          url: this.$http.adornUrl('/business/student/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以获取全部机构部门的列表
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.studentList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.studentList = []
            this.totalPage = 0
          }
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/business/classesstudent/listStudentId'),
            method: 'get',
            params: this.$http.adornParams({
              'classId': this.classId
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.preValue = data.list
              this.currentValue = data.list
            } else {
              this.preValue = []
              this.currentValue = []
            }
          })
        })
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.preValue = []
          this.currentValue = []
          this.studentList = []
        }
      },
      submit () {
        if (this.preValue === this.currentValue) {
          this.$message({
            message: '未发生变化，无需保存！',
            type: 'warning',
            duration: 1500
          })
        } else {
          this.$http({
            url: this.$http.adornUrl('/business/classesstudent/saveStudentId'),
            method: 'post',
            data: this.$http.adornData({
              'preValue': this.preValue,
              'currentValue': this.currentValue,
              'classId': this.classId
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.preValue = this.currentValue
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500
              })
            } else {
              this.$message({
                message: '保存出错！',
                type: 'error',
                duration: 1500
              })
            }
          })
        }
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      }
    }
  }
</script>

<style>
  .el-transfer-panel {
    height: 400px;
    width: 400px;
  }
  .el-transfer-panel__list.is-filterable {
    height: 400px;
  }
  .el-checkbox__label {
    font-size: 16px;
  }
</style>
