<template>
  <div>
    <div style="margin-bottom: 25px;margin-top: 10px">
      <span style="font-size: 25px;font-weight: 900">整体数据概览</span>
      <el-button class="el-icon-refresh" type="primary" size="mini" circle style="margin-left: 20px;font-size: 20px" @click="refresh"></el-button>
    </div>
    <div class="mod-home">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="card">
            <div slot="header" class="cardHeader">
              学生总数
            </div>
            <div class="cardContent" v-loading="studentSumLoading">
              <span>{{studentSum}}</span><span style="font-size: 20px"> 人</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="card">
            <div slot="header" class="cardHeader">
              教师总数
            </div>
            <div class="cardContent" v-loading="teacherSumLoading">
              <span>{{teacherSum}}</span><span style="font-size: 20px"> 人</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="card">
            <div slot="header" class="cardHeader">
              开设课程总数
            </div>
            <div class="cardContent" v-loading="classesSumLoading">
              <span>{{classesSum}}</span><span style="font-size: 20px"> 个</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div slot="header" class="cardHeader">
              购买课时占比
            </div>
            <div id="classesFormChartBar" class="chart-box"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div slot="header" class="cardHeader">
              课时分布概况
            </div>
            <div id="classesDistributionChartBar" class="chart-box"></div>
          </el-card>
        </el-col>
        <el-col :span="24">
          <el-card>
            <div slot="header" class="cardHeader">
              商品利润概况
            </div>
            <div id="profitsChartBar" class="chart-box"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  export default {
    data () {
      return {
        studentSum: 0,
        teacherSum: 0,
        classesSum: 0,
        chartLine: null,
        chartBar: null,
        chartPie: null,
        chartScatter: null,
        studentSumLoading: false,
        teacherSumLoading: false,
        classesSumLoading: false
      }
    },
    mounted () {
      this.getStudentSum()
      this.getTeacherSum()
      this.getClassesSum()
      this.initClassesDistributionChartLine()
      this.initProfitsChartBar()
      this.initClassesFormChartPie()
    },
    activated () {
      // 由于给echart添加了resize事件, 在组件激活时需要重新resize绘画一次, 否则出现空白bug
      if (this.chartLine) {
        this.chartLine.resize()
      }
      if (this.chartBar) {
        this.chartBar.resize()
      }
      if (this.chartPie) {
        this.chartPie.resize()
      }
    },
    methods: {
      // 学员总数
      getStudentSum () {
        this.studentSumLoading = true
        this.$http({
          url: this.$http.adornUrl('/statistical/studentSum'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.studentSum = data.count
            this.studentSumLoading = false
          } else {
            this.studentSum = 0
          }
        })
      },
      // 教师总数
      getTeacherSum () {
        this.teacherSumLoading = true
        this.$http({
          url: this.$http.adornUrl('/statistical/teacherSum'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.teacherSum = data.count
            this.teacherSumLoading = false
          } else {
            this.teacherSum = 0
          }
        })
      },
      // 课程总数
      getClassesSum () {
        this.classesSumLoading = true
        this.$http({
          url: this.$http.adornUrl('/statistical/classesSum'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.classesSum = data.count
            this.classesSumLoading = false
          } else {
            this.classesSum = 0
          }
        })
      },
      // 饼状图
      initClassesFormChartPie () {
        var option = {
          // backgroundColor: '#2c343c',
          // title: {
          //   text: '购买课时总比',
          //   left: 'center',
          //   top: 20,
          //   textStyle: {
          //     // color: '#ccc'
          //   }
          // },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          visualMap: {
            show: false,
            min: 80,
            max: 600,
            inRange: {
              colorLightness: [0, 1]
            }
          },
          series: [
            {
              name: '访问来源',
              type: 'pie',
              radius: '55%',
              center: ['50%', '50%'],
              data: [
                { value: 335, name: '直接访问' },
                { value: 310, name: '邮件营销' },
                { value: 274, name: '联盟广告' },
                { value: 235, name: '视频广告' },
                { value: 400, name: '搜索引擎' }
              ].sort(function (a, b) { return a.value - b.value }),
              roseType: 'radius',
              label: {
                normal: {
                  textStyle: {
                    color: 'rgb(9,7,7)'
                  }
                }
              },
              labelLine: {
                normal: {
                  lineStyle: {
                    color: 'rgb(9,7,7)'
                  },
                  smooth: 0.2,
                  length: 10,
                  length2: 20
                }
              },
              itemStyle: {
                normal: {
                  color: '#c23531',
                  shadowBlur: 200,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              animationType: 'scale',
              animationEasing: 'elasticOut',
              animationDelay: function (idx) {
                return Math.random() * 200
              }
            }
          ]
        }
        this.chartPie = echarts.init(document.getElementById('classesFormChartBar'))
        this.chartPie.setOption(option)
        window.addEventListener('resize', () => {
          this.chartPie.resize()
        })
      },
      // 课时分布折线图
      initClassesDistributionChartLine () {
        var option = {
          // 'title': {
          //   'text': '课时分布概况'
          // },
          'tooltip': {
            'trigger': 'axis'
          },
          'legend': {
            'data': [ '邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎' ]
          },
          'grid': {
            'left': '3%',
            'right': '4%',
            'bottom': '3%',
            'containLabel': true
          },
          'toolbox': {
            'feature': {
              'saveAsImage': { }
            }
          },
          'xAxis': {
            'type': 'category',
            'boundaryGap': false,
            'data': [ '周一', '周二', '周三', '周四', '周五', '周六', '周日' ]
          },
          'yAxis': {
            'type': 'value'
          },
          'series': [
            {
              'name': '邮件营销',
              'type': 'line',
              'stack': '总量',
              'data': [ 120, 132, 101, 134, 90, 230, 210 ]
            },
            {
              'name': '联盟广告',
              'type': 'line',
              'stack': '总量',
              'data': [ 220, 182, 191, 234, 290, 330, 310 ]
            },
            {
              'name': '视频广告',
              'type': 'line',
              'stack': '总量',
              'data': [ 150, 232, 201, 154, 190, 330, 410 ]
            },
            {
              'name': '直接访问',
              'type': 'line',
              'stack': '总量',
              'data': [ 320, 332, 301, 334, 390, 330, 320 ]
            },
            {
              'name': '搜索引擎',
              'type': 'line',
              'stack': '总量',
              'data': [ 820, 932, 901, 934, 1290, 1330, 1320 ]
            }
          ]
        }
        this.chartLine = echarts.init(document.getElementById('classesDistributionChartBar'))
        this.chartLine.setOption(option)
        window.addEventListener('resize', () => {
          this.chartLine.resize()
        })
      },
      // 利润柱状图
      initProfitsChartBar () {
        var option = {
          // title: {text: '商品销售概况'},
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: ['收入', '成本', '利润率']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
            }
          ],
          yAxis: [
            {
              type: 'value',
              name: '金额'
            },
            {
              type: 'value',
              name: '利润率',
              min: -5,
              max: 5
            }
          ],
          series: [
            {
              name: '收入',
              type: 'bar',
              stack: '商品销售',
              data: [320, 332, 301, 334, 390, 330, 320, 301, 334, 390, 330, 320]
            },
            {
              name: '成本',
              type: 'bar',
              stack: '商品销售',
              data: [-120, -132, -101, -134, -90, -230, -210, -101, -134, -90, -230, -210]
            },
            {
              name: '利润率',
              type: 'line',
              yAxisIndex: 1,
              data: [1.67, 1.51, 1.98, 1.49, 3.33, 0.52, 0.52, 1.98, 1.49, 3.33, 0.43, 0.52]
            }
          ]
        }
        this.chartBar = echarts.init(document.getElementById('profitsChartBar'))
        this.chartBar.setOption(option)
        window.addEventListener('resize', () => {
          this.chartBar.resize()
        })
      },
      // 刷新
      refresh () {
        this.getStudentSum()
        this.getTeacherSum()
        this.getClassesSum()
        this.initClassesDistributionChartLine()
        this.initProfitsChartBar()
        this.initClassesFormChartPie()
      }
    }
  }
</script>

<style lang="scss">
  .mod-home {
    > .el-alert {
      margin-bottom: 10px;
    }
    > .el-row {
      margin-top: -10px;
      margin-bottom: -10px;
      .el-col {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }
    .chart-box {
      min-height: 400px;
    }
  }
  .card {
    /*min-height: 200px;*/
  }
  .cardHeader {
    font-size: 18px;
    font-weight: 700;
    color: rgba(108, 108, 108, 0.76);
  }
  .cardContent {
    text-align: center;
    font-size: 60px;
    /*color: #ccc;*/
  }
</style>

