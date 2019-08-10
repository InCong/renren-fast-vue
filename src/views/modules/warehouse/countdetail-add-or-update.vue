<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
    <el-form-item label="商品ID" prop="wdGoodsId">
      <el-input v-model="dataForm.wdGoodsId" placeholder="商品ID"></el-input>
    </el-form-item>
    <el-form-item label="商品类型ID" prop="wdGoodsTypeId">
      <el-input v-model="dataForm.wdGoodsTypeId" placeholder="商品类型ID"></el-input>
    </el-form-item>
    <el-form-item label="商品型号id" prop="wdGoodsModelId">
      <el-input v-model="dataForm.wdGoodsModelId" placeholder="商品型号id"></el-input>
    </el-form-item>
    <el-form-item label="静态库存" prop="staticQty">
      <el-input v-model="dataForm.staticQty" placeholder="静态库存"></el-input>
    </el-form-item>
    <el-form-item label="盘点数量" prop="qty">
      <el-input v-model="dataForm.qty" placeholder="盘点数量"></el-input>
    </el-form-item>
    <el-form-item label="差异数量" prop="diffQty">
      <el-input v-model="dataForm.diffQty" placeholder="差异数量"></el-input>
    </el-form-item>
    <el-form-item label="创建人" prop="createUserId">
      <el-input v-model="dataForm.createUserId" placeholder="创建人"></el-input>
    </el-form-item>
    <el-form-item label="创建时间" prop="createTime">
      <el-input v-model="dataForm.createTime" placeholder="创建时间"></el-input>
    </el-form-item>
    <el-form-item label="盘点情况" prop="remark">
      <el-input v-model="dataForm.remark" placeholder="盘点情况"></el-input>
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
          staticQty: '',
          qty: '',
          diffQty: '',
          createUserId: '',
          createTime: '',
          remark: ''
        },
        dataRule: {
          wdGoodsId: [
            { required: true, message: '商品ID不能为空', trigger: 'blur' }
          ],
          wdGoodsTypeId: [
            { required: true, message: '商品类型ID不能为空', trigger: 'blur' }
          ],
          wdGoodsModelId: [
            { required: true, message: '商品型号id不能为空', trigger: 'blur' }
          ],
          staticQty: [
            { required: true, message: '静态库存不能为空', trigger: 'blur' }
          ],
          qty: [
            { required: true, message: '盘点数量不能为空', trigger: 'blur' }
          ],
          diffQty: [
            { required: true, message: '差异数量不能为空', trigger: 'blur' }
          ],
          createUserId: [
            { required: true, message: '创建人不能为空', trigger: 'blur' }
          ],
          createTime: [
            { required: true, message: '创建时间不能为空', trigger: 'blur' }
          ],
          remark: [
            { required: true, message: '盘点情况不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/warehouse/countdetail/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.wdGoodsId = data.countdetail.wdGoodsId
                this.dataForm.wdGoodsTypeId = data.countdetail.wdGoodsTypeId
                this.dataForm.wdGoodsModelId = data.countdetail.wdGoodsModelId
                this.dataForm.staticQty = data.countdetail.staticQty
                this.dataForm.qty = data.countdetail.qty
                this.dataForm.diffQty = data.countdetail.diffQty
                this.dataForm.createUserId = data.countdetail.createUserId
                this.dataForm.createTime = data.countdetail.createTime
                this.dataForm.remark = data.countdetail.remark
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
                'wdGoodsId': this.dataForm.wdGoodsId,
                'wdGoodsTypeId': this.dataForm.wdGoodsTypeId,
                'wdGoodsModelId': this.dataForm.wdGoodsModelId,
                'staticQty': this.dataForm.staticQty,
                'qty': this.dataForm.qty,
                'diffQty': this.dataForm.diffQty,
                'createUserId': this.dataForm.createUserId,
                'createTime': this.dataForm.createTime,
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
