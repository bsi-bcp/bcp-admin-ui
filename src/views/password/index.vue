<template lang="html">
  <div class="app-container">
    <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="140px">
      <el-form-item label="密码位数：" prop="chars">
        <el-input v-model="subFormData.chars" maxlength="50" type="number" size="mini" auto-complete="off" class="input-width" />
      </el-form-item>
      <el-form-item label="错误次数：" prop="errorTimes">
        <el-input v-model="subFormData.errorTimes" maxlength="20" type="number" size="mini" auto-complete="off" class="input-width" />
      </el-form-item>
      <el-form-item label="初始密码：" prop="defaultPwd">
        <el-input v-model="subFormData.defaultPwd" maxlength="100" size="mini" auto-complete="off" class="input-width" />
      </el-form-item>
      <el-form-item label="是否强密码：" prop="strongFlag">
        <el-radio-group v-model="subFormData.strongFlag">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="包含数字：" prop="containsDigits">
        <el-radio-group v-model="subFormData.containsDigits">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="包含大写字母：" prop="containsUpper">
        <el-radio-group v-model="subFormData.containsUpper">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="包含小写字母：" prop="containsLower">
        <el-radio-group v-model="subFormData.containsLower">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否有效：" prop="enable">
        <el-radio-group v-model="subFormData.enable">
          <el-radio :label="true">启用</el-radio>
          <el-radio :label="false">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="subForm('subFormData')">提交</el-button>
        <el-button size="mini" @click="resetForm('subFormData')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import ModFilter from '../../components/ModFilter/index.vue'
import * as api from '@/api/password'
import * as menuApi from '@/api/menu'
import { collectParam } from '../../utils'

export default {
  data() {
    return {
      dialogRowVisible: false,
      dialogFormVisible: false,
      dialogPropListFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      menuList: [],
      rowData: {
        id: null,
        name: null,
        code: null,
        remark: null,
        enable: null
      },
      subFormData: {
      },
      subFormDataRule: {
        'chars': [{
          required: true,
          message: '请填写密码位数'
        }],
        'errorTimes': [{
          required: true,
          message: '请填写错误次数'
        }],
        'defaultPwd': [{
          required: true,
          message: '请填写初始密码'
        }],
        'containsLower': [{
          required: true,
          message: '是否包含小写字母'
        }],
        'enable': [{
          required: true,
          message: '请选择是否有效'
        }]
      },
      params: {
        currentPage: 1,
        pageSize: 20
      }
    }
  },
  created() {
    this.getData()
  },
  mounted() {},
  methods: {
    // 重置
    resetForm() {
      this.subFormData = {}
    },
    // 提交
    subForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          api.submitFormEdit(this.subFormData).then(res => {
            this.$message.success('保存成功')
            this.getData(this.datas)
            this.dialogFormVisible = false
          }).catch(() => {
            this.$message({
              type: 'error',
              message: '修改失败'
            })
          })
        } else {
          return false
        }
      })
    },
    getData() {
      api.getDetail().then(res => {
        this.subFormData = JSON.parse(JSON.stringify(res.model))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-width {
    width: 25%;
  }
</style>

