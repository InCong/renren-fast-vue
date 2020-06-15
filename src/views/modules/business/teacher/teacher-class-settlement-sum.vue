<template>
  <el-dialog
    title="课程结算概况"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <div style="text-align: center;margin-bottom: 10px">
      <el-button
        type="primary"
        style="margin-right: 10px"
        @click="lastWeekClick"
      >
        上一月
      </el-button>
      <el-date-picker
        v-model="rangeDate"
        type="daterange"
        align="center"
        range-separator="——"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        :default-time="['00:00:00', '23:59:59']"
        :picker-options="pickerOptions"
        :clearable="false"
        @change="getSumList"
      />
      <el-button
        type="primary"
        style="margin-left: 10px"
        @click="nextWeekClick"
      >
        下一月
      </el-button>
    </div>
    <div>
      <el-table
        v-loading="dataListLoading"
        :data="dataList"
        border
        stripe
        show-summary
        :summary-method="getSummaries"
        style="width: 100%;"
      >
        <el-table-column
          prop="bdClassesId"
          header-align="center"
          align="center"
          width="50"
          label="课程ID"
        />
        <el-table-column
          prop="className"
          header-align="center"
          align="center"
          label="课程"
        />
        <el-table-column
          prop="totalCount"
          header-align="center"
          align="center"
          label="已排课数量"
        />
        <el-table-column
          prop="unSignCount"
          header-align="center"
          align="center"
          label="未签到数量"
        />
        <el-table-column
          prop="unSettlementCount"
          header-align="center"
          align="center"
          label="已签到未结算数量"
        />
        <el-table-column
          prop="settlementCount"
          header-align="center"
          align="center"
          label="已结算数量"
        />
        <el-table-column
          prop="settlementAmount"
          header-align="center"
          align="center"
          label="已结算金额"
        />
        <el-table-column
          fixed="right"
          header-align="center"
          width="100"
          label="操作"
        >
          <template slot-scope="scope">
            <div style="text-align: center">
              <el-button size="mini" type="primary" @click="settlementManage(scope.row.bdClassesId)">
                结算管理
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 弹窗，课程结算 -->
      <teacher-class-settlement v-if="teacherClassSettlementVisible" ref="teacherClassSettlement" @refreshList="getSumList" />
    </div>
  </el-dialog>
</template>

<script>
  import moment from 'moment'
  import TeacherClassSettlement from './teacher-class-settlement'
  export default {
    components: {
      TeacherClassSettlement
    },
    data () {
      return {
        visible: false,
        bdTeacherId: '',
        dataList: [],
        dataListLoading: false,
        teacherClassSettlementVisible: false,
        // 以下几个都是范围日期控件的参数
        rangeDate: [moment().startOf('month').format('YYYY-MM-D'), moment().endOf('month').format('YYYY-MM-D')],
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
        }
      }
    },
    methods: {
      init (bdTeacherId) {
        this.visible = true
        this.bdTeacherId = bdTeacherId
        this.getSumList()
      },
      getSumList () {
        this.dataListLoading = true
        let startDate = this.rangeDate[0]
        let endDate = this.rangeDate[1]
        this.$http({
          url: this.$http.adornUrl('/business/teacherclasssettlement/listTeacherClassSettlementSum'),
          method: 'post',
          data: this.$http.adornData({
            'bdTeacherId': this.bdTeacherId,
            'startDate': startDate,
            'endDate': endDate
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dataList = data.list
          } else {
            this.dataList = []
          }
          this.dataListLoading = false
        })
      },
      settlementManage (bdClassesId) {
        this.teacherClassSettlementVisible = true
        this.$nextTick(() => {
          this.$refs.teacherClassSettlement.init(bdClassesId, this.bdTeacherId)
        })
      },
      getSummaries (param) {
        const { columns, data } = param
        const sums = []
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '总计'
          } else if (index === 2 || index === 3 || index === 4 || index === 5 || index === 6) {
            const values = data.map(item => Number(item[column.property]))
            if (!values.every(value => isNaN(value))) {
              sums[index] = values.reduce((prev, curr) => {
                const value = Number(curr)
                if (!isNaN(value)) {
                  return prev + curr
                } else {
                  return prev
                }
              }, 0)
            } else {
              sums[index] = 'N/A'
            }
          } else {
            sums[index] = ''
          }
        })
        return sums
      },
      // 快速选择上一周
      lastWeekClick () {
        let startDate = this.rangeDate[0]
        let endDate = this.rangeDate[1]
        this.rangeDate = [moment(startDate).startOf('month').subtract(1, 'month').format('YYYY-MM-D'), moment(endDate).endOf('month').subtract(1, 'month').format('YYYY-MM-D')]
        this.getSumList()
      },
      // 快速选择下一周
      nextWeekClick () {
        let startDate = this.rangeDate[0]
        let endDate = this.rangeDate[1]
        this.rangeDate = [moment(startDate).startOf('month').add(1, 'month').format('YYYY-MM-D'), moment(endDate).endOf('month').add(1, 'month').format('YYYY-MM-D')]
        this.getSumList()
      }
    }
  }
</script>

<style scoped>

</style>
