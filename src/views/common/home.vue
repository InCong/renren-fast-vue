<template>
  <div class="mod-home">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="card">
          <div slot="header" class="cardHeader">
            学生总数
          </div>
          <div class="cardContent">
            <span>{{studentCount}}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="card">
          <div slot="header" class="cardHeader">
            教师总数
          </div>
          <div class="cardContent">
            <span>10</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="card">
          <div slot="header" class="cardHeader">
            开设课程总数
          </div>
          <div class="cardContent">
            <span>10</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header" class="cardHeader">
            购买课时占比
          </div>
          <div id="J_chartPieBox" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header" class="cardHeader">
            课时分布概况
          </div>
          <div id="J_chartLineBox" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card>
          <div slot="header" class="cardHeader">
            商品销售概况
          </div>
          <div id="J_chartBarBox" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card>
          <div slot="header" class="cardHeader">
            商品利润概况
          </div>
          <div id="J_chartBarBox1" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import echarts from 'echarts'
  export default {
    data () {
      return {
        studentCount: 0,
        chartLine: null,
        chartBar: null,
        chartPie: null,
        chartScatter: null
      }
    },
    mounted () {
      this.getStudentCount()
      this.initChartLine()
      this.initChartBar()
      this.initChartPie()
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
      getStudentCount () {
        this.$http({
          url: this.$http.adornUrl('/statistical/studentSum'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.studentCount = data.count
          } else {
            this.studentCount = 0
          }
        })
      },
      // 折线图
      initChartLine () {
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
        this.chartLine = echarts.init(document.getElementById('J_chartLineBox'))
        this.chartLine.setOption(option)
        window.addEventListener('resize', () => {
          this.chartLine.resize()
        })
      },
      // 柱状图
      initChartBar () {
        var option = {
          // title: {text: '商品销售概况'},
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎', '百度', '谷歌', '必应', '其他']
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
              data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '直接访问',
              type: 'bar',
              data: [320, 332, 301, 334, 390, 330, 320]
            },
            {
              name: '邮件营销',
              type: 'bar',
              stack: '广告',
              data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
              name: '联盟广告',
              type: 'bar',
              stack: '广告',
              data: [220, 182, 191, 234, 290, 330, 310]
            },
            {
              name: '视频广告',
              type: 'bar',
              stack: '广告',
              data: [150, 232, 201, 154, 190, 330, 410]
            },
            {
              name: '搜索引擎',
              type: 'bar',
              data: [862, 1018, 964, 1026, 1679, 1600, 1570],
              markLine: {
                lineStyle: {
                  normal: {
                    type: 'dashed'
                  }
                },
                data: [
                  [{ type: 'min' }, { type: 'max' }]
                ]
              }
            },
            {
              name: '百度',
              type: 'bar',
              barWidth: 5,
              stack: '搜索引擎',
              data: [620, 732, 701, 734, 1090, 1130, 1120]
            },
            {
              name: '谷歌',
              type: 'bar',
              stack: '搜索引擎',
              data: [120, 132, 101, 134, 290, 230, 220]
            },
            {
              name: '必应',
              type: 'bar',
              stack: '搜索引擎',
              data: [60, 72, 71, 74, 190, 130, 110]
            },
            {
              name: '其他',
              type: 'bar',
              stack: '搜索引擎',
              data: [62, 82, 91, 84, 109, 110, 120]
            }
          ]
        }
        this.chartBar = echarts.init(document.getElementById('J_chartBarBox'))
        this.chartBar.setOption(option)
        window.addEventListener('resize', () => {
          this.chartBar.resize()
        })
      },
      // 饼状图
      initChartPie () {
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
                    // color: 'rgba(255, 255, 255, 0.3)'
                  }
                }
              },
              labelLine: {
                normal: {
                  lineStyle: {
                    // color: 'rgba(255, 255, 255, 0.3)'
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
        this.chartPie = echarts.init(document.getElementById('J_chartPieBox'))
        this.chartPie.setOption(option)
        window.addEventListener('resize', () => {
          this.chartPie.resize()
        })
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
    min-height: 200px;
  }
  .cardHeader {
    font-size: 18px;
    font-weight: 700;
    /*color: #ccc;*/
  }
  .cardContent {
    text-align: center;
    font-size: 50px;
    /*color: #ccc;*/
  }
</style>

