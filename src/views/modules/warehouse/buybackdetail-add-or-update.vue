<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="商品" prop="wdGoodsId">
      <el-select v-model="dataForm.wdGoodsId" clearable filterable placeholder="商品" style="width: 300px" :disabled="true">
        <el-option
          v-for="item in goodsList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="商品类型" prop="wdGoodsTypeId">
      <el-select v-model="dataForm.wdGoodsTypeId" clearable filterable placeholder="商品类型" :disabled="true">
        <el-option
          v-for="item in typeList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="商品型号" prop="wdGoodsModelId">
      <el-select v-model="dataForm.wdGoodsModelId" clearable filterable placeholder="商品型号" :disabled="true">
        <el-option
          v-for="item in modelList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="供应商" prop="wdSupplierId">
      <el-select v-model="dataForm.wdSupplierId" clearable filterable placeholder="供应商" :disabled="true">
        <el-option
          v-for="item in supplierList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="退货数量" prop="qty">
      <el-input-number v-model="dataForm.qty" placeholder="退货数量" :step="1" :min="1" :max="dataForm.buyQty - dataForm.backQty + dataForm.qty"></el-input-number>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="创建时间，自动生成，无需填写" :disabled="true"></el-input>
    </el-form-item>
    <el-form-item label="退货备注" prop="remark">
      <el-input v-model="dataForm.remark" placeholder="退货备注"></el-input>
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
          wdGoodsModelId: '',
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
        modelList: [],
        supplierList: [],
        dataRule: {
          qty: [
            { required: true, message: '退货数量不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.getGoodsList()
        this.getTypeList()
        this.getModelList()
        this.getSupplierList()
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
                this.dataForm.wdGoodsModelId = data.buyBackDetail.wdGoodsModelId
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
      },
      getGoodsList () {
        this.$http({
          url: this.$http.adornUrl('/warehouse/goods/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.goodsList = data.page.list
        })
      },
      // 获取商品类型ID
      getTypeList () {
        this.$http({
          url: this.$http.adornUrl('/warehouse/goodstype/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.typeList = data.page.list
        })
      },
      // 获取商品型号ID
      getModelList () {
        this.$http({
          url: this.$http.adornUrl('/warehouse/goodsmodel/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.modelList = data.page.list
        })
      },
      getSupplierList () {
        this.$http({
          url: this.$http.adornUrl('/warehouse/supplier/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.supplierList = data.page.list
        })
      }
    }
  }
</script>
