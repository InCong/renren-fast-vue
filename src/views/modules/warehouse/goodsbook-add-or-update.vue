<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="最新进货价" prop="inPrice">
      <el-input v-model="dataForm.inPrice" placeholder="最新进货价"></el-input>
    </el-form-item>
    <el-form-item label="最新售价" prop="salePrice">
      <el-input v-model="dataForm.salePrice" placeholder="最新售价"></el-input>
    </el-form-item>
    <el-form-item label="静态库存" prop="staticQty">
      <el-input v-model="dataForm.staticQty" placeholder="静态库存"></el-input>
    </el-form-item>
    <el-form-item label="动态库存" prop="dynamicQty">
      <el-input v-model="dataForm.dynamicQty" placeholder="动态库存"></el-input>
    </el-form-item>
    <el-form-item label="所属机构ID" prop="bdOrgId">
      <el-input v-model="dataForm.bdOrgId" placeholder="所属机构ID"></el-input>
    </el-form-item>
    <el-form-item label="是否锁定，0-否，1-是，盘点时会锁定" prop="isLock">
      <el-input v-model="dataForm.isLock" placeholder="是否锁定，0-否，1-是，盘点时会锁定"></el-input>
    </el-form-item>
    <el-form-item label="修改时间" prop="modifyTime">
      <el-input v-model="dataForm.modifyTime" placeholder="修改时间"></el-input>
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
          wdGoodsId: 0,
          inPrice: '',
          salePrice: '',
          staticQty: '',
          dynamicQty: '',
          bdOrgId: '',
          isLock: '',
          modifyTime: ''
        },
        dataRule: {
          inPrice: [
            { required: true, message: '最新进货价不能为空', trigger: 'blur' }
          ],
          salePrice: [
            { required: true, message: '最新售价不能为空', trigger: 'blur' }
          ],
          staticQty: [
            { required: true, message: '静态库存不能为空', trigger: 'blur' }
          ],
          dynamicQty: [
            { required: true, message: '动态库存不能为空', trigger: 'blur' }
          ],
          bdOrgId: [
            { required: true, message: '所属机构ID不能为空', trigger: 'blur' }
          ],
          isLock: [
            { required: true, message: '是否锁定，0-否，1-是，盘点时会锁定不能为空', trigger: 'blur' }
          ],
          modifyTime: [
            { required: true, message: '修改时间不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.wdGoodsId = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.wdGoodsId) {
            this.$http({
              url: this.$http.adornUrl(`/warehouse/goodsbook/info/${this.dataForm.wdGoodsId}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.inPrice = data.goodsbook.inPrice
                this.dataForm.salePrice = data.goodsbook.salePrice
                this.dataForm.staticQty = data.goodsbook.staticQty
                this.dataForm.dynamicQty = data.goodsbook.dynamicQty
                this.dataForm.bdOrgId = data.goodsbook.bdOrgId
                this.dataForm.isLock = data.goodsbook.isLock
                this.dataForm.modifyTime = data.goodsbook.modifyTime
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
              url: this.$http.adornUrl(`/warehouse/goodsbook/${!this.dataForm.wdGoodsId ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'wdGoodsId': this.dataForm.wdGoodsId || undefined,
                'inPrice': this.dataForm.inPrice,
                'salePrice': this.dataForm.salePrice,
                'staticQty': this.dataForm.staticQty,
                'dynamicQty': this.dataForm.dynamicQty,
                'bdOrgId': this.dataForm.bdOrgId,
                'isLock': this.dataForm.isLock,
                'modifyTime': this.dataForm.modifyTime
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
