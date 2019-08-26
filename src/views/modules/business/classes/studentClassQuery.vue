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
            <el-col :span="24">
              <el-row :gutter="5" style="margin-bottom: 10px">
                <el-col :span="16">
                  <el-input v-model="queryName" placeholder="名称" clearable></el-input>
                </el-col>
                <el-col :span="4">
                  <el-button @click="getStudentList">查询</el-button>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-table
                    :data="studentList"
                    border
                    highlight-current-row
                    max-height="1000px"
                    :header-cell-style="tableHeaderColor"
                    :row-style="tableRowStyle"
                    @row-click="teacherRowClick">
                    <el-table-column
                      prop="nickname"
                      header-align="center"
                      align="center"
                      label="学员">
                    </el-table-column>
                  </el-table>
                </el-col>
              </el-row>
              <el-pagination
                @size-change="sizeChangeHandle"
                @current-change="currentChangeHandle"
                :hide-on-single-page="true"
                :current-page="pageIndex"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pageSize"
                :total="totalPage"
                layout="total, prev, pager, next">
              </el-pagination>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="20">
        <el-card shadow="always" style="background: #a2e1da">
          <el-row>
            <el-col :span="2" style="text-align: center;height: 37px"><div style="position: relative;top: 50%;transform: translateY(-50%);font-size: 16px">时间</div></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week1}}</el-row><el-row>{{day1.substring(5)}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week2}}</el-row><el-row>{{day2.substring(5)}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week3}}</el-row><el-row>{{day3.substring(5)}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week4}}</el-row><el-row>{{day4.substring(5)}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week5}}</el-row><el-row>{{day5.substring(5)}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week6}}</el-row><el-row>{{day6.substring(5)}}</el-row></el-col>
            <el-col :span="3" style="text-align: center"><el-row style="margin-bottom: 5px">{{week7}}</el-row><el-row>{{day7.substring(5)}}</el-row></el-col>
          </el-row>
        </el-card>
        <el-card shadow="always" class="timeSheet" v-loading="classQueryListLoading">
          <el-row>
            <div style="position: absolute;margin-left: 110px;width: 1183px;height: 720px">
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
              <el-row class="timeRow"><el-divider></el-divider></el-row>
            </div>
            <div style="position: relative">
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
            </div>
            <div style="position: relative">
              <el-col :span="3" class="classArrangeCol">
                <el-tooltip v-for="item in dayList1" v-bind:key="item.id" effect="light" placement="right">
                  <div slot="content" style="text-align: left;font-size: 18px">
                    <el-row><i class="el-icon-s-custom toolTipsContent"></i>{{item.teacherName}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.className}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.classWay}}</el-row>
                    <el-row><i class="el-icon-alarm-clock toolTipsContent"></i>{{item.startTime}}至{{item.endTime}} 共{{item.length}}分钟</el-row>
                    <el-row><i class="el-icon-finished toolTipsContent"></i>{{item.signTime}}</el-row>
                    <el-row><i class="el-icon-tickets toolTipsContent"></i>{{item.remark}}</el-row>
                  </div>
                  <div class="contentBlock" :style="'height: '+ (item.num * 2) + 'cm;margin-top: ' + ((item.diffTime * 2) + 0.25) + 'cm'" v-on:dblclick="classClick(item.id, item.bdStudentId, item.className, item.startTime, item.endTime, item.arrangeDate)">
                    <div class="centerContent">
                      <el-row style="margin-bottom: 5px">
                        {{item.className}}
                      </el-row>
                      <el-row style="color: lightcyan">
                        <i class="el-icon-bell" style="margin-right: 10px"></i>{{item.startTime}}至{{item.endTime}}
                      </el-row>
                    </div>
                  </div>
                </el-tooltip>
              </el-col>
              <el-col :span="3" class="classArrangeCol">
                <el-tooltip v-for="item in dayList2" v-bind:key="item.id" effect="light" placement="right">
                  <div slot="content" style="text-align: left;font-size: 18px">
                    <el-row><i class="el-icon-s-custom toolTipsContent"></i>{{item.teacherName}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.className}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.classWay}}</el-row>
                    <el-row><i class="el-icon-alarm-clock toolTipsContent"></i>{{item.startTime}}至{{item.endTime}} 共{{item.length}}分钟</el-row>
                    <el-row><i class="el-icon-finished toolTipsContent"></i>{{item.signTime}}</el-row>
                    <el-row><i class="el-icon-tickets toolTipsContent"></i>{{item.remark}}</el-row>
                  </div>
                  <div class="contentBlock" :style="'height: '+ (item.num * 2) + 'cm;margin-top: ' + ((item.diffTime * 2) + 0.25) + 'cm'" v-on:dblclick="classClick(item.id, item.bdStudentId, item.className, item.startTime, item.endTime, item.arrangeDate)">
                    <div class="centerContent">
                      <el-row style="margin-bottom: 5px">
                        {{item.className}}
                      </el-row>
                      <el-row style="color: lightcyan">
                        <i class="el-icon-bell" style="margin-right: 10px"></i>{{item.startTime}}至{{item.endTime}}
                      </el-row>
                    </div>
                  </div>
                </el-tooltip>
              </el-col>
              <el-col :span="3" class="classArrangeCol">
                <el-tooltip v-for="item in dayList3" v-bind:key="item.id" effect="light" placement="right">
                  <div slot="content" style="text-align: left;font-size: 18px">
                    <el-row><i class="el-icon-s-custom toolTipsContent"></i>{{item.teacherName}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.className}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.classWay}}</el-row>
                    <el-row><i class="el-icon-alarm-clock toolTipsContent"></i>{{item.startTime}}至{{item.endTime}} 共{{item.length}}分钟</el-row>
                    <el-row><i class="el-icon-finished toolTipsContent"></i>{{item.signTime}}</el-row>
                    <el-row><i class="el-icon-tickets toolTipsContent"></i>{{item.remark}}</el-row>
                  </div>
                  <div class="contentBlock" :style="'height: '+ (item.num * 2) + 'cm;margin-top: ' + ((item.diffTime * 2) + 0.25) + 'cm'" v-on:dblclick="classClick(item.id, item.bdStudentId, item.className, item.startTime, item.endTime, item.arrangeDate)">
                    <div class="centerContent">
                      <el-row style="margin-bottom: 5px">
                        {{item.className}}
                      </el-row>
                      <el-row style="color: lightcyan">
                        <i class="el-icon-bell" style="margin-right: 10px"></i>{{item.startTime}}至{{item.endTime}}
                      </el-row>
                    </div>
                  </div>
                </el-tooltip>
              </el-col>
              <el-col :span="3" class="classArrangeCol">
                <el-tooltip v-for="item in dayList4" v-bind:key="item.id" effect="light" placement="right">
                  <div slot="content" style="text-align: left;font-size: 18px">
                    <el-row><i class="el-icon-s-custom toolTipsContent"></i>{{item.teacherName}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.className}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.classWay}}</el-row>
                    <el-row><i class="el-icon-alarm-clock toolTipsContent"></i>{{item.startTime}}至{{item.endTime}} 共{{item.length}}分钟</el-row>
                    <el-row><i class="el-icon-finished toolTipsContent"></i>{{item.signTime}}</el-row>
                    <el-row><i class="el-icon-tickets toolTipsContent"></i>{{item.remark}}</el-row>
                  </div>
                  <div class="contentBlock" :style="'height: '+ (item.num * 2) + 'cm;margin-top: ' + ((item.diffTime * 2) + 0.25) + 'cm'" v-on:dblclick="classClick(item.id, item.bdStudentId, item.className, item.startTime, item.endTime, item.arrangeDate)">
                    <div class="centerContent">
                      <el-row style="margin-bottom: 5px">
                        {{item.className}}
                      </el-row>
                      <el-row style="color: lightcyan">
                        <i class="el-icon-bell" style="margin-right: 10px"></i>{{item.startTime}}至{{item.endTime}}
                      </el-row>
                    </div>
                  </div>
                </el-tooltip>
              </el-col>
              <el-col :span="3" class="classArrangeCol">
                <el-tooltip v-for="item in dayList5" v-bind:key="item.id" effect="light" placement="right">
                  <div slot="content" style="text-align: left;font-size: 18px">
                    <el-row><i class="el-icon-s-custom toolTipsContent"></i>{{item.teacherName}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.className}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.classWay}}</el-row>
                    <el-row><i class="el-icon-alarm-clock toolTipsContent"></i>{{item.startTime}}至{{item.endTime}} 共{{item.length}}分钟</el-row>
                    <el-row><i class="el-icon-finished toolTipsContent"></i>{{item.signTime}}</el-row>
                    <el-row><i class="el-icon-tickets toolTipsContent"></i>{{item.remark}}</el-row>
                  </div>
                  <div class="contentBlock" :style="'height: '+ (item.num * 2) + 'cm;margin-top: ' + ((item.diffTime * 2) + 0.25) + 'cm'" v-on:dblclick="classClick(item.id, item.bdStudentId, item.className, item.startTime, item.endTime, item.arrangeDate)">
                    <div class="centerContent">
                      <el-row style="margin-bottom: 5px">
                        {{item.className}}
                      </el-row>
                      <el-row style="color: lightcyan">
                        <i class="el-icon-bell" style="margin-right: 10px"></i>{{item.startTime}}至{{item.endTime}}
                      </el-row>
                    </div>
                  </div>
                </el-tooltip>
              </el-col>
              <el-col :span="3" class="classArrangeCol">
                <el-tooltip v-for="item in dayList6" v-bind:key="item.id" effect="light" placement="right">
                  <div slot="content" style="text-align: left;font-size: 18px">
                    <el-row><i class="el-icon-s-custom toolTipsContent"></i>{{item.teacherName}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.className}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.classWay}}</el-row>
                    <el-row><i class="el-icon-alarm-clock toolTipsContent"></i>{{item.startTime}}至{{item.endTime}} 共{{item.length}}分钟</el-row>
                    <el-row><i class="el-icon-finished toolTipsContent"></i>{{item.signTime}}</el-row>
                    <el-row><i class="el-icon-tickets toolTipsContent"></i>{{item.remark}}</el-row>
                  </div>
                  <div class="contentBlock" :style="'height: '+ (item.num * 2) + 'cm;margin-top: ' + ((item.diffTime * 2) + 0.25) + 'cm'" v-on:dblclick="classClick(item.id, item.bdStudentId, item.className, item.startTime, item.endTime, item.arrangeDate)">
                    <div class="centerContent">
                      <el-row style="margin-bottom: 5px">
                        {{item.className}}
                      </el-row>
                      <el-row style="color: lightcyan">
                        <i class="el-icon-bell" style="margin-right: 10px"></i>{{item.startTime}}至{{item.endTime}}
                      </el-row>
                    </div>
                  </div>
                </el-tooltip>
              </el-col>
              <el-col :span="3" class="classArrangeCol">
                <el-tooltip v-for="item in dayList7" v-bind:key="item.id" effect="light" placement="right">
                  <div slot="content" style="text-align: left;font-size: 18px">
                    <el-row><i class="el-icon-s-custom toolTipsContent"></i>{{item.teacherName}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.className}}</el-row>
                    <el-row><i class="el-icon-reading toolTipsContent"></i>{{item.classWay}}</el-row>
                    <el-row><i class="el-icon-alarm-clock toolTipsContent"></i>{{item.startTime}}至{{item.endTime}} 共{{item.length}}分钟</el-row>
                    <el-row><i class="el-icon-finished toolTipsContent"></i>{{item.signTime}}</el-row>
                    <el-row><i class="el-icon-tickets toolTipsContent"></i>{{item.remark}}</el-row>
                  </div>
                  <div class="contentBlock" :style="'height: '+ (item.num * 2) + 'cm;margin-top: ' + ((item.diffTime * 2) + 0.25) + 'cm'" v-on:dblclick="classClick(item.id, item.bdStudentId, item.className, item.startTime, item.endTime, item.arrangeDate)">
                    <div class="centerContent">
                      <el-row style="margin-bottom: 5px">
                        {{item.className}}
                      </el-row>
                      <el-row style="color: lightcyan">
                        <i class="el-icon-bell" style="margin-right: 10px"></i>{{item.startTime}}至{{item.endTime}}
                      </el-row>
                    </div>
                  </div>
                </el-tooltip>
              </el-col>
            </div>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <!-- 弹窗，显示课程操作区域 -->
    <student-class-query-opera v-if="studentClassQueryOperaVisible" ref="studentClassQueryOpera"></student-class-query-opera>
  </div>
