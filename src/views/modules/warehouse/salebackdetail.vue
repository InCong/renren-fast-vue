<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-select v-model="dataForm.wdGoodsId" clearable filterable placeholder="商品">
          <el-option
            v-for="item in goodsList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="dataForm.wdGoodsTypeId" clearable placeholder="商品种类">
          <el-option
            v-for="item in typeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">
          查询
        </el-button>
        <el-button v-if="isAuth('warehouse:salebackdetail:save')" type="primary" @click="saleBackDetailCreate">
          新增退货记录
        </el-button>
        <!--        <el-button v-if="isAuth('warehouse:salebackdetail:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>-->
      </el-form-item>
    </el-form>
    <el-table
      v-loading="dataListLoading"
      :data="dataList"
      border
      style="width: 100%;"
      @selection-change="selectionChangeHandle"
    >
      <!--      <el-table-column-->
      <!--        type="selection"-->
      <!--        header-align="center"-->
      <!--        align="center"-->
      <!--        width="50">-->
      <!--      </el-table-column>-->
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        label="id"
        width="50"
      />
      <el-table-column
        prop="wdGoodsId"
        header-align="center"
        align="center"
        :formatter="formatGoods"
        label="商品"
      />
      <el-table-column
        prop="wdGoodsTypeId"
        header-align="center"
        align="center"
        :formatter="formatType"
        label="商品种类"
      />
      <el-table-column
        prop="qty"
        header-align="center"
        align="center"
        label="退货数量"
      />
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间"
      />
      <el-table-column
        prop="remark"
        header-align="center"
        align="center"
        show-overflow-tooltip
        label="退货备注"
      />
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button size="small" type="primary" @click="addOrUpdateHandle(scope.row.id, scope.row.createTime)">
            修改
          </el-button>
          <el-button size="small" type="danger" @click="deleteHandle(scope.row.id, scope.row.wdGoodsId, scope.row.createTime)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
    />
    <!-- 弹窗, 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList" />
    <!-- 弹窗，新增 -->
    <sale-back-detail-create v-if="saleBackDetailCreateVisible" ref="saleBackDetailCreate" @refreshDataList="getDataList" />
  </div>
</template>

<script>
  import AddOrUpdate from './salebackdetail-add-or-update'
  import SaleBackDetailCreate from './salebackdetail-create'
  import moment from 'moment'
  export default {
    components: {
      AddOrUpdate,
      SaleBackDetailCreate
    },
    data () {
      return {
        dataForm: {
          wdGoodsId: '',
          wdGoodsTypeId: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        saleBackDetailCreateVisible: false,
        goodsList: [],
        typeList: [],
        supplierList: []
      }
    },
    activated () {
      this.getDataList()
      this.getGoodsList()
      this.getTypeList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/warehouse/salebackdetail/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'wdGoodsId': this.dataForm.wdGoodsId,
            'wdGoodsTypeId': this.dataForm.wdGoodsTypeId,
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
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },
      // 修改
      addOrUpdateHandle (id, createTime) {
        if (moment(createTime).add(30, 'days') < moment()) {
          this.$message({
            message: '已超过30天，不允许修改！',
            type: 'warning',
            duration: 1500
          })
        } else {
          this.addOrUpdateVisible = true
          this.$nextTick(() => {
            this.$refs.addOrUpdate.init(id, this.goodsList, this.typeList)
          })
        }
      },
      saleBackDetailCreate () {
        this.saleBackDetailCreateVisible = true
        this.$nextTick(() => {
          this.$refs.saleBackDetailCreate.init(this.goodsList, this.typeList)
        })
      },
      // 删除
      deleteHandle (id, wdGoodsId, createTime) {
        let isLock = 0
        this.$http({
          url: this.$http.adornUrl(`/warehouse/goodsbook/info/${wdGoodsId}`),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          isLock = data.goodsBook.isLock
          if (moment(createTime).add(30, 'days') < moment()) {
            this.$message({
              message: '已超过30天，不允许删除！',
              type: 'warning',
              duration: 1500
            })
          } else if (isLock > 0) {
            this.$message({
              message: '由于该商品正在进行盘点，已被锁定，无法删除！',
              type: 'warning',
              duration: 1500
            })
          } else {
            const ids = id ? [id] : this.dataListSelections.map(item => {
              return item.id
            })
            this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.$http({
                url: this.$http.adornUrl('/warehouse/salebackdetail/delete'),
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
          }
        })
      },
      getGoodsList () {
        this.$http({
          url: this.$http.adornUrl('/warehouse/goods/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 1000,
            'bdOrgId': this.$store.state.user.id === 1 ? null : this.$store.state.user.bdOrgId // 超级管理员可以看全部
          })
        }).then(({data}) => {
          this.goodsList = data.page.list
        })
      },
      // 获取商品类型ID
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
      }
    }
  }
</script>
