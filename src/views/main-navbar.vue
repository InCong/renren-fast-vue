<template>
  <nav class="site-navbar" :class="'site-navbar--' + navbarLayoutType">
    <div class="site-navbar__header">
      <h1 class="site-navbar__brand" @click="$router.push({ name: 'home' })">
        <a class="site-navbar__brand-lg" href="javascript:">教务管理系统</a>
        <a class="site-navbar__brand-mini" href="javascript:">教务</a>
      </h1>
    </div>
    <div class="site-navbar__body clearfix">
      <el-menu
        class="site-navbar__menu"
        mode="horizontal"
      >
        <el-menu-item class="site-navbar__switch" index="0" @click="sidebarFold = !sidebarFold">
          <icon-svg name="zhedie" />
        </el-menu-item>
      </el-menu>
      <el-menu
        class="site-navbar__menu site-navbar__menu--right"
        mode="horizontal"
      >
        <el-menu-item index="1" @click="$router.push({ name: 'theme' })">
          <template slot="title">
            <!--            <el-badge value="new">-->
            <icon-svg name="shezhi" class="el-icon-setting" />
            <a>设置</a>
            <!--            </el-badge>-->
          </template>
        </el-menu-item>
        <!--        <el-menu-item index="2">-->
        <!--          <el-badge value="hot">-->
        <!--            <a href="//www.renren.io/" target="_blank">官方社区</a>-->
        <!--          </el-badge>-->
        <!--        </el-menu-item>-->
        <!--        <el-submenu index="3">-->
        <!--          <template slot="title">Git源码</template>-->
        <!--          <el-menu-item index="2-1"><a href="//github.com/daxiongYang/renren-fast-vue" target="_blank">前端</a></el-menu-item>-->
        <!--          <el-menu-item index="2-2"><a href="//git.oschina.net/renrenio/renren-fast" target="_blank">后台</a></el-menu-item>-->
        <!--          <el-menu-item index="2-3"><a href="//git.oschina.net/renrenio/renren-generator" target="_blank">代码生成器</a></el-menu-item>-->
        <!--        </el-submenu>-->
        <el-menu-item class="site-navbar__avatar" index="3">
          <el-dropdown :show-timeout="0" placement="bottom">
            <span class="el-dropdown-link">
              <img src="~@/assets/img/avatar.png" :alt="userName">{{ userName }}（{{ orgName }}）
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="addOrUpdateHandle()">
                个人设置
              </el-dropdown-item>
              <el-dropdown-item @click.native="updatePasswordHandle()">
                修改密码
              </el-dropdown-item>
              <!--              <el-dropdown-item @click.native="bindingWXHandle()">绑定微信</el-dropdown-item>-->
              <el-dropdown-item @click.native="logoutHandle()">
                退出
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 弹窗, 修改个人信息 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" />
    <!-- 弹窗, 修改密码 -->
    <update-password v-if="updatePassowrdVisible" ref="updatePassowrd" />
    <!-- 弹窗, 绑定微信 -->
    <!--    <binding-WX v-if="bindingWXVisible" ref="bindingWX"></binding-WX>-->
  </nav>
</template>

<script>
  import UpdatePassword from './main-navbar-update-password'
  import AddOrUpdate from './main-user-update'
  // import BindingWX from './main-navbar-bindingWX'
  import { clearLoginInfo } from '@/utils'
  export default {
    components: {
      UpdatePassword,
      AddOrUpdate
      // BindingWX
    },
    data () {
      return {
        updatePassowrdVisible: false,
        addOrUpdateVisible: false
        // bindingWXVisible: false
      }
    },
    computed: {
      navbarLayoutType: {
        get () { return this.$store.state.common.navbarLayoutType }
      },
      sidebarFold: {
        get () { return this.$store.state.common.sidebarFold },
        set (val) { this.$store.commit('common/updateSidebarFold', val) }
      },
      mainTabs: {
        get () { return this.$store.state.common.mainTabs },
        set (val) { this.$store.commit('common/updateMainTabs', val) }
      },
      userName: {
        get () { return this.$store.state.user.name },
        set (val) { this.$store.commit('user/updateName', val) }
      },
      userId: {
        get () { return this.$store.state.user.id }
      },
      orgName: {
        get () { return this.$store.state.user.orgName }
      }
      // headImgUrl: {
      //   get () { return this.$store.state.user.headImgUrl }
      // }
    },
    methods: {
      // 修改个人信息
      addOrUpdateHandle () {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(this.$store.state.user.id)
        })
      },
      // 修改密码
      updatePasswordHandle () {
        this.updatePassowrdVisible = true
        this.$nextTick(() => {
          this.$refs.updatePassowrd.init()
        })
      },
      // 退出
      logoutHandle () {
        this.$confirm(`确定进行[退出]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/sys/logout'),
            method: 'post',
            data: this.$http.adornData()
          }).then(({data}) => {
            if (data && data.code === 0) {
              clearLoginInfo()
              this.$router.push({ name: 'login' })
            }
          })
        }).catch(() => {})
      }
      // 绑定微信用户，不在这里做微信绑定
      // bindingWXHandle: function () {
      //   this.$http({
      //     url: this.$http.adornUrl('/business/student/getOpenId'),
      //     method: 'post',
      //     data: this.$http.adornData()
      //   }).then(({data}) => {
      //     if (data && data.code === 0) {
      //       if (data.openId) {
      //         this.$message({
      //           message: '已绑定微信，无需再次绑定！',
      //           type: 'warning',
      //           duration: 1500
      //         })
      //       } else {
      //         this.$http({
      //           url: this.$http.adornUrl('/business/student/getQrCodeUrl'),
      //           method: 'post',
      //           data: this.$http.adornData()
      //         }).then(({data}) => {
      //           if (data && data.code === 0) {
      //             if (data.url) {
      //               this.$message({
      //                 message: '成功获取微信二维码Url！',
      //                 type: 'sucess',
      //                 duration: 1500
      //               })
      //               this.bindingWXVisible = true
      //               this.$nextTick(() => {
      //                 this.$refs.bindingWX.init(data.url)
      //               })
      //             } else {
      //               this.$message({
      //                 message: '获取失败！',
      //                 type: 'error',
      //                 duration: 1500
      //               })
      //             }
      //           }
      //         })
      //       }
      //     }
      //   })
      // }
    }
  }
</script>
