<template>
  <el-dialog
    title="课程结算"
    :close-on-click-modal="false"
    :visible.sync="visible"
    append-to-body
    @close="closeDialog"
  >
    <div style="text-align: center;margin-bottom: 10px">
      <el-radio-group v-model="dataForm.isSettlement" style="margin-right: 20px" @change="radioChange">
        <el-radio :label="0">
          未结算
        </el-radio>
        <el-radio :label="1">
          已结算
        </el-radio>
      </el-radio-group>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="——"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :clearable="false"
        :editable="false"
        :picker-options="pickerOptions"
        style="margin-right: 20px"
      />
      <el-button type="primary" @click="getDataList">
        查询
      </el-button>
    </div>
    <div style="text-align: right;margin-bottom: 10px">
      <el-button type="primary" :disabled="dataListSelections.length <= 0" @click="setSettlement()">
        {{ multiButtonText }}
      </el-button>
    </div>
    <div>
      <el-table
        v-loading="dataListLoading"
        :data="dataList"
        border
        stripe
        style="width: 100%;"
        @selection-change="selectionChangeHandle"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />
        <el-table-column
          prop="id"
          header-align="center"
          align="center"
          width="50"
          label="id"
        />
        <el-table-column
          prop="className"
          header-align="center"
          align="center"
          label="课程"
        />
        <el-table-column
          prop="studentName"
          header-align="center"
          align="center"
          label="学员"
        />
        <el-table-column
          prop="arrangeDate"
          header-align="center"
          align="center"
          label="排课日期"
        />
        <el-table-column
          prop="startTime"
          header-align="center"
          align="center"
          label="开始时间"
        />
        <el-table-column
          prop="endTime"
          header-align="center"
          align="center"
          label="结束时间"
        />
        <el-table-column
          prop="signTime"
          header-align="center"
          align="center"
          label="签到时间"
        />
        <el-table-column
          v-if="!modifyTimeColVisible"
          prop="modifyTime"
          header-align="center"
          align="center"
          label="结算时间"
        />
      </el-table>
      <div style="text-align: right;margin-top: 20px">
        <el-pagination
          :current-page="pageIndex"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="totalPage"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="sizeChangeHandle"
          @current-change="currentChangeHandle"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import moment from 'moment'
  export default {
    data () {
      return {
        dataForm: {
          id: '',
          studentName: '',
          className: '',
          num: 0,
          remainNum: 0,
          isSettlement: 0,
          modifyTime: ''
        },
        visible: false,
        bdTeacherId: 0,
        bdClassesId: 0,
        dataList: [],
        dataListLoading: false,
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListSelections: [],
        modifyTimeColVisible: true,
        multiButtonText: '批量结算',
        isModify: false,
        dateRange: [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')],
        choiceDate: '',
        pickerOptions: {
          onPick: ({maxDate, minDate}) => {
            this.choiceDate = minDate.getTime()
            if (maxDate) {
              this.choiceDate = ''
            }
          },
          disabledDate: (time) => {
            if (this.choiceDate != null && this.choiceDate !== '') {
              const one = 30 * 24 * 3600 * 1000
              const minTime = this.choiceDate - one
              const maxTime = this.choiceDate + one
              return time.getTime() < minTime || time.getTime() > maxTime
            }
          }
        }
      }
    },
    methods: {
      init (bdClassesId, bdTeacherId) {
        this.visible = true
        this.bdTeacherId = bdTeacherId
        this.bdClassesId = bdClassesId
        this.getDataList()
        // 组件看不见时调用，刷新汇总数据
        this.over = () => {
          if (this.isModify) {
            this.isModify = false
            this.$emit('refreshList')
          }
        }
      },
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/teacherclasssettlement/listTeacherClassSettlement'),
          method: 'post',
          data: this.$http.adornData({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'bdTeacherId': this.bdTeacherId,
            'bdClassesId': this.bdClassesId,
            'isSettlement': this.dataForm.isSettlement,
            'startDate': moment(this.dateRange[0]).format('YYYY-MM-DD'),
            'endDate': moment(this.dateRange[1]).format('YYYY-MM-DD')
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dataList = data.page.records
            this.totalPage = data.page.total
          } else {
            this.dataList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getDataList()
      },
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },
      radioChange () {
        this.modifyTimeColVisible = this.dataForm.isSettlement === 0
        if (this.dataForm.isSettlement === 0) {
          this.multiButtonText = '结算'
        } else {
          this.multiButtonText = '取消结算'
        }
        this.init(this.bdClassesId, this.bdTeacherId)
      },
      // 设置结算或取消结算
      setSettlement (id) {
        const ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定进行[ ${this.multiButtonText} ]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/business/teacherclasssettlement/updateSettlement'),
            method: 'post',
            data: this.$http.adornData({
              'ids': ids,
              'isSettlement': this.dataForm.isSettlement === 0 ? 1 : 0
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500
              })
              this.init(this.bdClassesId, this.bdTeacherId)
              this.isModify = true
            } else {
              this.$message.error(data.msg)
            }
          })
        })
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      }
    }
  }
</script>

<style scoped>

</style>
