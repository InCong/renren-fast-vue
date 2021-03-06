<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="课程种类" prop="bdClassTypeId">
        <el-select v-model="dataForm.bdClassTypeId" clearable placeholder="请选择">
          <el-option
            v-for="item in classTypeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="上课方式" prop="bdClassWayId">
        <el-select v-model="dataForm.bdClassWayId" clearable placeholder="请选择">
          <el-option
            v-for="item in classWayList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number v-model="dataForm.price" placeholder="价格" :min="0" :step="10" :precision="2" />
      </el-form-item>
      <el-form-item label="时长" prop="length">
        <el-input-number v-model="dataForm.length" :step="15" />
      </el-form-item>
      <el-form-item label="课程别名" prop="name">
        <el-input v-model="dataForm.name" placeholder="课程别名" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="dataForm.status" placeholder="请选择">
          <el-option
            v-for="item in statusList"
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
        <el-input v-model="dataForm.remark" placeholder="备注" type="textarea" />
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
        classTypeList: [],
        classWayList: [{
          id: 1,
          name: '一对一'
        }, {
          id: 2,
          name: '一对多'
        }, {
          id: 3,
          name: '多对一'
        }, {
          id: 4,
          name: '多对多'
        }],
        statusList: [{
          id: 0,
          name: '未知'
        }, {
          id: 1,
          name: '正常'
        }, {
          id: 2,
          name: '暂停'
        }, {
          id: 3,
          name: '撤销'
        }, {
          id: 9,
          name: '其它'
        }],
        dataForm: {
          id: 0,
          name: '',
          price: '',
          status: 0,
          length: 60,
          bdClassWayId: '',
          bdClassTypeId: '',
          bdOrgId: '',
          createUserId: '',
          createTime: '',
          remark: ''
        },
        dataRule: {
          name: [
            { required: true, message: '课程别名不能为空', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '价格不能为空', trigger: 'blur' }
          ],
          length: [
            { required: true, message: '时长不能为空', trigger: 'blur' }
          ],
          bdClassTypeId: [
            { required: true, message: '课程种类不能为空', trigger: 'blur' }
          ],
          bdClassWayId: [
            { required: true, message: '上课方式不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.visible = true
        this.getClassTypeList()
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/business/classes/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.name = data.classes.name
                this.dataForm.price = data.classes.price
                this.dataForm.length = data.classes.length
                this.dataForm.status = data.classes.status
                this.dataForm.bdClassWayId = data.classes.bdClassWayId
                this.dataForm.bdClassTypeId = data.classes.bdClassTypeId
                this.dataForm.bdOrgId = data.classes.bdOrgId
                this.dataForm.createTime = data.classes.createTime
                this.dataForm.remark = data.classes.remark
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
              url: this.$http.adornUrl(`/business/classes/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'name': this.dataForm.name,
                'price': this.dataForm.price,
                'length': this.dataForm.length,
                'status': this.dataForm.status,
                'bdClassWayId': this.dataForm.bdClassWayId,
                'bdClassTypeId': this.dataForm.bdClassTypeId,
                'bdOrgId': this.dataForm.bdOrgId || this.$store.state.user.bdOrgId,
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
      // 获取课程种类ID
      getClassTypeList () {
        this.$http({
          url: this.$http.adornUrl('/basic/classtype/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 0,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.classTypeList = data.page.list
          } else {
            this.classTypeList = []
          }
        })
      }
    }
  }
</script>
