<template>
  <el-dialog
    title="选择需要盘点的商品"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="closeDialog">
    <div style="text-align: center">
      <el-transfer
        v-model="currentValue"
        :titles="['待选','已选']"
        :data="goodsList"
        :filterable="true"
        :props="{key:'id',label:'name'}"
        style="text-align: left;display: inline-block">
      </el-transfer>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        currentValue: [],
        goodsList: []
      }
    },
    methods: {
      init () {
        this.visible = true
        this.getGoodsList()
        // 组件看不见时调用，清空数组
        this.over = () => {
          this.currentValue = []
          this.goodsList = []
        }
      },
      dataFormSubmit () {
        this.$http({
          url: this.$http.adornUrl('/warehouse/countdetail/saveCountDetail'),
          method: 'post',
          data: this.$http.adornData({
            'currentValue': this.currentValue
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.$emit('refreshDataList')
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      },
      getGoodsList () {
        this.$http({
          url: this.$http.adornUrl('/warehouse/goods/queryGoodsListForSelect'),
          method: 'get',
          params: this.$http.adornParams({
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.goodsList = data.list
        })
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      }
    }
  }
</script>

<style>
  .el-transfer-panel {
    height: 400px;
    width: 400px;
  }
  .el-transfer-panel__list.is-filterable {
    height: 400px;
  }
  .el-checkbox__label {
    font-size: 16px;
  }
</style>
