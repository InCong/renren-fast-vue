<template>
  <el-dialog
    title="课时信息"
    width="60%"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <div style="margin-bottom: 10px">
      <el-button type="primary" @click="buyClass()">购买课程</el-button>
    </div>
    <div class="mod-config">
      <el-table
        :data="dataList"
        border
        stripe
        v-loading="dataListLoading"
        style="width: 100%;">
        <el-table-column
          prop="id"
          header-align="center"
          align="center"
          width="50"
          label="ID">
        </el-table-column>
        <el-table-column
          prop="className"
          header-align="center"
          align="center"
          label="课程">
        </el-table-column>
        <el-table-column
          prop="teacherName"
          header-align="center"
          align="center"
          show-overflow-tooltip
          label="任课教师">
        </el-table-column>
        <el-table-column
          prop="price"
          header-align="center"
          align="center"
          label="单价(元/课时)">
        </el-table-column>
        <el-table-column
          prop="num"
          header-align="center"
          align="center"
          width="100"
          label="课时">
        </el-table-column>
        <el-table-column
          prop="remainNum"
          header-align="center"
          align="center"
          width="100"
          label="剩余课时">
        </el-table-column>
        <el-table-column
          prop="createTime"
          header-align="center"
          align="center"
          label="创建时间">
        </el-table-column>
        <el-table-column
          prop="remark"
          header-align="center"
          align="center"
          show-overflow-tooltip
          label="备注">
        </el-table-column>
        <el-table-column
          fixed="right"
          header-align="center"
          align="center"
          width="150"
          label="操作">
          <template slot-scope="scope">
            <el-row style="margin-bottom:10px">
              <el-col :span="12"><el-button size="mini" @click="updateClass(scope.row.id, scope.row.teacherName, scope.row.className, scope.row.bdClassesId, scope.row.bdTeacherId)">修改</el-button></el-col>
              <el-col :span="12"><el-button size="mini" type="danger" @click="deleteHandle(scope.row.id)">删除</el-button></el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
        :hide-on-single-page="true"
        :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="totalPage"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 10px;text-align: right">
      </el-pagination>
      <!-- 弹窗，购买课时 -->
      <student-buy-classes v-if="studentBuyClassesVisible" ref="studentBuyClasses" @refreshDataList="init(studentId)"></student-buy-classes>
      <!-- 弹窗，修改课时 -->
      <student-update-classes-num v-if="studentUpdateClassesNumVisible" ref="studentUpdateClassesNum" @refreshDataList="init(studentId)"></student-update-classes-num>
    </div>
  </el-dialog>
</template>

<script>
  import StudentBuyClasses from './student-buy-classes'
  import StudentUpdateClassesNum from './student-update-classes-num'
  export default {
    components: {StudentBuyClasses, StudentUpdateClassesNum},
    data () {
      return {
        studentId: 0,
        visible: false,
        dataList: [],
        dataListLoading: false,
        pageIndex: 1,
        pageSize: 100,
        totalPage: 0,
        studentBuyClassesVisible: false,
        studentUpdateClassesNumVisible: false
      }
    },
    methods: {
      init (id) {
        this.studentId = id
        this.visible = true
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/classesstudent/studentClassesList'),
          method: 'post',
          data: this.$http.adornData({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'studentId': this.studentId
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
      // 删除
      deleteHandle (id) {
        var ids = [id]
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/business/classesstudent/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.init(this.studentId)
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        })
      },
      // 购买课时
      buyClass: function () {
        this.studentBuyClassesVisible = true
        this.$nextTick(() => {
          this.$refs.studentBuyClasses.init(this.studentId)
        })
      },
      // 更新课时
      updateClass: function (id, teacherName, className, bdClassesId, bdTeacherId) {
        this.studentUpdateClassesNumVisible = true
        this.$nextTick(() => {
          this.$refs.studentUpdateClassesNum.init(id, teacherName, className, bdClassesId, bdTeacherId)
        })
      }
    }
  }
</script>

<style scoped>

</style>
