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
        <el-row>
          <el-col :span="12">
            <el-table
              :data="teacherList"
              border
              highlight-current-row
              max-height="1000px"
              :header-cell-style="tableHeaderColor"
              :row-style="tableRowStyle"
              @row-click="teacherRowClick">
              <el-table-column
                prop="name"
                header-align="center"
                align="center"
                label="教师">
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="12">
            <el-table
              :data="studentList"
              border
              highlight-current-row
              max-height="1000px"
              :header-cell-style="tableHeaderColor"
              :row-style="tableRowStyle"
              @row-click="studentRowClick">
              <el-table-column
                prop="studentName"
                header-align="center"
                align="center"
                label="学员">
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="20">
        <el-row>
          <el-col :span="2">测试</el-col>
          <el-col :span="3">周一</el-col>
          <el-col :span="3">周二</el-col>
          <el-col :span="3">周三</el-col>
          <el-col :span="3">周四</el-col>
          <el-col :span="3">周五</el-col>
          <el-col :span="3">周六</el-col>
          <el-col :span="3">周日</el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        // 以下几个都是范围日期控件的参数
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
        },
        // 以下是基本用的
        teacherList: [],
        studentList: []
      }
    },
    activated () {
      this.getTeacherList()
    },
    methods: {
      // 修改教师与学员表格列头样式
      tableHeaderColor ({row, column, rowIndex, columnIdex}) {
        if (rowIndex === 0) {
          return 'background-color: lightskyblue;color: #fff;font-weight: 500;font-size: 16px;height: 20px'
        }
      },
      // 修改行的样式
      tableRowStyle({row, rowIndex}) {
        return 'height: 60px;font-size: 16px'
      },
      getTeacherList () {
        this.$http({
          url: this.$http.adornUrl('/business/teacher/list'),
          method: 'post',
          data: this.$http.adornData({
            'page': 1,
            'limit': 1000
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.teacherList = data.page.list
          } else {
            this.teacherList = []
          }
        })
      },
      // 点击指定教师时，显示该教师名下的学员清单，并显示该教师的排课情况
      teacherRowClick (row, column, event) {
        this.$http({
          url: this.$http.adornUrl('/business/teacherclasssettlement/listTeacherClassSettlement'),
          method: 'post',
          data: this.$http.adornData({
            'page': 1,
            'limit': 1000,
            'bdTeacherId': row.id,
            'isSettlement': -1
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.studentList = data.page.records
          } else {
            this.studentList = []
          }
        })
      },
      // 点击指定学员时，显示该学员的排课情况
      studentRowClick (row, column, event) {
        console.log(row, column, event)
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
