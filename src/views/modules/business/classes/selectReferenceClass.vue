<template>
  <el-dialog
    title="请选择作为参照的班课"
    :visible.sync="visible"
    append-to-body>
    <el-table
      :data="dataList"
      highlight-current-row
      border
      stripe
      @current-change="handleCurrentChange"s
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
        bdClassesId: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        length: 0,
        dataList: [],
        currentRow: null
      }
    },
    methods: {
      init (id, startDate, endDate) {
        this.visible = true
        this.id = id
        this.startDate = startDate
        this.endDate = endDate
        this.$http({
          url: this.$http.adornUrl(`/business/classesstudent/info/${this.id}`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.bdClassesId = data.classesStudent.bdClassesId
            this.$http({
              url: this.$http.adornUrl('/business/studentclassarrange/listReferenceClasses'),
              method: 'post',
              data: this.$http.adornData({
                'bdClassesId': this.bdClassesId,
                'startDate': this.startDate,
                'endDate': this.endDate,
                'bdClassesStudentId': this.id
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataList = data.list
              } else {
                this.dataList = []
              }
            })
          }
        })
      },
      dataFormSubmit () {
        this.visible = false
        console.log(this.arrangeDate, this.startTime, this.endTime, this.length)
        this.$emit('getReferenceTime', this.arrangeDate, this.startTime, this.endTime, this.length)
      },
      cancelClick () {
        this.visible = false
        this.$emit('referenceTimeClose')
      },
      handleCurrentChange (val) {
        this.currentRow = val
        if (this.currentRow != null) {
          this.arrangeDate = this.currentRow.arrangeDate
          this.startTime = this.currentRow.startTime
          this.endTime = this.currentRow.endTime
          this.length = this.currentRow.length
        }
      }
    }
  }
</script>

<style scoped>

</style>
