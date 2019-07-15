<template>
  <div class="mod-config">
    <div style="text-align: center">
      <el-date-picker
        v-model="date"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="——"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions">
      </el-date-picker>
    </div>
    <el-row :gutter="10" style="padding-top: 10px">
      <el-col :span="4">
        <div style="background: #0BB2D4;height: 1000px">111</div>
      </el-col>
      <el-col :span="20">
        <div style="background: gainsboro;height: 1000px">2222</div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        date: [Date.now(), Date.now() + 7 * 24 * 3600 * 1000],
        choiceDate: '',
        pickerOptions: {
          onPick: ({ maxDate, minDate }) => {
            this.choiceDate = minDate.getTime()
            if (maxDate) {
              this.choiceDate = ''
            }
          },
          disabledDate: (time) => {
            if (this.choiceDate != null && this.choiceDate !== '') {
              const one = 7 * 24 * 3600 * 1000
              const minTime = this.choiceDate - one
              const maxTime = this.choiceDate + one
              return time.getTime() < minTime || time.getTime() > maxTime
            }
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
