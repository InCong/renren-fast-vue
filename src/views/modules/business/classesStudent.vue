<template>
  <el-dialog
    :close-on-click-modal="false"
    :visible.sync="visible">
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
        classId: 0
      }
    },
    methods: {
      init (id) {
        this.classId = id
        this.visible = true
      },
      submit () {
        console.log('保存课程与教师关系')
      }
    }
  }
</script>

<style scoped>

</style>
