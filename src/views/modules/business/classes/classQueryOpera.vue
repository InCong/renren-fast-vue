<template>
  <el-dialog
    :title="className"
    :visible.sync="visible"
    width="40%"
    center
  >
    <div style="text-align: center;margin-bottom: 20px">
      <el-card class="classInfo">
        <div slot="header">
          <span style="color: ghostwhite;font-weight: 900">课程信息</span>
        </div>
        <div style="text-align: left;margin-bottom: 20px">
          <span>上课时间：{{ arrangeDate }} {{ startTime }} 至 {{ endTime }}</span>
        </div>
        <div style="text-align: left;margin-bottom: 20px">
          <span>上课方式：{{ classWay }}</span>
        </div>
        <div style="text-align: left">
          <span>学员：{{ studentName }}</span>
        </div>
      </el-card>
    </div>
    <div style="text-align: center;margin-bottom: 20px">
      <el-card class="studentInfo">
        <div slot="header">
          <span style="color: ghostwhite;font-weight: 900">学员签到情况</span>
        </div>
        <div>
          <el-table
            :data="studentList"
            border
            stripe
          >
            <el-table-column
              prop="bdStudentId"
              header-align="center"
              align="center"
              width="50"
              label="ID"
            />
            <el-table-column
              prop="studentName"
              header-align="center"
              align="center"
              label="名称"
            />
            <el-table-column
              prop="signType"
              header-align="center"
              align="center"
              label="签到类型"
            >
              <template slot-scope="scope">
                <el-tag v-if="scope.row.signType === 1" size="small">
                  微信
                </el-tag>
                <el-tag v-if="scope.row.signType === 2" size="small">
                  手工
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="signTime"
              header-align="center"
              align="center"
              label="签到时间"
            />
          </el-table>
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        bdClassesId: 0,
        className: '',
        startTime: '',
        endTime: '',
        arrangeDate: '',
        classWay: '',
        studentName: '',
        studentList: []
      }
    },
    methods: {
      init (bdClassesId, className, startTime, endTime, arrangeDate, classWay, studentName) {
        this.visible = true
        this.bdClassesId = bdClassesId
        this.className = className
        this.startTime = startTime
        this.endTime = endTime
        this.arrangeDate = arrangeDate
        this.classWay = classWay
        this.studentName = studentName
        this.$http({
          url: this.$http.adornUrl('/business/studentclassarrange/listStudent'),
          method: 'post',
          data: this.$http.adornData({
            'bdClassesId': this.bdClassesId,
            'arrangeDate': this.arrangeDate,
            'startTime': this.startTime,
            'endTime': this.endTime
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.studentList = data.list
          } else {
            this.studentList = []
          }
        })
      }
    }
  }
</script>

<style>
  .classInfo .el-card__header {
    background: #00b7ee;
  }

  .studentInfo .el-card__header {
    background: #45c2b5;
  }
</style>
