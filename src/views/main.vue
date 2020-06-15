<template>
  <div
    v-loading.fullscreen.lock="loading"
    class="site-wrapper"
    :class="{ 'site-sidebar--fold': sidebarFold }"
    element-loading-text="拼命加载中"
  >
    <template v-if="!loading">
      <main-navbar />
      <main-sidebar />
      <div class="site-content__wrapper" :style="{ 'min-height': documentClientHeight + 'px' }">
        <main-content />
      </div>
    </template>
  </div>
</template>

<script>
  import MainNavbar from './main-navbar'
  import MainSidebar from './main-sidebar'
  import MainContent from './main-content'
  export default {
    components: {
      MainNavbar,
      MainSidebar,
      MainContent
    },
    data () {
      return {
        loading: true
      }
    },
    computed: {
      documentClientHeight: {
        get () { return this.$store.state.common.documentClientHeight },
        set (val) { this.$store.commit('common/updateDocumentClientHeight', val) }
      },
      sidebarFold: {
        get () { return this.$store.state.common.sidebarFold }
      },
      userId: {
        get () { return this.$store.state.user.id },
        set (val) { this.$store.commit('user/updateId', val) }
      },
      userName: {
        get () { return this.$store.state.user.name },
        set (val) { this.$store.commit('user/updateName', val) }
      },
      headImgUrl: {
        get () { return this.$store.state.user.headImgUrl },
        set (val) { this.$store.commit('user/updateHeadImgUrl', val) }
      },
      bdOrgId: {
        get () { return this.$store.state.user.bdOrgId },
        set (val) { this.$store.commit('user/updateBdOrgId', val) }
      },
      orgName: {
        get () { return this.$store.state.user.orgName },
        set (val) { this.$store.commit('user/updateOrgName', val) }
      }
    },
    created () {
      this.getUserInfo()
      // this.getNickName()
    },
    mounted () {
      this.resetDocumentClientHeight()
    },
    methods: {
      // 重置窗口可视高度
      resetDocumentClientHeight () {
        this.documentClientHeight = document.documentElement['clientHeight']
        window.onresize = () => {
          this.documentClientHeight = document.documentElement['clientHeight']
        }
      },
      // 获取当前管理员信息
      getUserInfo () {
        this.$http({
          url: this.$http.adornUrl('/sys/user/info'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.loading = false
            this.userId = data.user.userId
            this.userName = data.user.username
            this.bdOrgId = data.user.bdOrgId
          }
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl(`/business/org/info/${this.bdOrgId}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            if (data.org) {
              this.orgName = data.org.name
            }
          })
        })
        //   .then(() => {
        //   this.$http({
        //     url: this.$http.adornUrl('/business/student/infoByUserId'),
        //     method: 'get',
        //     params: this.$http.adornParams()
        //   }).then(({data}) => {
        //     if (data && data.student && data.code === 0) {
        //       this.loading = false
        //       this.userName = data.student.nickname ? data.student.nickname : this.userName
        //       this.headImgUrl = data.student.headImgUrl ? data.student.headImgUrl : 'src/assets/img/avatar.png'
        //     } else {
        //       this.loading = false
        //       this.headImgUrl = 'src/assets/img/avatar.png'
        //     }
        //   })
        // })
      }
    }
  }
</script>
