<template>
  <el-dialog
    title="批量新增"
    :close-on-click-modal="false"
    :visible.sync="visible"
    width="30%"
    @close="closeDialog"
  >
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="级别名称" style="width: 200px" />
      </el-form-item>
      <el-form-item label="级别类型" prop="type">
        <el-select v-model="dataForm.type" placeholder="请选择" @change="typeChange">
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="isShowMaxLevel" label="最高级别" prop="maxLevel">
        <el-input-number v-model="dataForm.maxLevel" placeholder="最高级别" :min="1" :step="1" />
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
        isShowMaxLevel: true,
        typeList: [{
          value: 1,
          label: '数字（如1级、2级...）'
        },
        {
          value: 2,
          label: '中文（如初级、中级...）'
        }
        ],
        dataForm: {
          id: 0,
          name: '',
          type: 1,
          maxLevel: 10
        },
        dataRule: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' }
          ],
          type: [
            { required: true, message: '类型不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init () {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
        // 组件看不见时调用
        this.over = () => {
          this.isShowMaxLevel = true
        }
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl('/basic/studentLevel/multiAdd'),
              method: 'post',
              data: this.$http.adornData({
                'name': this.dataForm.name,
                'type': this.dataForm.type,
                'maxLevel': this.dataForm.maxLevel.valueOf(),
                'bdOrgId': this.$store.state.user.bdOrgId,
                'createUserId': this.$store.state.user.id
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
      typeChange () {
        this.isShowMaxLevel = this.dataForm.type === 1
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      }
    }
  }
</script>

<style scoped>

</style>
