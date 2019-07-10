<template>
  <el-dialog
    :close-on-click-modal="false"
    :visible.sync="visible">
    <div style="text-align: center">
      <el-transfer
        v-model="value"
        :titles="['待选','已选']"
        :data="teacherList"
        :filterable="true"
        :props="{key:'id',label:'name'}"
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
        teacherList: [],
        value: [],
        pageIndex: 1,
        pageSize: 1000,
        totalPage: 0,
      }
    },
    methods: {
      init (id) {
        this.classId = id
        this.visible = true
        this.$http({
          url: this.$http.adornUrl('/business/teacher/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以获取全部机构部门的列表
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.teacherList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.teacherList = []
            this.totalPage = 0
          }
        })
      },
      submit () {
        console.log('保存课程与教师关系')
      }
    }
  }
</script>

<style scoped>

</style>
