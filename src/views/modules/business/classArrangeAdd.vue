<template>
  <el-dialog
    :title="'排课—' + title"
    :close-on-click-modal="false"
    :visible.sync="visible">
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: true,
        bdTeacherId: null,
        bdStudentId: null,
        title: ''
      }
    },
    methods: {
      init (bdTeacherId, bdStudentId, title) {
        console.log(bdTeacherId, bdStudentId, title)
        this.visible = true
        this.bdTeacherId = bdTeacherId
        this.bdStudentId = bdStudentId
        this.title = title
      }
    }
  }
</script>

<style scoped>

</style>
