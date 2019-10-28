<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :append-to-body="true"
    :visible.sync="visible"
    width="60%"
    @close="closeDialog">
    <el-steps :active="active" finish-status="finish" :align-center="true">
      <el-step title="填写信息"></el-step>
      <el-step title="组合课程"></el-step>
    </el-steps>
    <div>
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="next()" label-width="50px" :disabled="active > 1">
        <el-row>
          <el-col :span="8">
            <el-form-item label="名称" prop="name">
              <el-input v-model="dataForm.name" placeholder="名称" @change="inputChange"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="dataForm.remark" placeholder="备注" @change="inputChange"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div v-if="active > 1">
      <el-button type="primary" @click="addOrUpdateHandle(null, dataForm.id)" style="margin-bottom: 10px">增加课程</el-button>
      <el-table
        :data="dataList"
        border
        v-loading="dataListLoading"
        style="width: 100%;">
        <el-table-column
          prop="id"
          header-align="center"
          align="center"
          label="id"
          width="50">
        </el-table-column>
        <el-table-column
          prop="name"
          header-align="center"
          align="center"
          label="课程名">
        </el-table-column>
        <el-table-column
          prop="teacherName"
          header-align="center"
          align="center"
          label="教师名">
        </el-table-column>
        <el-table-column
          prop="originalPrice"
          header-align="center"
          align="center"
          label="原价">
        </el-table-column>
        <el-table-column
          prop="currentPrice"
          header-align="center"
          align="center"
          label="现价">
        </el-table-column>
        <el-table-column
          prop="num"
          header-align="center"
          align="center"
          label="课时">
        </el-table-column>
        <el-table-column
          prop="otherType"
          header-align="center"
          align="center"
          label="类型">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.otherType === 1" size="small">普通</el-tag>
            <el-tag v-if="scope.row.otherType === 2" size="small">赠送</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          header-align="center"
          align="center"
          show-overflow-tooltip
          label="备注">
        </el-table-column>
        <el-table-column
          fixed="right"
          header-align="center"
          align="center"
          width="150"
          label="操作">
          <template slot-scope="scope">
            <el-row style="margin-bottom:10px">
              <el-col :span="12"><el-button size="mini" @click="addOrUpdateHandle(scope.row.id, dataForm.id)">修改</el-button></el-col>
              <el-col :span="12"><el-button size="mini" type="danger" @click="deleteHandle(scope.row.id)">删除</el-button></el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <!-- 弹窗, 新增 / 修改 -->
      <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="this.active===2" type="primary" @click="previous()">上一步</el-button>
      <el-button type="primary" @click="next()">{{buttonName}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import AddOrUpdate from './packagedetail-add-or-update'
  export default {
    data () {
      return {
        visible: false,
        isNew: false,
        isModify: false,
        dataForm: {
          id: 0,
          name: '',
          originalAmount: '',
          amount: '',
          createUserId: '',
          createTime: '',
          remark: ''
        },
        dataRule: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' }
          ]
        },
        active: 1,
        buttonName: '下一步',
        isSubmit: false,
        // 表格的相关属性
        dataListLoading: false,
        dataList: [],
        addOrUpdateVisible: false
      }
    },
    components: {
      AddOrUpdate
    },
    methods: {
      init (id) {
        this.isNew = !id
        this.dataForm.id = id || 0
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/business/package/info/${this.dataForm.id}`),
              method: 'get',
              params: this.$http.adornParams()
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.dataForm.name = data.package.name
                this.dataForm.remark = data.package.remark
              }
            })
          }
        })
        this.over = () => {
          if (this.isNew) {
            if (this.isSubmit) {
              this.visible = false
              this.$emit('refreshDataList')
            } else {
              if (this.dataForm.id) {
                this.$http({
                  url: this.$http.adornUrl('/business/package/delete'),
                  method: 'post',
                  data: this.$http.adornData([this.dataForm.id], false)
                }).then(({data}) => {
                  if (data && data.code === 0) {
                    this.visible = false
                  } else {
                    this.$message.error(data.msg)
                  }
                })
              } else {
                this.visible = false
              }
            }
          } else {
            this.visible = false
          }
          this.isNew = false
          this.isModify = false
          this.active = 1
          this.buttonName = '下一步'
          this.isSubmit = false
          this.dataForm.name = ''
          this.dataForm.remark = ''
        }
      },
      // 下一步 or 提交
      next () {
        if (this.active === 1) {
          this.$refs['dataForm'].validate((valid) => {
            if (valid && this.isModify) {
              this.$http({
                url: this.$http.adornUrl(`/business/package/${!this.dataForm.id ? 'saveAndGetId' : 'update'}`),
                method: 'post',
                data: this.$http.adornData({
                  'id': this.dataForm.id || undefined,
                  'name': this.dataForm.name,
                  'bdOrgId': this.dataForm.bdOrgId || this.$store.state.user.bdOrgId,
                  'remark': this.dataForm.remark
                })
              }).then(({data}) => {
                if (data.id > 0) {
                  this.dataForm.id = data.id
                }
                if (data && data.code === 0) {
                  this.$message({
                    message: '操作成功',
                    type: 'success',
                    duration: 1000,
                    onClose: () => {
                      // 保存完成之后
                      this.buttonName = '提交'
                      this.active++
                    }
                  })
                  this.getDataList(this.dataForm.id)
                } else {
                  this.$message.error(data.msg)
                }
              })
            } else if (!this.isNew && !this.isModify) {
              // 保存完成之后
              this.buttonName = '提交'
              this.active++
              this.getDataList(this.dataForm.id)
            }
          })
        } else if (this.active === 2) {
          this.isSubmit = true
          this.visible = false
        }
      },
      previous () {
        this.active--
        this.buttonName = '下一步'
      },
      closeDialog () {
        this.over()
      },
      // 获取数据列表
      getDataList (id) {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/packagedetail/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 1000,
            'bdPackageId': id
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dataList = data.page.list
          } else {
            this.dataList = []
          }
          this.dataListLoading = false
        })
      },
      // 新增 / 修改
      addOrUpdateHandle (id, bdPackageId) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id, bdPackageId)
        })
      },
      // 删除
      deleteHandle (id) {
        var ids = [id]
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/business/packagedetail/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        })
      },
      inputChange () {
        this.isModify = true
      }
    }
  }
</script>
