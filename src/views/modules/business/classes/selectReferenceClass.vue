<template>
  <el-dialog
    title="请选择作为参照的班课"
    :visible.sync="visible"
    append-to-body>
    <el-table
      :data="dataList"
      highlight-current-row
      @current-change="handleCurrentChange"
      style="width: 100%">
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        width="50"
        label="id">
      </el-table-column>
      <el-table-column
        prop="className"
        header-align="center"
        align="center"
        label="课程">
      </el-table-column>
      <el-table-column
        prop="studentName"
        header-align="center"
        align="center"
        label="学员">
      </el-table-column>
      <el-table-column
        prop="arrangeDate"
        header-align="center"
        align="center"
        label="排课日期">
      </el-table-column>
      <el-table-column
        prop="startTime"
        header-align="center"
        align="center"
        label="开始时间">
      </el-table-column>
      <el-table-column
        prop="endTime"
        header-align="center"
        align="center"
        label="结束时间">
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        id: '',
        startTime: '',
        endTime: '',
        length: 0,
        dataList: [],
        currentRow: null
      }
    },
    methods: {
      init (id) {
        this.visible = true
        this.id = id
        console.log(this.id)
      },
      dataFormSubmit () {
        console.log('提交')
        this.visible = false
        this.$emit('getReferenceTime', '06:00', '07:00', 60)
      },
      cancelClick () {
        this.visible = false
        this.$emit('referenceTimeClose')
      },
      handleCurrentChange (val) {
        this.currentRow = val
      }
    }
  }
</script>

<style scoped>

</style>
