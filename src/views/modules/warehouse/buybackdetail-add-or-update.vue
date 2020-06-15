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
      <el-form-item label="供应商" prop="wdSupplierId">
        <el-select v-model="dataForm.wdSupplierId" clearable filterable placeholder="供应商" :disabled="true">
          <el-option
            v-for="item in supplierList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="退货数量" prop="qty">
        <el-input-number v-model="dataForm.qty" placeholder="退货数量" :step="1" :min="1" :max="dataForm.buyQty - dataForm.backQty + dataForm.qty" />
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
          wdSupplierId: '',
          wdBuyDetailId: '',
          qty: 0,
          createTime: '',
          remark: '',
          buyQty: 0,
          backQty: 0
        },
        goodsList: [],
        typeList: [],
        supplierList: [],
        dataRule: {
          qty: [
            { required: true, message: '退货数量不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id, goodsList, typeList, supplierList) {
        this.dataForm.id = id || 0
        this.visible = true
        this.goodsList = goodsList
        this.typeList = typeList
        this.supplierList = supplierList
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/warehouse/buybackdetail/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.wdGoodsId = data.buyBackDetail.wdGoodsId
                this.dataForm.wdGoodsTypeId = data.buyBackDetail.wdGoodsTypeId
                this.dataForm.wdSupplierId = data.buyBackDetail.wdSupplierId
                this.dataForm.wdBuyDetailId = data.buyBackDetail.wdBuyDetailId
                this.dataForm.qty = data.buyBackDetail.qty
                this.dataForm.createTime = data.buyBackDetail.createTime
                this.dataForm.remark = data.buyBackDetail.remark
                this.$http({
                  url: this.$http.adornUrl(`/warehouse/buydetail/info/${this.dataForm.wdBuyDetailId}`),
                  method: 'get',
                  params: this.$http.adornParams()
                }).then(({data}) => {
                  if (data && data.code === 0) {
                    this.dataForm.buyQty = data.buyDetail.qty
                    this.dataForm.backQty = data.buyDetail.backQty
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
              url: this.$http.adornUrl(`/warehouse/buybackdetail/${!this.dataForm.id ? 'save' : 'update'}`),
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
