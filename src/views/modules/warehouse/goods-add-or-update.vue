<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="名称" />
      </el-form-item>
      <el-form-item label="参考单价" prop="price">
        <el-input-number v-model="dataForm.price" placeholder="参考单价" :min="0" :step="10" :precision="2" />
      </el-form-item>
      <el-form-item label="编号" prop="code">
        <el-input v-model="dataForm.code" placeholder="编号" />
      </el-form-item>
      <el-form-item label="商品种类" prop="wdGoodsTypeId">
        <el-select v-model="dataForm.wdGoodsTypeId" clearable placeholder="商品种类">
          <el-option
            v-for="item in typeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-input v-model="dataForm.createTime" placeholder="创建时间，自动生成，无需填写" :disabled="true" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="备注" />
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
          name: '',
          price: '',
          code: '',
          wdGoodsTypeId: '',
          wdGoodsModelId: '',
          bdOrgId: '',
          createUserId: '',
          createTime: '',
          remark: ''
        },
        dataRule: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '参考单价不能为空', trigger: 'blur' }
          ],
          wdGoodsTypeId: [
            { required: true, message: '商品种类不能为空', trigger: 'blur' }
          ]
        },
        typeList: []
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.getTypeList()
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/warehouse/goods/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.name = data.goods.name
                this.dataForm.price = data.goods.price
                this.dataForm.code = data.goods.code
                this.dataForm.wdGoodsTypeId = data.goods.wdGoodsTypeId
                this.dataForm.bdOrgId = data.goods.bdOrgId
                this.dataForm.createUserId = data.goods.createUserId
                this.dataForm.createTime = data.goods.createTime
                this.dataForm.remark = data.goods.remark
                if (this.dataForm.wdGoodsModelId) {
                  this.modelDisable = false
                  this.getModelList()
                }
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
              url: this.$http.adornUrl(`/warehouse/goods/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'name': this.dataForm.name,
                'price': this.dataForm.price,
                'code': this.dataForm.code,
                'wdGoodsTypeId': this.dataForm.wdGoodsTypeId,
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
      // 获取商品种类ID
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
      }
    }
  }
</script>
