<template>
  <div class="login-container">
    <div class="background">
      <img :src="imgSrc" width="100%" height="100%" alt="" />
    </div>
    <div class="title-container">
        <div class="title">
          BCP Cloud后台管理
        </div>
    </div>
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form " auto-complete="on" label-position="left">
      <el-row :gutter="20" style="margin-top:5px;">
      <el-col :span="12">
        <!-- 公司图标 -->
        <div class="CompanyLogos">
          <img :src="imgSrc2" width="100%" height="100%" alt="" />
        </div>
      </el-col>
      <el-col :span="12"  style="padding-top: 78px;">
        <el-form-item prop="uname" class="ef-fore">
          <!-- 用户名 -->
          <span class="svg-container">
            <svg-icon icon-class="user" class="svgstyle" />
          </span>
          <el-input
            ref="uname"
            v-model="loginForm.uname"
            placeholder="用户名"
            name="uname"
            type="text"
            tabindex="1"
            auto-complete="on"
            class="unamestyle"
          />
        </el-form-item>

        <el-form-item prop="password" class="ef-fore">
          <span class="svg-container">
            <svg-icon icon-class="password" class="svgstyle"/>
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="密码"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
            class="unamestyle"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon  :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" class="showPwdstyle"/>
          </span>
        </el-form-item>

        <el-button :loading="loading" type="primary" style="width:108%;margin-bottom:30px;" @click.native.prevent="handleLogin">
          登录
        </el-button>
      </el-col>
      </el-row>

    </el-form>
    <div class="copyright-container">
        <div class="copyright">
          Copyright@2017-2021 深圳市商软信息科技有限公司 版权所有
        </div>
    </div>

    <el-dialog width="30%" title="修改密码" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="140px">
        <el-form-item label="旧密码：" prop="oldPassword">
          <el-input v-model="subFormData.oldPassword" type="password" size="mini" auto-complete="off" class="input-width" />
        </el-form-item>
        <el-form-item label="新密码：" prop="newPassword">
          <el-input v-model="subFormData.newPassword" type="password" size="mini" auto-complete="off" class="input-width" />
        </el-form-item>
        <el-form-item label="确认密码：" prop="confirmPassword">
          <el-input v-model="subFormData.confirmPassword" type="password" size="mini" auto-complete="off" class="input-width" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="subForm('subFormData')">提交</el-button>
          <el-button size="mini" @click="resetForm('subFormData')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import md5 from 'js-md5'
import * as pwdApi from '@/api/password'
import * as userApi from '@/api/user'

