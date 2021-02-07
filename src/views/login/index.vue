<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
      <div class="title-container">
        <h3 class="title">
          BCP Cloud
        </h3>
      </div>

      <el-form-item prop="uname">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="uname"
          v-model="loginForm.uname"
          placeholder="用户名"
          name="uname"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
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
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">
        登录
      </el-button>
    </el-form>

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

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .login-form .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .login-form .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .login-form .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
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

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
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
