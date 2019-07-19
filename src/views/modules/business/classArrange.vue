<template>
  <div class="mod-config">
    <div style="text-align: center">
      <el-date-picker
        v-model="rangeDate"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="——"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        :default-time="['00:00:00', '23:59:59']"
        :picker-options="pickerOptions"
        @change="changeRangeDate">
      </el-date-picker>
    </div>
    <el-row :gutter="10" style="padding-top: 10px">
      <el-col :span="4">
        <el-card shadow="always">
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
        </el-card>
      </el-col>
      <el-col :span="20">
        <el-card shadow="always">
          <el-row>
            <el-col :span="2" style="text-align: center;height: 37px"><div style="position: relative;top: 50%;transform: translateY(-50%);font-size: 16px">时间</div></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week1}}</el-row><el-row>{{day1}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week2}}</el-row><el-row>{{day2}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week3}}</el-row><el-row>{{day3}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week4}}</el-row><el-row>{{day4}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week5}}</el-row><el-row>{{day5}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week6}}</el-row><el-row>{{day6}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week7}}</el-row><el-row>{{day7}}</el-row></el-col>
          </el-row>
        </el-card>
        <el-card shadow="always" class="timeSheet">
          <el-row>
            <el-col :span="2" style="text-align: center">
              <el-row class="timeRow">6:00</el-row>
              <el-row class="timeRow">7:00</el-row>
              <el-row class="timeRow">8:00</el-row>
              <el-row class="timeRow">9:00</el-row>
              <el-row class="timeRow">10:00</el-row>
              <el-row class="timeRow">11:00</el-row>
              <el-row class="timeRow">12:00</el-row>
              <el-row class="timeRow">13:00</el-row>
              <el-row class="timeRow">14:00</el-row>
              <el-row class="timeRow">15:00</el-row>
              <el-row class="timeRow">16:00</el-row>
              <el-row class="timeRow">17:00</el-row>
              <el-row class="timeRow">18:00</el-row>
              <el-row class="timeRow">19:00</el-row>
              <el-row class="timeRow">20:00</el-row>
              <el-row class="timeRow">21:00</el-row>
              <el-row class="timeRow">22:00</el-row>
              <el-row class="timeRow">23:00</el-row>
            </el-col>
            <el-col :span="3" style="text-align: center">
              <el-row><div style="background: lightskyblue;height: 80px;margin-top: 50px"></div></el-row>
            </el-col>
            <el-col :span="3" style="text-align: center">

            </el-col>
            <el-col :span="3" style="text-align: center">

            </el-col>
            <el-col :span="3" style="text-align: center">

            </el-col>
            <el-col :span="3" style="text-align: center">

            </el-col>
            <el-col :span="3" style="text-align: center">

            </el-col>
            <el-col :span="3" style="text-align: center">

            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import moment from 'moment'
  import 'moment/locale/zh-cn'
  export default {
    data () {
      return {
        // 以下几个都是范围日期控件的参数
        rangeDate: [moment().format('YYYY-MM-D'), moment().add(6, 'days').format('YYYY-MM-D')],
        // rangeDate: ['2019-07-18', '2019-07-24'],
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
              const one = 6 * 24 * 3600 * 1000
              const minTime = this.choiceDate - one
              const maxTime = this.choiceDate + one
              return time.getTime() < minTime || time.getTime() > maxTime
            }
          }
        },
        // 以下是基本用的数据数组
        teacherList: [],
        studentList: [],
        // 以下是日期相关的变量
        day1: '',
        day2: '',
        day3: '',
        day4: '',
        day5: '',
        day6: '',
        day7: '',
        week1: '',
        week2: '',
        week3: '',
        week4: '',
        week5: '',
        week6: '',
        week7: ''
      }
    },
    activated () {
      this.getTeacherList()
      this.initHeader()
    },
    methods: {
      // 修改教师与学员表格列头样式
      tableHeaderColor ({row, column, rowIndex, columnIdex}) {
        if (rowIndex === 0) {
          return 'background-color: lightskyblue;color: #fff;font-weight: 500;font-size: 16px;height: 20px'
        }
      },
      // 修改行的样式
      tableRowStyle ({row, rowIndex}) {
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
        console.log(moment(this.rangeDate[0]).format('ddd'))
      },
      // 选择完日期之后，自动填充列头
      changeRangeDate () {
        this.initHeader()
      },
      // 第一次初始化列头
      initHeader () {
        if (this.rangeDate != null) {
          let count = (moment(this.rangeDate[1]) - moment(this.rangeDate[0])) / 1000 / 3600 / 24 + 1
          for (var i = 1; i <= 7; i++) {
            if (i === 1 && i <= count) {
              this.day1 = moment(this.rangeDate[0]).format('MM-D')
              this.week1 = moment(this.rangeDate[0]).format('ddd')
            } else if (i === 2 && i <= count) {
              this.day2 = moment(this.rangeDate[0]).add(1, 'days').format('MM-D')
              this.week2 = moment(this.rangeDate[0]).add(1, 'days').format('ddd')
            } else if (i === 3 && i <= count) {
              this.day3 = moment(this.rangeDate[0]).add(2, 'days').format('MM-D')
              this.week3 = moment(this.rangeDate[0]).add(2, 'days').format('ddd')
            } else if (i === 4 && i <= count) {
              this.day4 = moment(this.rangeDate[0]).add(3, 'days').format('MM-D')
              this.week4 = moment(this.rangeDate[0]).add(3, 'days').format('ddd')
            } else if (i === 5 && i <= count) {
              this.day5 = moment(this.rangeDate[0]).add(4, 'days').format('MM-D')
              this.week5 = moment(this.rangeDate[0]).add(4, 'days').format('ddd')
            } else if (i === 6 && i <= count) {
              this.day6 = moment(this.rangeDate[0]).add(5, 'days').format('MM-D')
              this.week6 = moment(this.rangeDate[0]).add(5, 'days').format('ddd')
            } else if (i === 7 && i <= count) {
              this.day7 = moment(this.rangeDate[1]).format('MM-D')
              this.week7 = moment(this.rangeDate[1]).format('ddd')
            } else if (i === 1 && i > count) {
              this.day1 = '无'
              this.week1 = ''
            } else if (i === 2 && i > count) {
              this.day2 = '无'
              this.week2 = ''
            } else if (i === 3 && i > count) {
              this.day3 = '无'
              this.week3 = ''
            } else if (i === 4 && i > count) {
              this.day4 = '无'
              this.week4 = ''
            } else if (i === 5 && i > count) {
              this.day5 = '无'
              this.week5 = ''
            } else if (i === 6 && i > count) {
              this.day6 = '无'
              this.week6 = ''
            } else if (i === 7 && i > count) {
              this.day7 = '无'
              this.week7 = ''
            }
          }
        } else {
          this.day1 = '无'
          this.day2 = '无'
          this.day3 = '无'
          this.day4 = '无'
          this.day5 = '无'
          this.day6 = '无'
          this.day7 = '无'
        }
      }
    }
  }
</script>

<style>
  .el-table__body tr.current-row>td{
    background-color: #f57878 !important;
    color: wheat;
  }
  .timeRow {
    margin-bottom: 20px;
    height: 20px;
    font-size: 18px;
    /*background: #a2e1da;*/
  }
  .timeSheet .el-card__body{
    padding-top: 30px;
  }
</style>
