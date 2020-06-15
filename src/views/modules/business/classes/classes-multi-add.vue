<template>
  <el-dialog
    title="批量新增"
    :close-on-click-modal="false"
    :visible.sync="visible"
    width="30%"
    @close="closeDialog"
  >
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="课程种类" prop="bdClassTypeId">
        <el-select v-model="dataForm.bdClassTypeId" clearable placeholder="请选择" @change="classTypeChange">
          <el-option
            v-for="item in classTypeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="最低价格" prop="minPrice">
        <el-input-number v-model="dataForm.minPrice" placeholder="最低价格" :min="0" :step="10" :precision="2" />
      </el-form-item>
      <el-form-item label="价格区间" prop="priceStep">
        <el-input-number v-model="dataForm.priceStep" placeholder="价格区间" :min="0" :step="10" :precision="2" />
      </el-form-item>
      <el-form-item label="课程时长" prop="length">
        <el-input-number v-model="dataForm.length" :step="15" />
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
      <el-form-item label="课程级别种类" prop="type">
        <el-select v-model="dataForm.type" placeholder="请选择" @change="typeChange">
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="isShowMaxLevel" label="最大数量" prop="maxLevel">
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
        dataForm: {
          bdClassTypeId: '',
          bdClassTypeName: '',
          bdClassWayId: 1,
          minPrice: 100,
          priceStep: 10,
          maxLevel: 10,
          length: 60,
          type: 1
        },
        dataRule: {
          minPrice: [
            { required: true, message: '最低价格不能为空', trigger: 'blur' }
          ],
          priceStep: [
            { required: true, message: '价格区间不能为空', trigger: 'blur' }
          ],
          maxLevel: [
            { required: true, message: '最大级别数量不能为空', trigger: 'blur' }
          ],
          length: [
            { required: true, message: '时长不能为空', trigger: 'blur' }
          ],
          type: [
            { required: true, message: '课程级别种类不能为空', trigger: 'blur' }
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
      init () {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
        this.getClassTypeList()
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
              url: this.$http.adornUrl('/business/classes/multiAdd'),
              method: 'post',
              data: this.$http.adornData({
                'name': this.dataForm.bdClassTypeName,
                'bdClassTypeId': this.dataForm.bdClassTypeId,
                'bdClassWayId': this.dataForm.bdClassWayId,
                'minPrice': this.dataForm.minPrice.toString(),
                'priceStep': this.dataForm.priceStep.toString(),
                'maxLevel': this.dataForm.maxLevel.valueOf(),
                'length': this.dataForm.length,
                'type': this.dataForm.type,
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
      },
      // 关闭时的逻辑
      closeDialog () {
        this.over()
      },
      classTypeChange () {
        for (let i = 0; i < this.classTypeList.length; i++) {
          let item = this.classTypeList[i]
          if (item.id === this.dataForm.bdClassTypeId) {
            this.dataForm.bdClassTypeName = item.name
            break
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
