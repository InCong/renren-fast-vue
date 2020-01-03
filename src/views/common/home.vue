<template>
  <div>
    <div style="margin-bottom: 25px;margin-top: 10px">
      <span style="font-size: 25px;font-weight: 900">数据概览</span>
      <el-button class="el-icon-refresh" type="primary" size="mini" circle style="margin-left: 20px;font-size: 20px" @click="refresh"></el-button>
    </div>
    <div class="mod-home">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="card">
            <div slot="header" class="cardHeader">
              今日新增学员
            </div>
            <div class="cardContent" v-loading="studentAddLoading">
              <span>{{studentAddNum}}</span><span style="font-size: 20px"> 人</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="card">
            <div slot="header" class="cardHeader">
              今日新增购买课时
            </div>
            <div class="cardContent" v-loading="classBuyAddLoading">
              <span>{{classBuyAddNum}}</span><span style="font-size: 20px"> 个</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="card">
            <div slot="header" class="cardHeader">
              今日上课教师
            </div>
            <div class="cardContent" v-loading="teacherTodayLoading">
              <span>{{teacherTodayNum}}</span><span style="font-size: 20px"> 个</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="card">
            <div slot="header" class="cardHeader">
              今日上课学员
            </div>
            <div class="cardContent" v-loading="studentTodayLoading">
              <span>{{studentTodayNum}}</span><span style="font-size: 20px"> 个</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div slot="header" class="cardHeader">
              今日签到占比
            </div>
            <div id="classSignFormChartBar" class="chart-box"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div slot="header" class="cardHeader">
              今日课程种类占比
            </div>
            <div id="classSignFormChartBar2" class="chart-box"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div slot="header" class="cardHeader">
              今日销售占比
            </div>
            <div id="classSignFormChartBar3" class="chart-box"></div>
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
        studentAddNum: 0,
        classBuyAddNum: 0,
        teacherTodayNum: 0,
        studentTodayNum: 0,
        // 图形
        signTodayChartPie: null,
        classTypeTodayChartPie: null,
        saleTodayChartPie: null,
        // loading
        studentAddLoading: false,
        classBuyAddLoading: false,
        teacherTodayLoading: false,
        studentTodayLoading: false,
        signTodayLoading: false,
        classTypeTodayLoading: false,
        saleTodayLoading: false,
        // 当天签到情况
        signTypeName: [],
        signTypeData: [],
        // 当天课程种类情况
        classTypeName: [],
        classTypeData: [],
        // 当天销售商品种类情况
        saleGoodsTypeName: [],
        saleGoodsTypeData: []
      }
    },
    mounted () {
      // 先加载数据
      this.getStudentAddNum()
      this.getClassBuyAddNum()
      this.getTeacherTodayNum()
      this.getStudentTodayNum()
      this.getSignNum()
      this.getClassTypeTodayNum()
      this.getSaleTodayNum()
    },
    activated () {
      // 由于给echart添加了resize事件, 在组件激活时需要重新resize绘画一次, 否则出现空白bug
      if (this.signTodayChartPie) {
        this.signTodayChartPie.resize()
      }
      if (this.classTypeTodayChartPie) {
        this.classTypeTodayChartPie.resize()
      }
      if (this.saleTodayChartPie) {
        this.saleTodayChartPie.resize()
      }
    },
    methods: {
      // 今日学员新增数量
      getStudentAddNum () {
        this.studentAddLoading = true
        this.$http({
          url: this.$http.adornUrl('/statistical/studentAddNum'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.studentAddNum = data.count
            this.studentAddLoading = false
          } else {
            this.studentAddNum = 0
          }
        })
      },
      // 今日课程购买课时
      getClassBuyAddNum () {
        this.classBuyAddLoading = true
        this.$http({
          url: this.$http.adornUrl('/statistical/classBuyAddNum'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.classBuyAddNum = data.count
            if (!this.classBuyAddNum) {
              this.classBuyAddNum = 0
            }
            this.classBuyAddLoading = false
          } else {
            this.classBuyAddNum = 0
          }
        })
      },
      // 今日上课教师数量
      getTeacherTodayNum () {
        this.teacherTodayLoading = true
        this.$http({
          url: this.$http.adornUrl('/statistical/teacherTodayNum'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.teacherTodayNum = data.count
            this.teacherTodayLoading = false
          } else {
            this.teacherTodayNum = 0
          }
        })
      },
      // 今日上课学员数量
      getStudentTodayNum () {
        this.studentTodayLoading = true
        this.$http({
          url: this.$http.adornUrl('/statistical/studentTodayNum'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.studentTodayNum = data.count
            this.studentTodayLoading = false
          } else {
            this.studentTodayNum = 0
          }
        })
      },
      // 获取当天签到情况
      getSignNum () {
        this.signTypeName = ['微信签到', '人工签到', '未签到']
        this.signTodayLoading = true
        this.$http({
          url: this.$http.adornUrl('/statistical/signTodayNum'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            if (data.signToday.wechatSign > 0) {
              let obj = {}
              this.$set(obj, 'value', data.signToday.wechatSign)
              this.$set(obj, 'name', '微信签到')
              this.signTypeData.push(obj)
            }
            if (data.signToday.handSign > 0) {
              let obj = {}
              this.$set(obj, 'value', data.signToday.handSign)
              this.$set(obj, 'name', '人工签到')
              this.signTypeData.push(obj)
            }
            if (data.signToday.notSign > 0) {
              let obj = {}
              this.$set(obj, 'value', data.signToday.notSign)
              this.$set(obj, 'name', '未签到')
              this.signTypeData.push(obj)
            }
            this.initSignTodayChartPie()
            this.signTodayLoading = false
          } else {
            this.signTypeData = [
              {value: 0, name: '微信签到'},
              {value: 0, name: '人工签到'},
              {value: 0, name: '未签到'}
            ]
            this.initSignTodayChartPie()
            this.signTodayLoading = false
          }
        })
      },
      // 获取当天课程种类数量
      getClassTypeTodayNum () {
        this.classTypeTodayLoading = true
        this.classTypeName = []
        this.$http({
          url: this.$http.adornUrl('/basic/classtype/getClassTypeName'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            for (let i = 0; i < data.list.length; i++) {
              this.classTypeName.push(data.list[i].name)
            }
          }
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/statistical/classTypeTodayNum'),
            method: 'post',
            data: this.$http.adornData({
              'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              for (let i = 0; i < data.list.length; i++) {
                let obj = {}
                this.$set(obj, 'value', data.list[0].count)
                this.$set(obj, 'name', data.list[0].name)
                this.classTypeData.push(obj)
              }
              console.log(this.classTypeData)
              this.initClassTypeTodayChartPie()
              this.classTypeTodayLoading = false
            } else {
              this.classTypeData = []
              this.initClassTypeTodayChartPie()
              this.classTypeTodayLoading = false
            }
          })
        })
      },
      // 获取当天销售商品种类数量
      getSaleTodayNum () {
        this.saleTodayLoading = true
        this.saleGoodsTypeName = []
        this.$http({
          url: this.$http.adornUrl('/warehouse/goodstype/getGoodsTypeName'),
          method: 'post',
          data: this.$http.adornData({
            'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            for (let i = 0; i < data.list.length; i++) {
              this.saleGoodsTypeName.push(data.list[i].name)
            }
          }
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/statistical/saleTodayNum'),
            method: 'post',
            data: this.$http.adornData({
              'bdOrgId': this.$store.state.user.id === 1 ? 0 : this.$store.state.user.bdOrgId // 超级管理员可以看全部
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              for (let i = 0; i < data.list.length; i++) {
                let obj = {}
                this.$set(obj, 'value', data.list[0].count)
                this.$set(obj, 'name', data.list[0].name)
                this.saleGoodsTypeData.push(obj)
              }
              console.log(this.saleGoodsTypeData)
              this.initSaleGoodsTypeTodayChartPie()
              this.saleTodayLoading = false
            } else {
              this.saleGoodsTypeData = []
              this.initSaleGoodsTypeTodayChartPie()
              this.saleTodayLoading = false
            }
          })
        })
      },
      // 当天签到种类占比饼状图
      initSignTodayChartPie () {
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            x: 'left',
            data: this.signTypeName
          },
          toolbox: {
            feature: {
              saveAsImage: { }
            }
          },
          series: [
            {
              name: '签到情况',
              type: 'pie',
              selectedMode: 'single',
              radius: [0, '50%'],
              data: this.signTypeData
            }
          ]
        }
        if (this.signTypeData.length !== 0) {
          this.signTodayChartPie = echarts.init(document.getElementById('classSignFormChartBar'))
          this.signTodayChartPie.setOption(option)
          window.addEventListener('resize', () => {
            this.signTodayChartPie.resize()
          })
        } else {
          // 以下是暂无数据显示样式(样式根据本身需求进行调整)
          const html = '<div><span style="position: absolute;top: 60%;margin-left: 10%;color:#868686; font-size: 20px;">暂无数据</span></div>'
          document.getElementById('classSignFormChartBar').innerHTML = html
          document.getElementById('classSignFormChartBar').removeAttribute('_echarts_instance_')
        }
      },
      // 当天课程种类数量占比饼状图
      initClassTypeTodayChartPie () {
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            x: 'left',
            data: this.classTypeData
          },
          toolbox: {
            feature: {
              saveAsImage: { }
            }
          },
          series: [
            {
              name: '课程种类',
              type: 'pie',
              selectedMode: 'single',
              radius: [0, '50%'],
              data: this.classTypeData
            }
          ]
        }
        if (this.classTypeData.length !== 0) {
          this.classTypeTodayChartPie = echarts.init(document.getElementById('classSignFormChartBar2'))
          this.classTypeTodayChartPie.setOption(option)
          window.addEventListener('resize', () => {
            this.classTypeTodayChartPie.resize()
          })
        } else {
          // 以下是暂无数据显示样式(样式根据本身需求进行调整)
          const html = '<div><span style="position: absolute;top: 60%;margin-left: 10%;color:#868686; font-size: 20px;">暂无数据</span></div>'
          document.getElementById('classSignFormChartBar2').innerHTML = html
          document.getElementById('classSignFormChartBar2').removeAttribute('_echarts_instance_')
        }
      },
      // 当天课程种类数量占比饼状图
      initSaleGoodsTypeTodayChartPie () {
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            x: 'left',
            data: this.saleGoodsTypeData
          },
          toolbox: {
            feature: {
              saveAsImage: { }
            }
          },
          series: [
            {
              name: '销售商品种类',
              type: 'pie',
              selectedMode: 'single',
              radius: [0, '50%'],
              data: this.saleGoodsTypeData
            }
          ]
        }
        if (this.saleGoodsTypeData.length !== 0) {
          this.saleTodayChartPie = echarts.init(document.getElementById('classSignFormChartBar3'))
          this.saleTodayChartPie.setOption(option)
          window.addEventListener('resize', () => {
            this.saleTodayChartPie.resize()
          })
        } else {
          // 以下是暂无数据显示样式(样式根据本身需求进行调整)
          const html = '<div><span style="position: absolute;top: 60%;margin-left: 10%;color:#868686; font-size: 20px;">暂无数据</span></div>'
          document.getElementById('classSignFormChartBar3').innerHTML = html
          document.getElementById('classSignFormChartBar3').removeAttribute('_echarts_instance_')
        }
      },
      // 刷新
      refresh () {
        this.getStudentAddNum()
        this.getClassBuyAddNum()
        this.getTeacherTodayNum()
        this.getStudentTodayNum()
        this.getSignNum()
        this.getClassTypeTodayNum()
        this.getSaleTodayNum()
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

