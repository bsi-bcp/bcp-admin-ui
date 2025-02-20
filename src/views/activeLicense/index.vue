<template lang="html">
  <div class="app-container">
    <el-form ref="subFormData" :model="subFormData" class="subFormData" label-width="140px">
      <el-form-item label="授权码：" prop="license">
        <el-input v-model="subFormData.license" type="text" size="mini" auto-complete="off" class="input-width" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="subForm('subFormData')">激活</el-button>
        <el-button type="primary" size="mini" @click="heatBeat()">检测心跳</el-button>
      </el-form-item>
    </el-form>

    <div>
      <el-table :data="licenseList" :height="650+'px'" class="mt10" :cell-style="{padding:'5px 0px'}"
                :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit
                highlight-current-row style="width: 100%"
      >
        <el-table-column prop="license" :align="left" label="授权码">
          <template slot-scope="scope">
            <span>{{ scope.row.license }}</span>
          </template>
        </el-table-column>
        <el-table-column :align="left" label="授权码状态">
          <template slot-scope="scope">
            <span>{{ scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column :align="left" label="激活时间">
          <template slot-scope="scope">
            <span>{{ scope.row.activateTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :align="left" label="过期时间">
          <template slot-scope="scope">
            <span>{{ scope.row.expireTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :align="left" label="产品标识">
          <template slot-scope="scope">
            <span>{{ scope.row.productId }}</span>
          </template>
        </el-table-column>
        <el-table-column :align="left" label="产品名称">
          <template slot-scope="scope">
            <span>{{ scope.row.productName }}</span>
          </template>
        </el-table-column>
        <el-table-column :align="left" label="云商店订单ID">
          <template slot-scope="scope">
            <span>{{ scope.row.orderId }}</span>
          </template>
        </el-table-column>
        <el-table-column :align="left" label="云商店订单行ID">
          <template slot-scope="scope">
            <span>{{ scope.row.orderLineId }}</span>
          </template>
        </el-table-column>
        <el-table-column :align="left" label="触发场景">
          <template slot-scope="scope">
            <span>{{ scope.row.scene }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

</template>

<script>
import * as liApi from '@/api/license'
export default {
  data() {
    return {
      subFormData: {
        lisence: null
      },
      licenseList: []
    }
  },
  created() {
  },
  mounted() {
    this.getLicenseLog()
  },
  methods: {
    // 重置
    resetForm() {
      this.subFormData = {}
    },
    subForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          liApi.submitForm(this.subFormData).then(res => {
            this.$message.success('激活成功')
            //  刷新列表
            this.getLicenseLog()
            //  this.$refs[formData].resetFields()
          }).catch(e => {})
        } else {
          return false
        }
      })
    },
    getLicenseLog() {
      liApi.getLicenseList().then((res) => {
        this.licenseList = res
      })
    },
    heatBeat() {
      liApi.heatbeat(this.subFormData).then(res => {
        this.$message.success('已发送心跳检测')
        //  刷新列表
        this.getLicenseLog()
      }).catch(e => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-width {
    width: 25%;
  }
</style>