export default {
  name: 'Login',
  data() {
    const validateNewPassword = (rule, value, callback) => {
      if (!value || value.length < this.passwordStrategy.chars || value.length > 16) {
        callback(new Error('密码长度要在' + this.passwordStrategy.chars + '到16位之间'))
      }
      if (this.passwordStrategy.strongFlag) {
        if (!/[0-9]{1,}/.test(value)) {
          callback(new Error('密码要包含数字'))
        }
        if (!/[A-Z]{1,}/.test(value)) {
          callback(new Error('密码要包含大写字母'))
        }
        if (!/[a-z]{1,}/.test(value)) {
          callback(new Error('密码要包含小写字母'))
        }
      } else {
        if (this.passwordStrategy.containsDigits) {
          if (!/[0-9]{1,}/.test(value)) {
            callback(new Error('密码要包含数字'))
          }
        }
        if (this.passwordStrategy.containsUpper) {
          if (!/[A-Z]{1,}/.test(value)) {
            callback(new Error('密码要包含大写字母'))
          }
        }
        if (this.passwordStrategy.containsLower) {
          if (!/[a-z]{1,}/.test(value)) {
            callback(new Error('密码要包含小写字母'))
          }
        }
      }
      if (value === this.subFormData.oldPassword) {
        callback(new Error('新密码不能与旧密码相同'))
      }
      callback()
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.subFormData.newPassword) {
        callback(new Error('确认密码与新密码不一致'))
      }
      callback()
    }
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('用户名不能为空'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error('密码不能为空'))
      } else {
        callback()
      }
    }
    return {
      imgSrc: require('../../img/bgcImage.jpg'),
      imgSrc2: require('../../img/bgcImage1.jpg'),
      passwordStrategy: {
        strongFlag: null,
        chars: null,
        // defaultPwd: null,
        containsDigits: null,
        containsUpper: null,
        containsLower: null
      },
      dialogFormVisible: false,
      subFormData: {
        oldPassword: null,
        newPassword: null,
        confirmPassword: null
      },
      subFormDataRule: {
        oldPassword: [{ required: true, message: '请填写旧密码' }],
        newPassword: [{ required: true, trigger: 'blur', validator: validateNewPassword }],
        confirmPassword: [{ required: true, trigger: 'blur', validator: validateConfirmPassword }]
      },
      loginForm: {
        uname: '',
        password: ''
      },
      loginRules: {
        uname: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.getPasswordStrategy()
  },
  methods: {
    // 重置
    resetForm() {
      this.subFormData = {}
    },
    subForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          this.$set(this.subFormData, 'uName', this.loginForm.uname)
          userApi.modifyPassword(this.subFormData).then(res => {
            this.$message.success('修改成功')
            this.dialogFormVisible = false
          }).catch(e => {})
        } else {
          return false
        }
      })
    },
    getPasswordStrategy() {
      pwdApi.getDetail().then(res => {
        this.passwordStrategy = res.model
      })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const userInfo = Object.assign({}, this.loginForm)
          userInfo.password = md5(userInfo.password)
          this.$store.dispatch('user/login', userInfo).then(res => {
            if (res.code === 552) {
              this.$confirm(res.msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                this.dialogFormVisible = true
                this.loading = false
              }).catch(() => {
                this.loading = false
              })
            } else {
              this.$router.push({ path: this.redirect || '/' })
              this.loading = false
            }
          }).catch((e) => {
            this.loading = false
          })
        } else {
          console.log('登录失败!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">

// $bg:#283443;
$light_gray:#000;
$cursor: #000000;



@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .login-form .el-input input {
    color: $cursor;
    height: 45px;
    margin-top: -5px;
    width: 271px;
  }
}

.background{
    width:100%;
    height:100%;
    z-index:-1;
    position: absolute;
}

/* reset element-ui css */
.login-container {
  background: url('../../img/bgcImage.jpg') no-repeat;
  background-size: cover;
  .login-form .el-input {
    display: inline-block;
    height: 45px;
    width: 84%;

    input {
      // background: transparent;
      background-color: #fff;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 15px 5px 12px 15px;
      color: $light_gray;
      height: 46px;
      caret-color: $cursor;

      &:-webkit-autofill {
        // box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .login-form .el-form-item {
    border-radius: 5px;
    border: 1px solid #c3c3c3;
    color: #666;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.ef-fore{
  width: 376px;
  height: 48px;
  border: 1px solid #c3c3c3;
  color: #666;
}
.ef-fore:hover{
  width: 376px;
  height: 48px;
  border: 1px solid #000000;
  color: #666;
}
.ef-fore:active{
  width: 376px;
  height: 48px;
  border: 1px solid #000000;
  color: #666;
}
.ef-fore:focus{
  width: 376px;
  height: 48px;
  border: 1px solid #000000;
  color: #666;
}


.unamestyle{
      display: inline-block;
      font-size: 14px;
      height: 56px;
      width: 83%;
      padding-left: 22px;
      padding-top: 5px;  
  } 

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 50px;
    margin: 0 auto;
    overflow: hidden;
    background-color: #FFFFFF;
    width: 820px;
    height: 450px;
    top: -40px;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svgstyle{
    width: 2em;
  }
  .showPwdstyle{
    width: 20px;
    margin-top: 0px;
    margin-right: 5px;
  }
  .svg-container {
    padding: 0px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
    font-size: 36px;
    color: #fff;
    margin: 55px auto 70px auto;
    text-align: center;
    }
  }
  .copyright-container {
    position: relative;

    .copyright {
    font-size: 12px;
    color: #2d2727;
    margin: -18px auto 70px auto;
    text-align: center;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
