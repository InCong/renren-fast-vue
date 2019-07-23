<template>
  <el-dialog
    title="课程修改"
    :close-on-click-modal="false"
    :visible.sync="visible"
    append-to-body>
    <div style="text-align: center">
      <el-time-select
        placeholder="起始时间"
        v-model="startTime"
        :picker-options="{
            start: '06:00',
            step: '00:15',
            end: '23:00',
            maxTime: endTime
          }">
      </el-time-select>
      <span style="margin-left: 10px;margin-right: 20px">至</span>
      <el-time-select
        placeholder="结束时间"
        v-model="endTime"
        :picker-options="{
            start: '06:00',
            step: '00:15',
            end: '23:00',
            minTime: startTime
          }">
      </el-time-select>
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
        id: '',
        arrangeDate: '',
        startTime: '',
        endTime: ''
      }
    },
    methods: {
      init (id, arrangeDate, startTime, endTime) {
        this.visible = true
        this.id = id
        this.arrangeDate = arrangeDate
        this.startTime = startTime
        this.endTime = endTime
      },
      dataFormSubmit () {
        console.log('保存！')
      }
    }
  }
</script>

<style scoped>

</style>
