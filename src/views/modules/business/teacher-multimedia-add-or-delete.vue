<template>
  <el-dialog
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-tabs v-model="activeName" @tab-click="handleTabClick" type="border-card">
      <el-tab-pane label="图片上传" name="pictureUpload">
        <el-upload
          ref="upload"
          action="111"
          list-type="picture-card"
          :file-list="pictureFileList"
          :auto-upload="false"
          :http-request="uploadFile"
          :on-preview="handlePictureCardPreview"
          :on-remove="handlePictureRemove"
          :on-exceed="handlePictureExceed"
          :on-success="handlePictureSuccess"
          :on-error="handlePictureError"
          :before-upload="beforePictureUpload">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-button type="primary" @click="pictureSubmit()">确认上传</el-button>
        <el-dialog :visible.sync="previewDialogVisible" append-to-body>
          <img width="100%" :src="previewDialogImageUrl" alt="">
          <label>{{previewDialogImageUrl}}</label>
        </el-dialog>
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
        visible: false,
        activeName: 'pictureUpload',
        previewDialogImageUrl: '',
        previewDialogVisible: false,
        pictureFileList: [{name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}, {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}],
        pictureFileData: ''
      }
    },
    methods: {
      init (id) {
        this.visible = true
        console.log(id + '进来了')
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
        return isJPG && isLt2M
      },
      handlePictureExceed (files, fileList) {
        this.$message.warning('只能选择一个文件！')
      },
      handlePictureSuccess (res, file) {
        this.imageUrl = URL.createObjectURL(file.raw)
      },
      handlePictureError (err, file, fileList) {
        this.$message.error(err)
      },
      uploadFile (file) {
        // console.log(1)
        this.pictureFileData.append('file', file.file)
      },
      pictureSubmit () {
        this.pictureFileData = new FormData()
        console.log(this.pictureFileData)
        this.$refs.upload.submit()
      }
    }
  }
</script>

<style scoped>

</style>
