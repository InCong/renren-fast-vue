<template>
  <el-dialog
    :title="'排课—【' + title + '】'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <div style="text-align: center;margin-bottom: 30px">
      <el-radio-group v-model="radioDay">
        <el-radio-button v-for="item in dayList" :label="item.substring(5)" style="margin-right: 20px"></el-radio-button>
      </el-radio-group>
    </div>
    <div style="text-align: center;margin-bottom: 30px">
      <el-time-select
        placeholder="起始时间"
        v-model="startTime"
        :picker-options="{
          start: '06:00',
          step: '00:15',
          end: '23:00',
          maxTime: endTime
        }">
      </el-time-select>
      <el-time-select
        placeholder="结束时间"
        v-model="endTime"
        :picker-options="{
          start: '06:00',
          step: '00:15',
          end: '23:00',
          minTime: startTime
        }">
      </el-time-select>
    </div>
    <div style="text-align: center;margin-bottom: 30px">
      <el-radio-group v-model="radioClassWay">
        <el-radio-button v-for="item in classWayList" :label="item.name" style="margin-right: 20px"></el-radio-button>
      </el-radio-group>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-radio v-model="radioType" label="1">单次</el-radio>
      <el-radio v-model="radioType" label="2">循环</el-radio>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        // 以下是基本变量
        visible: false,
        bdTeacherId: null,
        bdStudentId: null,
        title: '',
        startTime: '',
        endTime: '',
        dayList: [],
        classWayList: [],
        // 以下是单选的变量
        radioDay: '',
        radioClassWay: '',
        radioType: '1'
      }
    },
    methods: {
      init (bdTeacherId, bdStudentId, title, dayList) {
        this.visible = true
        this.bdTeacherId = bdTeacherId
        this.bdStudentId = bdStudentId
        this.title = title
        this.dayList = dayList
        this.$http({
          url: this.$http.adornUrl('/basic/classway/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 0,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.classWayList = data.page.list
        })
      }
    }
  }
</script>

<style>
  .el-radio-button__inner {
    background: antiquewhite;
    border-left:1px;
  }

</style>
