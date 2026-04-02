<template lang="html">
  <div class="app-container">
     <div class="background" align="center">
      <img :src="loadSrc" alt="" />
      <span style="display:inherit;font-size: 22px;margin-top: 30px">{{msg1}}</span>
      <span style="display:inherit;font-size: 15px;margin-top: 10px">{{msg2}}</span>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/ssoLogin'
export default {
  data() {
    return {
      loadSrc: require('@/img/loading.gif'),
      msg1: '身份认证中',
      msg2: '请勿关闭页面，稍后会进行跳转'
    }
  },
  created() {
    this.ssoLogin()
  },
  methods: {
    ssoLogin(){
      let params = {
        "tenant":this.$route.query.tenant,
        "code":this.$route.query.code
      }
      api.ssoLogin(params).then(res => {
        if (res.code === 500) {
          this.msg1 = '身份认证失败'
          this.msg2 = ''
        } else {
          this.$store.dispatch('user/token', res.msg).then(rs => {
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          })
        }
      }).catch(e => {
        console.error('单点登录失败,错误信息:' + e)
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.background{
    width:100%;
    height:100%;
    z-index:-1;
    position: absolute;
}
</style>

