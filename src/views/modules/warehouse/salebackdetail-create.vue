<template>
  <el-dialog
    title="按步骤创建退货记录"
    :close-on-click-modal="false"
    :visible.sync="visible"
    width="60%">
    <el-steps :active="active" align-center finish-status="success">
      <el-step title="步骤1" description="选择对应的销售记录"></el-step>
      <el-step title="步骤2" description="填写退货数量与备注"></el-step>
    </el-steps>
    <div v-if="active===0" style="margin-top: 20px">
      <el-form :inline="true" :model="dataForm" >
        <el-form-item>
          <el-select v-model="dataForm.wdGoodsId" clearable filterable placeholder="商品">
            <el-option
              v-for="item in goodsList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="dataForm.wdGoodsTypeId" clearable placeholder="商品类型" @change="typeChange">
            <el-option
              v-for="item in typeList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="dataForm.wdGoodsModelId" clearable placeholder="商品型号" :disabled="modelDisable">
            <el-option
              v-for="item in modelListForSelect"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="getDataList()">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        :data="dataList"
        ref="singleTable"
        border
        v-loading="dataListLoading"
        highlight-current-row
        @current-change="selectChange"
        style="width: 100%;">
        <el-table-column
          prop="id"
          header-align="center"
          align="center"
          label="id"
          width="50">
        </el-table-column>
        <el-table-column
          prop="wdGoodsId"
          header-align="center"
          align="center"
          :formatter="formatGoods"
          label="商品">
        </el-table-column>
        <el-table-column
          prop="wdGoodsTypeId"
          header-align="center"
          align="center"
          :formatter="formatType"
          label="商品类型">
        </el-table-column>
        <el-table-column
          prop="wdGoodsModelId"
          header-align="center"
          align="center"
          :formatter="formatModel"
          label="商品型号">
        </el-table-column>
        <el-table-column
          prop="qty"
          header-align="center"
          align="center"
          label="数量"
          width="80">
        </el-table-column>
        <el-table-column
          prop="backQty"
          header-align="center"
          align="center"
          label="退货数量"
          width="80">
        </el-table-column>
        <el-table-column
          prop="price"
          header-align="center"
          align="center"
          label="销售单价（元）">
        </el-table-column>
        <el-table-column
          prop="createTime"
          header-align="center"
          align="center"
          show-overflow-tooltip
          label="创建时间">
        </el-table-column>
        <el-table-column
          prop="remark"
          header-align="center"
          align="center"
          show-overflow-tooltip
          label="备注">
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
        :current-page="pageIndex"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="totalPage"
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </div>
    <div v-if="active===1" style="margin-top: 20px">
      <el-form :model="dataForm" ref="dataForm" label-width="80px">
        <el-form-item label="退货数量" prop="qty">
          <el-input-number v-model="dataForm.qty" placeholder="退货数量" :min="1" :max="currentSaleQty - currentSaleBackQty" :step="1"></el-input-number>
        </el-form-item>
        <el-form-item label="退货备注" prop="remark">
          <el-input v-model="dataForm.remark" placeholder="退货备注"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="next" v-if="active===0">下一步</el-button>
      <el-button type="primary" @click="previous" v-if="active===1">上一步</el-button>
      <el-button type="primary" @click="dataFormSubmit()" v-if="active===1">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        visible: false,
        active: 0,
        dataForm: {
          wdGoodsId: '',
          wdGoodsTypeId: '',
          wdGoodsModelId: '',
          // 填写的退货数量与备注
          qty: 0,
          remark: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        goodsList: [],
        typeList: [],
        modelList: [],
        modelListForSelect: [],
        supplierList: [],
        modelDisable: true,
        // 单选获取的值
        currentRow: null,
        currentWdGoodsId: '',
        currentWdGoodsTypeId: '',
        currentWdGoodsModelId: '',
        currentWdSaleDetailId: '',
        currentSaleQty: '',
        currentSaleBackQty: ''
      }
    },
    methods: {
      init (goodsList, typeList, modelList) {
        this.visible = true
        this.active = 0
        this.getDataList()
        this.goodsList = goodsList
        this.typeList = typeList
        this.modelList = modelList
      },
      // 提交
      dataFormSubmit () {
        this.$http({
          url: this.$http.adornUrl('/warehouse/salebackdetail/save'),
          method: 'post',
          data: this.$http.adornData({
            'wdGoodsId': this.currentWdGoodsId,
            'wdGoodsTypeId': this.currentWdGoodsTypeId,
            'wdGoodsModelId': this.currentWdGoodsModelId,
            'wdSaleDetailId': this.currentWdSaleDetailId,
            'qty': this.dataForm.qty,
            'bdOrgId': this.$store.state.user.bdOrgId,
            'createUserId': this.$store.state.user.id,
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
      },
      // 下一步
      next () {
        if (this.currentWdGoodsId === 0) {
          this.$message({
            message: '请选择指定销售记录',
            type: 'warning',
            duration: 1500
          })
        } else if (this.currentSaleQty === this.currentSaleBackQty) {
          this.$message({
            message: '所选记录已完全退货，请选择其它记录！',
            type: 'warning',
            duration: 1500
          })
        } else {
          let isLock = 0
          this.$http({
            url: this.$http.adornUrl(`/warehouse/goodsbook/info/${this.currentWdGoodsId}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            isLock = data.goodsBook.isLock
            if (isLock > 0) {
              this.$message({
                message: '由于该商品正在进行盘点，已被锁定，无法操作！',
                type: 'warning',
                duration: 1500
              })
            } else if (this.currentWdGoodsId > 0 && this.currentSaleQty > this.currentSaleBackQty) {
              if (this.active++ >= 1) {
                this.active = 1
              }
            }
          })
        }
      },
      // 上一步
      previous () {
        if (this.active-- <= 0) {
          this.active = 0
        }
        // 刷新列表并重置选择
        this.getDataList()
        this.currentWdSaleDetailId = 0
        this.currentWdGoodsId = 0
        this.currentWdGoodsId = 0
        this.currentWdGoodsId = 0
        this.currentSaleQty = 0
        this.currentSaleBackQty = 0
      },
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/warehouse/saledetail/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'wdGoodsId': this.dataForm.wdGoodsId,
            'wdGoodsTypeId': this.dataForm.wdGoodsTypeId,
            'wdGoodsModelId': this.dataForm.wdGoodsModelId,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.dataList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.dataList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getDataList()
      },
      formatGoods: function (row, column) {
        let goodsName = '未知'
        if (this.goodsList != null) {
          for (let i = 0; i < this.goodsList.length; i++) {
            let item = this.goodsList[i]
            if (item.id === row.wdGoodsId) {
              goodsName = item.name
              break
            }
          }
        }
        return goodsName
      },
      formatType: function (row, column) {
        let typeName = '未知'
        if (this.typeList != null) {
          for (let i = 0; i < this.typeList.length; i++) {
            let item = this.typeList[i]
            if (item.id === row.wdGoodsTypeId) {
              typeName = item.name
              break
            }
          }
        }
        return typeName
      },
      formatModel: function (row, column) {
        let modelName = '未知'
        if (this.modelList != null) {
          for (let i = 0; i < this.modelList.length; i++) {
            let item = this.modelList[i]
            if (item.id === row.wdGoodsModelId) {
              modelName = item.name
              break
            }
          }
        }
        return modelName
      },
      // 商品类型变更
      typeChange () {
        this.dataForm.wdGoodsModelId = ''
        if (this.dataForm.wdGoodsTypeId) {
          this.modelDisable = false
          this.getModelListForSelect()
        } else {
          this.modelDisable = true
          this.modelListForSelect = []
        }
      },
      // 单选变化
      selectChange (val) {
        this.currentRow = val
        if (this.currentRow != null) {
          this.currentWdSaleDetailId = val.id
          this.currentWdGoodsId = val.wdGoodsId
          this.currentWdGoodsTypeId = val.wdGoodsTypeId
          this.currentWdGoodsModelId = val.wdGoodsModelId
          this.currentSaleQty = val.qty
          this.currentSaleBackQty = val.backQty
        } else {
          this.currentWdSaleDetailId = 0
          this.currentWdGoodsId = 0
          this.currentWdGoodsId = 0
          this.currentWdGoodsId = 0
          this.currentSaleQty = 0
          this.currentSaleBackQty = 0
        }
      }
    }
  }
</script>

<style>
  .el-table__body tr.current-row>td{
    background-color: #f57878 !important;
    color: wheat;
  }
</style>