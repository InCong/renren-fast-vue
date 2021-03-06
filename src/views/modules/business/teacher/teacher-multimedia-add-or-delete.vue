<template>
  <el-dialog
    :close-on-click-modal="false"
    width="60%"
    :visible.sync="visible"
    @close="closeDialog"
  >
    <el-tabs v-model="activeName" v-loading="dataListLoading" type="border-card" @tab-click="handleTabClick">
      <el-tab-pane label="图片上传" name="pictureUpload">
        <div v-if="isPictureUploadShow">
          <el-upload
            :action="url"
            multiple
            :limit="5"
            list-type="picture-card"
            :file-list="fileList"
            :on-preview="handlePictureCardPreview"
            :on-remove="handlePictureRemove"
            :on-success="handlePictureSuccess"
            :on-error="handlePictureError"
            :on-exceed="handlePictureExceed"
            :before-upload="beforePictureUpload"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <el-dialog :visible.sync="previewDialogVisible" append-to-body>
            <img width="100%" :src="previewDialogImageUrl" alt="">
          </el-dialog>
          <div slot="tip" class="el-upload__tip" style="margin-bottom: 10px">
            注意！图片顺序与列表顺序一致！图片大小不超过2mb！
          </div>
          <el-table
            v-loading="dataListLoading"
            :data="fileList"
            border
            style="width: 100%;"
          >
            <el-table-column
              prop="id"
              header-align="center"
              align="center"
              width="80"
              label="ID"
            />
            <el-table-column
              prop="name"
              header-align="center"
              align="center"
              width="400"
              label="图片名称"
            />
            <el-table-column
              prop="flag"
              header-align="center"
              align="center"
              label="类型"
            >
              <template slot-scope="scope">
                <el-tag v-if="scope.row.flag === 11" size="small" type="success">
                  教师封面
                </el-tag>
                <el-tag v-else size="small" type="warning">
                  其它
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              header-align="center"
              align="center"
              label="上传时间"
            />
            <el-table-column
              fixed="right"
              header-align="center"
              align="center"
              width="150"
              label="操作"
            >
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="changePictureFlag(scope.row.id)">
                  设置为教师封面
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="视频上传" name="videoUpload">
        <div v-if="isVideoUploadShow">
          <el-upload
            :action="url"
            :limit="5"
            drag
            :file-list="fileList"
            :show-file-list="true"
            :before-upload="beforeVideoUpload"
            :on-exceed="handleVideoExceed"
            :on-success="handleVideoSuccess"
            :on-error="handleVideoError"
            :on-remove="handleVideoRemove"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div slot="tip" class="el-upload__tip">
              只能上传mp4、flv、avi、rmvb文件，且不超过10mb
            </div>
          </el-upload>
        </div>
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
        activeName: 'pictureUpload',
        visible: false,
        dataListLoading: false,
        pageIndex: 1,
        pageSize: 1000,
        totalPage: 0,
        num: 0,
        successNum: 0,
        bdOrgId: 0,
        bdTeacherId: 0,
        typeId: 0,
        fileList: [],
        // 用于控制tab页的渲染
        isPictureUploadShow: true,
        isVideoUploadShow: false,
        // 以下是图片相关的参数
        previewDialogImageUrl: '',
        previewDialogVisible: false
      }
    },
    methods: {
      init (bdOrgId, teacherId, typeId) {
        this.visible = true
        this.bdOrgId = bdOrgId
        this.bdTeacherId = teacherId
        this.typeId = typeId
        this.url = this.$http.adornUrl(`/business/teachermultimedia/upload?token=${this.$cookie.get('token')}&teacherId=${teacherId}&bdOrgId=${bdOrgId}&typeId=${typeId}`)
        // console.log(this.url)
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/business/teachermultimedia/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'bdTeacherId': this.bdTeacherId,
            'bdOrgId': this.$store.state.user.id === 1 ? null : bdOrgId, // 超级管理员可以获取全部机构部门的列表
            'typeId': typeId // 1-图片，2-视频
          })
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.fileList = data.page.list
            this.totalPage = data.page.totalCount
          } else {
            this.fileList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })

        // 组件看不见时调用，清空数组
        this.over = () => {
          this.fileList = []
          this.activeName = 'pictureUpload'
          this.isPictureUploadShow = true
          this.isVideoUploadShow = false
          this.num = 0
          this.successNum = 0
        }
      },
      handleTabClick (tab, event) {
        if (tab.name === 'pictureUpload') {
          this.isPictureUploadShow = true
          this.isVideoUploadShow = false
          this.num = 0
          this.successNum = 0
          this.init(this.bdOrgId, this.bdTeacherId, 1)
        } else if (tab.name === 'videoUpload') {
          this.isPictureUploadShow = false
          this.isVideoUploadShow = true
          this.num = 0
          this.successNum = 0
          this.init(this.bdOrgId, this.bdTeacherId, 2)
        }
      },
      // 图片上传的相关事件
      handlePictureRemove (file, fileList) {
        if (file.status === 'success') {
          // console.log(file, fileList)
          this.$http({
            url: this.$http.adornUrl('/business/teachermultimedia/deleteFromOss'),
            method: 'post',
            params: this.$http.adornParams({
              'id': file.id,
              'objectName': file.objectName,
              'bdOrgId': this.bdOrgId
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '成功删除',
                type: 'success',
                duration: 1500
              })
              this.init(this.bdOrgId, this.bdTeacherId, 1) // 删除成功，刷新列表
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
      handlePictureSuccess (response, file, fileList) {
        this.fileList = fileList
        this.successNum++
        if (response && response.code === 0) {
          // console.log(this.num, this.successNum)
          if (this.num === this.successNum) {
            this.$confirm('操作成功, 是否继续操作?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.init(this.bdOrgId, this.bdTeacherId, 1) // 点击确定后，刷新列表
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
      changePictureFlag (id) {
        this.$http({
          url: this.$http.adornUrl('/business/teachermultimedia/cleanFlag'),
          method: 'post',
          params: this.$http.adornParams({
            'bdTeacherId': this.bdTeacherId
          })
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/business/teachermultimedia/update'),
            method: 'post',
            data: this.$http.adornData({
              'id': id,
              'flag': 11
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '修改成功',
                type: 'success',
                duration: 1500
              })
              this.init(this.bdOrgId, this.bdTeacherId, 1) // 更新完毕，刷新列表
            } else {
              this.$message.error(data.msg)
            }
          })
        })
      },
      // 视频上传的相关事件
      beforeVideoUpload (file) {
        const isVideo = ['video/mp4', 'video/flv', 'video/avi', 'video/rmvb'].indexOf(file.type) >= 0
        const isLt10M = file.size / 1024 / 1024 < 10

        if (!isVideo) {
          this.$message.error('上传视频只能是 mp4、flv、avi、rmvb 等格式!')
        }
        if (!isLt10M) {
          this.$message.error('上传视频大小不能超过 10MB!')
        }

        this.num++

        return isVideo && isLt10M
      },
      handleVideoExceed (files, fileList) {
        this.$message.warning('上传不能超过5个！')
      },
      handleVideoSuccess (response, file, fileList) {
        this.fileList = fileList
        this.successNum++
        if (response && response.code === 0) {
          if (this.num === this.successNum) {
            this.$confirm('操作成功, 是否继续操作?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.init(this.bdOrgId, this.bdTeacherId, 2) // 点击确定后，刷新列表
            }).catch(() => {
              this.visible = false
            })
          }
        } else {
          this.$message.error(response.msg)
        }
      },
      handleVideoError (err, file, fileList) {
        this.$message.error(err)
      },
      handleVideoRemove (file, fileList) {
        if (file.status === 'success') {
          // console.log(file, fileList)
          this.$http({
            url: this.$http.adornUrl('/business/teachermultimedia/deleteFromOss'),
            method: 'post',
            params: this.$http.adornParams({
              'id': file.id,
              'objectName': file.objectName,
              'bdOrgId': this.bdOrgId
            })
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '成功删除',
                type: 'success',
                duration: 1500
              })
              this.init(this.bdOrgId, this.bdTeacherId, 2) // 删除成功，刷新列表
            } else {
              this.$message.error(data.msg)
            }
          })
        }
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
