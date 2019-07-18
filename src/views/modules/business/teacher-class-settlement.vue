<template>
    <el-dialog
      title="课程结算"
      :close-on-click-modal="false"
      :visible.sync="visible">
      <div style="text-align: center;margin-bottom: 10px">
        <el-radio-group v-model="dataForm.isSettlement" @change="radioChange">
          <el-radio :label="0">未结算</el-radio>
          <el-radio :label="1">已结算</el-radio>
        </el-radio-group>
      </div>
      <div style="text-align: right;margin-bottom: 10px">
        <el-button type="primary" @click="setSettlement()" :disabled="dataListSelections.length <= 0">{{multiButtonText}}</el-button>
      </div>
      <div>
        <el-table
          :data="dataList"
          border
          stripe
          show-summary
          :summary-method="getSummaries"
          @selection-change="selectionChangeHandle"
          v-loading="dataListLoading"
          style="width: 100%;">
          <el-table-column
            type="selection"
            header-align="center"
            align="center"
            width="80">
          </el-table-column>
          <el-table-column
            prop="id"
            header-align="center"
            align="center"
            width="50"
            label="id">
          </el-table-column>
          <el-table-column
            prop="className"
            header-align="center"
            align="center"
            label="课程">
          </el-table-column>
          <el-table-column
            prop="studentName"
            header-align="center"
            align="center"
            label="学员">
          </el-table-column>
          <el-table-column
            prop="num"
            header-align="center"
            align="center"
            label="课时">
          </el-table-column>
          <el-table-column
            prop="remainNum"
            header-align="center"
            align="center"
            label="剩余课时">
          </el-table-column>
          <el-table-column
            v-if="!modifyTimeColVisible"
            prop="modifyTime"
            header-align="center"
            align="center"
            label="结算时间">
          </el-table-column>
          <el-table-column
            fixed="right"
            header-align="center"
            width="150"
            label="操作">
            <template slot-scope="scope">
              <div style="text-align: center"><el-button size="mini" type="primary" @click="setSettlement(scope.row.id)">{{buttonText}}</el-button></div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="sizeChangeHandle"
          @current-change="currentChangeHandle"
          :current-page="pageIndex"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="totalPage"
          layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </el-dialog>
</template>

<script>
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
        teacherId: 0,
        dataList: [],
        dataListLoading: false,
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListSelections: [],
        modifyTimeColVisible: true,
        multiButtonText: '批量结算',
        buttonText: '结算'
      }
    },
    methods: {
      init (id) {
        this.teacherId = id
        this.visible = true
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/teacherclasssettlement/listTeacherClassSettlement'),
          method: 'post',
          data: this.$http.adornData({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'bdTeacherId': this.teacherId,
            'isSettlement': this.dataForm.isSettlement
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
          this.multiButtonText = '批量结算'
          this.buttonText = '结算'
        } else {
          this.multiButtonText = '批量取消结算'
          this.buttonText = '取消结算'
        }
        this.init(this.teacherId)
      },
      getSummaries (param) {
        const { columns, data } = param
        const sums = []
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '总计'
          } else if (index === 4 || index === 5) {
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
      // 设置结算或取消结算
      setSettlement (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[ ${id ? this.buttonText : this.multiButtonText} ]操作?`, '提示', {
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
              this.init(this.teacherId)
            } else {
              this.$message.error(data.msg)
            }
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
