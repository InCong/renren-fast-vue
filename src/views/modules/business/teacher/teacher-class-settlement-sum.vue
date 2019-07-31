<template>
  <el-dialog
    title="课程结算概况"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <div>
      <el-table
        :data="dataList"
        border
        stripe
        show-summary
        :summary-method="getSummaries"
        v-loading="dataListLoading"
        style="width: 100%;">
        <el-table-column
          prop="bdClassesId"
          header-align="center"
          align="center"
          label="课程ID">
        </el-table-column>
        <el-table-column
          prop="className"
          header-align="center"
          align="center"
          label="课程">
        </el-table-column>
        <el-table-column
          prop="unSignCount"
          header-align="center"
          align="center"
          label="未签到数量">
        </el-table-column>
        <el-table-column
          prop="unSettlementCount"
          header-align="center"
          align="center"
          label="已签到未结算数量">
        </el-table-column>
        <el-table-column
          prop="settlementCount"
          header-align="center"
          align="center"
          label="已结算数量">
        </el-table-column>
        <el-table-column
          fixed="right"
          header-align="center"
          width="150"
          label="操作">
          <template slot-scope="scope">
            <div style="text-align: center"><el-button size="mini" type="primary" @click="settlementManage(scope.row.bdClassesId)">结算管理</el-button></div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 弹窗，课程结算 -->
      <teacher-class-settlement v-if="teacherClassSettlementVisible" ref="teacherClassSettlement" @refreshList="getSumList"></teacher-class-settlement>
    </div>
  </el-dialog>
</template>

<script>
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
        teacherClassSettlementVisible: false
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
        this.$http({
          url: this.$http.adornUrl('/business/teacherclasssettlement/listTeacherClassSettlementSum'),
          method: 'post',
          data: this.$http.adornData({
            'bdTeacherId': this.bdTeacherId
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
          } else if (index === 2 || index === 3 || index === 4) {
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
      }
    }
  }
</script>

<style scoped>

</style>
