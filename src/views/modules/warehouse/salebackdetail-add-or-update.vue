<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
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
      <el-form-item label="商品种类" prop="wdGoodsTypeId">
        <el-select v-model="dataForm.wdGoodsTypeId" clearable filterable placeholder="商品种类" :disabled="true">
          <el-option
            v-for="item in typeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="退货数量" prop="qty">
        <el-input-number v-model="dataForm.qty" placeholder="退货数量" :min="1" :step="1" :max="dataForm.saleQty - dataForm.backQty + dataForm.qty" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-input v-model="dataForm.createTime" placeholder="创建时间，自动生成，无需填写" :disabled="true" />
      </el-form-item>
      <el-form-item label="退货备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="退货备注" />
      </el-form-item>
    </el-form>
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
        dataForm: {
          id: 0,
          wdGoodsId: '',
          wdGoodsTypeId: '',
          wdSaleDetailId: '',
          qty: '',
          bdOrgId: '',
          createUserId: '',
          createTime: '',
          remark: '',
          saleQty: 0,
          backQty: 0
        },
        goodsList: [],
        typeList: [],
        dataRule: {
          qty: [
            { required: true, message: '退货数量不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id, goodsList, typeList) {
        this.dataForm.id = id || 0
        this.visible = true
        this.goodsList = goodsList
        this.typeList = typeList
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/warehouse/salebackdetail/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.wdGoodsId = data.saleBackDetail.wdGoodsId
                this.dataForm.wdGoodsTypeId = data.saleBackDetail.wdGoodsTypeId
                this.dataForm.wdSaleDetailId = data.saleBackDetail.wdSaleDetailId
                this.dataForm.qty = data.saleBackDetail.qty
                this.dataForm.createTime = data.saleBackDetail.createTime
                this.dataForm.remark = data.saleBackDetail.remark
                this.$http({
                  url: this.$http.adornUrl(`/warehouse/saleDetail/info/${this.dataForm.wdSaleDetailId}`),
                  method: 'get',
                  params: this.$http.adornParams()
                }).then(({data}) => {
                  if (data && data.code === 0) {
                    this.dataForm.saleQty = data.saleDetail.qty
                    this.dataForm.backQty = data.saleDetail.backQty
                  }
                })
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
              url: this.$http.adornUrl(`/warehouse/salebackdetail/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'qty': this.dataForm.qty,
                'remark': this.dataForm.remark
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
          }
        })
      }
    }
  }
</script>