</template>

<script>
  import moment from 'moment'
  import 'moment/locale/zh-cn'
  import StudentClassQueryOpera from './studentClassQueryOpera'
  export default {
    components: {
      StudentClassQueryOpera
    },
    data () {
      return {
        // 以下几个都是范围日期控件的参数
        rangeDate: [moment().format('YYYY-MM-D'), moment().add(6, 'days').format('YYYY-MM-D')],
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
        classesList: [],
        studentList: [],
        // 以下是日期的相关数据数组
        dayList1: [],
        dayList2: [],
        dayList3: [],
        dayList4: [],
        dayList5: [],
        dayList6: [],
        dayList7: [],
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
        week7: '',
        // 以下是基本使用的变量
        pageIndex: 1,
        pageSize: 20,
        totalPage: 0,
        classQueryListLoading: false,
        studentClassQueryOperaVisible: false,
        bdStudentId: 0,
        studentName: '',
        bdClassesId: 0,
        classesName: '',
        queryName: ''
      }
    },
    activated () {
      this.initHeader()
    },
    mounted () {
      this.getStudentList()
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
      getStudentList () {
        this.$http({
          url: this.$http.adornUrl('/business/student/list'),
          method: 'post',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'nickname': this.queryName,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.studentList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.studentList = []
            this.totalPage = 0
          }
          this.classesList = []
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getStudentList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getStudentList()
      },
      // 点击指定学员时，显示该学员的排课情况
      teacherRowClick (row, column, event) {
        this.bdStudentId = row.id
        this.studentName = row.name
        this.bdClassesId = 0
        this.classesName = ''
        // 显示该学员的排课情况
        this.getClassQuery()
      },
      // 选择完日期之后，自动填充列头
      changeRangeDate () {
        this.initHeader()
      },
      // 第一次初始化列头
      initHeader () {
        if (this.rangeDate != null) {
          let count = (moment(this.rangeDate[1]) - moment(this.rangeDate[0])) / 1000 / 3600 / 24 + 1
          for (let i = 1; i <= 7; i++) {
            if (i === 1 && i <= count) {
              this.day1 = moment(this.rangeDate[0]).format('YYYY-MM-DD')
              this.week1 = moment(this.rangeDate[0]).format('ddd')
            } else if (i === 2 && i <= count) {
              this.day2 = moment(this.rangeDate[0]).add(1, 'days').format('YYYY-MM-DD')
              this.week2 = moment(this.rangeDate[0]).add(1, 'days').format('ddd')
            } else if (i === 3 && i <= count) {
              this.day3 = moment(this.rangeDate[0]).add(2, 'days').format('YYYY-MM-DD')
              this.week3 = moment(this.rangeDate[0]).add(2, 'days').format('ddd')
            } else if (i === 4 && i <= count) {
              this.day4 = moment(this.rangeDate[0]).add(3, 'days').format('YYYY-MM-DD')
              this.week4 = moment(this.rangeDate[0]).add(3, 'days').format('ddd')
            } else if (i === 5 && i <= count) {
              this.day5 = moment(this.rangeDate[0]).add(4, 'days').format('YYYY-MM-DD')
              this.week5 = moment(this.rangeDate[0]).add(4, 'days').format('ddd')
            } else if (i === 6 && i <= count) {
              this.day6 = moment(this.rangeDate[0]).add(5, 'days').format('YYYY-MM-DD')
              this.week6 = moment(this.rangeDate[0]).add(5, 'days').format('ddd')
            } else if (i === 7 && i <= count) {
              this.day7 = moment(this.rangeDate[1]).format('YYYY-MM-DD')
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
      },
      // 获取课程安排记录
      getClassQuery () {
        let dateList = [this.day1, this.day2, this.day3, this.day4, this.day5, this.day6, this.day7]
        this.classQueryListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/studentclassarrange/listStudentClassArrange2'),
          method: 'post',
          data: this.$http.adornData({
            'bdStudentId': this.bdStudentId,
            'arrangeDateList': dateList
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dayList1 = data.dayList1
            this.dayList2 = data.dayList2
            this.dayList3 = data.dayList3
            this.dayList4 = data.dayList4
            this.dayList5 = data.dayList5
            this.dayList6 = data.dayList6
            this.dayList7 = data.dayList7
          } else {
            console.log('error!', data)
          }
          this.classQueryListLoading = false
        })
      },
      // 课程点击
      classClick (id, bdStudentId, className, startTime, endTime, arrangeDate) {
        this.studentClassQueryOperaVisible = true
        this.$nextTick(() => {
          this.$refs.studentClassQueryOpera.init(id, bdStudentId, className, startTime, endTime, arrangeDate)
        })
      },
      formatClassesName: function (row, column) {
        return row.bdClassesName.substring(0, row.bdClassesName.indexOf('('))
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
    margin-bottom: 1cm;
    height: 1cm;
    font-size: 18px;
  }
  .timeSheet .el-card__body{
    padding-top: 30px;
  }
  .classArrangeCol {
    text-align: center;
    min-width: 161px;
    min-height: 720px
  }
  .centerContent {
    position: relative;top: 50%;transform: translateY(-50%)
  }
  .contentBlock {
    background: lightskyblue;
    position: absolute;
    min-width: 155px;
  }
  .contentBlockSign {
    background: mediumseagreen;
    position: absolute;
    min-width: 155px;
  }
  .toolTipsContent {
    margin-right: 10px;
    margin-bottom: 10px;
  }
  .timeSheet {
    background: honeydew;
  }
  .el-divider--horizontal {
    margin: 10px;
  }
</style>
