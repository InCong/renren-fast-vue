<template>
  <el-dialog
    :close-on-click-modal="false"
    width="60%"
    :visible.sync="visible">
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
          <label>{{previewDialogImageUrl}}</label>
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
        previewDialogImageUrl: '',
        previewDialogVisible: false,
        pictureFileList: [],
        pageIndex: 1,
        pageSize: 1000,
        totalPage: 0,
        num: 0,
        successNum: 0,
        activeName: 'pictureUpload',
      }
    },
    methods: {
      init (bdOrgId, teacherId) {
        this.visible = true
        this.url = this.$http.adornUrl(`/sys/oss/upload/${bdOrgId}?token=${this.$cookie.get('token')}`)
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/teachermultimedia/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'teacherId': teacherId,
            'bdOrgId': this.$store.state.user.id === 1 ? null : bdOrgId // 超级管理员可以获取全部机构部门的列表
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
      },
      handleTabClick (tab, event) {
        console.log(tab, event)
      },
      handlePictureRemove (file, fileList) {
        if (file.status === 'success') {
          console.log(file, fileList)
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
        this.$message.warning("上传不能超过1个！")
      }
    }
  }
</script>

<style scoped>

</style>
