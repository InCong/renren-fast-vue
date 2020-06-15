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
      <el-form-item label="负责人" prop="header">
        <el-input v-model="dataForm.header" placeholder="负责人" />
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile">
        <el-input v-model="dataForm.mobile" placeholder="联系电话" />
      </el-form-item>
      <el-form-item label="描述" prop="remark">
        <el-input v-model="dataForm.remark" placeholder="描述" />
      </el-form-item>
      <el-form-item label="上级" prop="parentName">
        <el-popover
          ref="orgListPopover"
          placement="bottom-start"
          trigger="click"
        >
          <el-tree
            ref="orgListTree"
            :data="orgList"
            :props="orgListTreeProps"
            node-key="id"
            :default-expand-all="true"
            :highlight-current="true"
            :expand-on-click-node="false"
            @current-change="orgListTreeCurrentChangeHandle"
          />
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:orgListPopover :readonly="true" placeholder="点击选择部门" class="menu-list__input" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-input v-model="dataForm.createTime" placeholder="创建时间，无需填写，自动生成" :disabled="true" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  export default {
    data () {
      return {
        visible: false,
        dataForm: {
          id: 0,
          parentId: 0,
          parentName: '',
          name: '',
          header: '',
          mobile: '',
          remark: ''
        },
        dataRule: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' }
          ],
          parentName: [
            { required: true, message: '部门不能为空', trigger: 'change' }
          ],
          header: [
            { required: true, message: '负责人不能为空', trigger: 'blur' }
          ]
        },
        orgList: [],
        orgListTreeProps: {
          label: 'name',
          children: 'children'
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.$http({
          url: this.$http.adornUrl('/business/org/select'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.orgList = treeDataTranslate(data.orgList, 'id')
        }).then(() => {
          this.visible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
          })
        }).then(() => {
          if (!this.dataForm.id) {
            // 新增
            this.orgListTreeSetCurrentNode()
          } else {
            // 修改
            this.$http({
              url: this.$http.adornUrl(`/business/org/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              this.dataForm.id = data.org.id
              this.dataForm.parentId = data.org.parentId
              this.dataForm.name = data.org.name
              this.dataForm.header = data.org.header
              this.dataForm.mobile = data.org.mobile
              this.dataForm.remark = data.org.remark
              this.orgListTreeSetCurrentNode()
            })
          }
        })
      },
      // 菜单树选中
      orgListTreeCurrentChangeHandle (data, node) {
        this.dataForm.parentId = data.id
        this.dataForm.parentName = data.name
      },
      // 菜单树设置当前选中节点
      orgListTreeSetCurrentNode () {
        this.$refs.orgListTree.setCurrentKey(this.dataForm.parentId)
        this.dataForm.parentName = (this.$refs.orgListTree.getCurrentNode() || {})['name']
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/business/org/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'parentId': this.dataForm.parentId,
                'name': this.dataForm.name,
                'header': this.dataForm.header,
                'mobile': this.dataForm.mobile,
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

<style lang="scss">
  .mod-config {
    .menu-list__input {
      > .el-input__inner {
        cursor: pointer;
      }
    }
  }
</style>
