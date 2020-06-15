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
      <el-form-item label="使用人数" prop="num">
        <el-input-number v-model="dataForm.num" :min="1" max="100" :step="1" />
      </el-form-item>
      <el-form-item label="类型" prop="bdResourceTypeId">
        <el-select v-model="dataForm.bdResourceTypeId" clearable placeholder="请选择">
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
          num: '',
          bdResourceTypeId: '',
          bdOrgId: '',
          createUserId: '',
          createTime: '',
          remark: ''
        },
        dataRule: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' }
          ],
          num: [
            { required: true, message: '使用人数上限不能为空', trigger: 'blur' }
          ],
          bdResourceTypeId: [
            { required: true, message: '类型不能为空', trigger: 'blur' }
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
              url: this.$http.adornUrl(`/basic/resource/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.name = data.resource.name
                this.dataForm.num = data.resource.num
                this.dataForm.bdResourceTypeId = data.resource.bdResourceTypeId
                this.dataForm.bdOrgId = data.resource.bdOrgId
                this.dataForm.createUserId = data.resource.createUserId
                this.dataForm.createTime = data.resource.createTime
                this.dataForm.remark = data.resource.remark
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
              url: this.$http.adornUrl(`/basic/resource/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'name': this.dataForm.name,
                'num': this.dataForm.num,
                'bdResourceTypeId': this.dataForm.bdResourceTypeId,
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
      // 获取资源类型ID
      getTypeList () {
        this.$http({
          url: this.$http.adornUrl('/basic/resourcetype/list'),
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
