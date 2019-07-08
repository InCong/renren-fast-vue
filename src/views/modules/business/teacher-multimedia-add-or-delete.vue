<template>
  <el-dialog
    :close-on-click-modal="false"
    width="60%"
    :visible.sync="visible"
    @close="closeDialog">
    <el-tabs v-model="activeName" @tab-click="handleTabClick" type="border-card" v-loading="dataListLoading">
      <el-tab-pane label="图片上传" name="pictureUpload">
        <el-upload
          ref="upload"
          :action="url"
          multiple
          :limit="5"
          list-type="picture-card"
          :file-list="pictureFileList"
          :on-preview="handlePictureCardPreview"
          :on-remove="handlePictureRemove"
          :on-success="handlePictureSuccess"
          :on-error="handlePictureError"
          :on-exceed="handlePictureExceed"
          :before-upload="beforePictureUpload">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="previewDialogVisible" append-to-body>
          <img width="100%" :src="previewDialogImageUrl" alt="">
        </el-dialog>
        <el-table
          :data="pictureFileList"
          border
          v-loading="dataListLoading"
          style="width: 100%;">
          <el-table-column
            type="selection"
            header-align="center"
            align="center"
            width="50">
          </el-table-column>
          <el-table-column
            prop="id"
            header-align="center"
            align="center"
            width="80"
            label="ID">
          </el-table-column>
          <el-table-column
            prop="name"
            header-align="center"
            align="center"
            label="图片名称">
          </el-table-column>
          <el-table-column
            prop="createTime"
            header-align="center"
            align="center"
            label="上传时间">
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="视频上传" name="videoUpload">
        视频上传
      </el-tab-pane>
    </el-tabs>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
  export default {
    data () {
      return {
        url: '',
        visible: false,
        dataListLoading: false,
        pageIndex: 1,
        pageSize: 1000,
        totalPage: 0,
        num: 0,
        successNum: 0,
        bdOrgId: 0,
        teacherId: 0,
        // 以下是图片相关的参数
        activeName: 'pictureUpload',
        previewDialogImageUrl: '',
        previewDialogVisible: false,
        pictureFileList: []
      }
    },
    methods: {
      init (bdOrgId, teacherId) {
        this.visible = true
        this.bdOrgId = bdOrgId
        this.teacherId = teacherId
        this.url = this.$http.adornUrl(`/business/teachermultimedia/upload?token=${this.$cookie.get('token')}&teacherId=${teacherId}&bdOrgId=${bdOrgId}&typeId=${1}`)
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/teachermultimedia/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'teacherId': teacherId,
            'bdOrgId': this.$store.state.user.id === 1 ? null : bdOrgId, // 超级管理员可以获取全部机构部门的列表
            'typeId': 1 // 只查看图片的信息
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.pictureFileList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.pictureFileList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })

        // 组件看不见时调用，清空数组
        this.over = () => {
          this.pictureFileList = []
        }
      },
      handleTabClick (tab, event) {
        console.log(tab, event)
      },
      handlePictureRemove (file, fileList) {
        if (file.status === 'success') {
          console.log(file, fileList)
          this.$http({
            url: this.$http.adornUrl('/business/teachermultimedia/deleteFromOss'),
            method: 'post',
            params: this.$http.adornParams({
              'id': file.id,
              'name': file.name,
              'bdOrgId': this.bdOrgId
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '成功删除',
                type: 'success',
                duration: 1500
              })
              this.init(this.bdOrgId, this.teacherId) // 删除成功，刷新列表
            } else {
              this.$message.error(data.msg)
            }
          })
        }
      },
      handlePictureCardPreview (file) {
        this.previewDialogImageUrl = file.url
        this.previewDialogVisible = true
      },
      beforePictureUpload (file) {
        const isJPG = file.type === 'image/jpeg'
        const isLt2M = file.size / 1024 / 1024 < 2

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!')
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!')
        }

        this.num++

        return isJPG && isLt2M
      },
      // 上传成功
      handlePictureSuccess (response, file, fileList) {
        this.fileList = fileList
        this.successNum++
        if (response && response.code === 0) {
          if (this.num === this.successNum) {
            this.$confirm('操作成功, 是否继续操作?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.init(this.bdOrgId, this.teacherId) // 点击确定后，刷新列表
            }).catch(() => {
              this.visible = false
            })
          }
        } else {
          this.$message.error(response.msg)
        }
      },
      handlePictureError (err, file, fileList) {
        this.$message.error(err)
      },
      handlePictureExceed (files, fileList) {
        this.$message.warning('上传不能超过5个！')
      },
      closeDialog () {
        this.over()
      }
    }
  }
</script>

<style scoped>

</style>
