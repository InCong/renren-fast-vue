<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '盘点登记'"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="商品" prop="wdGoodsId">
        <el-select v-model="dataForm.wdGoodsId" clearable filterable placeholder="商品" style="width: 300px" :disabled="true">
          <el-option
            v-for="item in goodsList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="静态库存" prop="staticQty">
        <el-input-number v-model="dataForm.staticQty" placeholder="静态库存" :disabled="true" />
      </el-form-item>
      <el-form-item label="盘点数量" prop="qty">
        <el-input-number v-model="dataForm.qty" placeholder="盘点数量" :step="1" :min="0" :disabled="!!dataForm.modifyTime" @change="changeCountQty" />
      </el-form-item>
      <el-form-item label="差异数量" prop="diffQty">
        <el-input-number v-model="dataForm.diffQty" placeholder="差异数量" :disabled="true" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-input v-model="dataForm.createTime" placeholder="创建时间，自动生成，无需填写" :disabled="true" />
      </el-form-item>
      <el-form-item label="登记时间" prop="modifyTime">
        <el-input v-model="dataForm.modifyTime" placeholder="盘点登记时间，自动生成，无需填写" :disabled="true" />
      </el-form-item>
      <el-form-item label="盘点情况" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="盘点情况" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import moment from 'moment'
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          wdGoodsId: '',
          wdGoodsTypeId: '',
          wdGoodsModelId: '',
          staticQty: '',
          qty: '',
          diffQty: '',
          bdOrgId: '',
          createUserId: '',
          createTime: '',
          modifyUserId: '',
          modifyTime: '',
          remark: ''
        },
        dataRule: {
          wdGoodsId: [
            { required: true, message: '商品不能为空', trigger: 'blur' }
          ],
          qty: [
            { required: true, message: '盘点数量不能为空', trigger: 'blur' }
          ],
          diffQty: [
            { required: true, message: '差异数量不能为空', trigger: 'blur' }
          ]
        },
        goodsList: []
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.getGoodsList()
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/warehouse/countdetail/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.wdGoodsId = data.countDetail.wdGoodsId
                this.dataForm.wdGoodsTypeId = data.countDetail.wdGoodsTypeId
                this.dataForm.wdGoodsModelId = data.countDetail.wdGoodsModelId
                this.dataForm.staticQty = data.countDetail.staticQty
                this.dataForm.qty = data.countDetail.qty
                this.dataForm.diffQty = data.countDetail.qty - data.countDetail.staticQty
                this.dataForm.createUserId = data.countDetail.createUserId
                this.dataForm.createTime = data.countDetail.createTime
                this.dataForm.modifyUserId = data.countDetail.modifyUserId
                this.dataForm.modifyTime = data.countDetail.modifyTime
                this.dataForm.remark = data.countDetail.remark
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/warehouse/countdetail/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'qty': this.dataForm.qty,
                'diffQty': this.dataForm.diffQty,
                'modifyUserId': this.dataForm.modifyUserId || this.$store.state.user.id,
                'modifyTime': moment().format('YYYY-MM-DD HH:mm:ss'),
                'remark': this.dataForm.remark
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$http({
                  url: this.$http.adornUrl('/warehouse/goodsbook/update'),
                  method: 'post',
                  data: this.$http.adornData({
                    'wdGoodsId': this.dataForm.wdGoodsId,
                    'isLock': 0,
                    'modifyUserId': this.$store.state.user.id,
                    'modifyTime': moment().format('YYYY-MM-DD HH:mm:ss')
                  })
                }).then(({data}) => {
                  if (data && data.code === 0) {
                    this.$message({
                      message: '盘点完成',
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
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      // 获取商品ID
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
      // 变更盘点数量
      changeCountQty () {
        if (this.dataForm.staticQty && this.dataForm.qty >= 0) {
          this.dataForm.diffQty = this.dataForm.qty - this.dataForm.staticQty
        }
      }
    }
  }
</script>
