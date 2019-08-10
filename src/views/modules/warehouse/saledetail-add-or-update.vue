<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="80px">
      <el-form-item label="商品" prop="wdGoodsId">
        <el-select v-model="dataForm.wdGoodsId" clearable filterable placeholder="商品" style="width: 300px">
          <el-option
            v-for="item in goodsList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    <el-form-item label="数量" prop="qty">
      <el-input-number v-model="dataForm.qty" placeholder="数量" :min="1" :step="1" @change="changeTotalPrice"></el-input-number>
    </el-form-item>
    <el-form-item label="销售价" prop="price">
      <el-input-number v-model="dataForm.price" placeholder="销售价" :min="1" :step="1" :precision="2" @change="changeTotalPrice"></el-input-number>
    </el-form-item>
    <el-form-item label="总价" prop="totalPrice">
      <el-input-number v-model="dataForm.totalPrice" placeholder="总价" :min="1" :step="1" :precision="2" :disabled="true"></el-input-number>
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
          wdGoodsTypeId: '',
          wdGoodsModelId: '',
          qty: '',
          price: '',
          totalPrice: '',
          bdOrgId: '',
          createUserId: '',
          createTime: '',
          remark: ''
        },
        dataRule: {
          wdGoodsId: [
            { required: true, message: '商品不能为空', trigger: 'blur' }
          ],
          qty: [
            { required: true, message: '数量不能为空', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '销售价不能为空', trigger: 'blur' }
          ],
          totalPrice: [
            { required: true, message: '总价不能为空', trigger: 'blur' }
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
              url: this.$http.adornUrl(`/warehouse/saledetail/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.wdGoodsId = data.saleDetail.wdGoodsId
                this.dataForm.wdGoodsTypeId = data.saleDetail.wdGoodsTypeId
                this.dataForm.wdGoodsModelId = data.saleDetail.wdGoodsModelId
                this.dataForm.num = data.saleDetail.qty
                this.dataForm.price = data.saleDetail.price
                this.dataForm.totalPrice = data.saleDetail.totalPrice
                this.dataForm.bdOrgId = data.saleDetail.bdOrgId
                this.dataForm.createUserId = data.saleDetail.createUserId
                this.dataForm.createTime = data.saleDetail.createTime
                this.dataForm.remark = data.saleDetail.remark
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            let isLock = 0
            this.$http({
              url: this.$http.adornUrl(`/warehouse/goodsbook/info/${this.dataForm.wdGoodsId}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              isLock = data.goodsBook.isLock
            })
            if (isLock === 0) {
              let wdGoodsTypeId = ''
              let wdGoodsModelId = ''
              for (let i = 0; i < this.goodsList.length; i++) {
                let item = this.goodsList[i]
                if (item.id === this.dataForm.wdGoodsId) {
                  wdGoodsTypeId = item.wdGoodsTypeId
                  wdGoodsModelId = item.wdGoodsModelId
                  break
                }
              }
              this.$http({
                url: this.$http.adornUrl(`/warehouse/saledetail/${!this.dataForm.id ? 'save' : 'update'}`),
                method: 'post',
                data: this.$http.adornData({
                  'id': this.dataForm.id || undefined,
                  'wdGoodsId': this.dataForm.wdGoodsId,
                  'wdGoodsTypeId': wdGoodsTypeId,
                  'wdGoodsModelId': wdGoodsModelId,
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
      changeTotalPrice () {
        if (this.dataForm.qty && this.dataForm.price) {
          this.dataForm.totalPrice = this.dataForm.qty * this.dataForm.price
        }
      }
    }
  }
</script>
