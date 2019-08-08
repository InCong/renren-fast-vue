<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="商品" prop="wdGoodsId">
      <el-select v-model="dataForm.wdGoodsId" clearable filterable placeholder="商品">
        <el-option
          v-for="item in goodsList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="供应商" prop="wdSupplierId">
      <el-select v-model="dataForm.wdSupplierId" clearable filterable placeholder="供应商">
        <el-option
          v-for="item in supplierList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="数量" prop="qty">
      <el-input-number v-model="dataForm.qty" placeholder="数量" :min="1" :step="1"></el-input-number>
    </el-form-item>
    <el-form-item label="进货单价" prop="price">
      <el-input-number v-model="dataForm.price" placeholder="进货单价" :min="1" :step="10" :precision="2"></el-input-number>
    </el-form-item>
    <el-form-item label="总价" prop="totalPrice">
      <el-input v-model="dataForm.totalPrice" placeholder="总价" :disabled="true"></el-input>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="创建时间，自动生成，无需填写" :disabled="true"></el-input>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model="dataForm.remark" placeholder="备注"></el-input>
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
          wdSupplierId: '',
          qty: '',
          price: '',
          totalPrice: '',
          createUserId: '',
          createTime: '',
          remark: ''
        },
        dataRule: {
          wdGoodsId: [
            { required: true, message: '商品不能为空', trigger: 'blur' }
          ],
          wdSupplierId: [
            { required: true, message: '供应商不能为空', trigger: 'blur' }
          ],
          qty: [
            { required: true, message: '数量不能为空', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '进货单价不能为空', trigger: 'blur' }
          ],
          totalPrice: [
            { required: true, message: '总价不能为空', trigger: 'blur' }
          ]
        },
        goodsList: [],
        supplierList: []
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.getGoodsList()
        this.getSupplierList()
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/warehouse/buydetail/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.wdGoodsId = data.buydetail.wdGoodsId
                this.dataForm.wdSupplierId = data.buydetail.wdSupplierId
                this.dataForm.qty = data.buydetail.qty
                this.dataForm.price = data.buydetail.price
                this.dataForm.totalPrice = data.buydetail.totalPrice
                this.dataForm.createUserId = data.buydetail.createUserId
                this.dataForm.createTime = data.buydetail.createTime
                this.dataForm.remark = data.buydetail.remark
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            let wdGoodsTypeId = ''
            for (let i = 0; i < this.goodsList.length; i++) {
              let item = this.goodsList[i]
              if (item.id === this.dataForm.wdGoodsId) {
                wdGoodsTypeId = item.wdGoodsTypeId
                break
              }
            }

            this.$http({
              url: this.$http.adornUrl(`/warehouse/buydetail/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'wdGoodsId': this.dataForm.wdGoodsId,
                'wdSupplierId': this.dataForm.wdSupplierId,
                'wdGoodsTypeId': wdGoodsTypeId,
                'qty': this.dataForm.qty,
                'price': this.dataForm.price,
                'totalPrice': this.dataForm.totalPrice,
                'bdOrgId': this.dataForm.bdOrgId || this.$store.state.user.bdOrgId,
                'createUserId': this.dataForm.createUserId || this.$store.state.user.id,
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
      // 获取商品ID
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
      // 获取供应商ID
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
