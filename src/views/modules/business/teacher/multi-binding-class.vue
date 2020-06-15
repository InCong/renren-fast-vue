<template>
  <el-dialog
    title="批量绑定课程【如果所选教师已有绑定课程，则该操作将会为其补充绑定课程】"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog"
  >
    <div style="text-align: center">
      <el-transfer
        v-model="currentValue"
        :titles="['待选课程','已选课程']"
        :data="classesList"
        :filterable="true"
        :props="{key:'id',label:'name'}"
        style="text-align: left;display: inline-block"
      />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        classesList: [],
        currentValue: [],
        ids: []
      }
    },
    methods: {
      init (ids) {
        this.visible = true
        this.ids = ids
        this.getClassList()
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.currentValue = []
          this.classesList = []
        }
      },
      getClassList () {
        this.$http({
          url: this.$http.adornUrl('/business/classes/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.classesList = data.page.list
          } else {
            this.classesList = []
          }
        })
      },
      dataFormSubmit () {
        if (this.currentValue.length <= 0) {
          this.$message({
            message: '请选择教师！',
            type: 'warning',
            duration: 1500
          })
        } else {
          this.$http({
            url: this.$http.adornUrl('/business/classesteacher/multiTeacherBindingClass'),
            method: 'post',
            data: this.$http.adornData({
              'ids': this.ids,
              'currentValue': this.currentValue
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                }
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
      closeDialog () {
        this.over()
      }
    }
  }
</script>

<style scoped>

</style>
