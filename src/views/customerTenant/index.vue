<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
        <el-button type="primary" size="mini" @click="remove(0)">删除</el-button>
      </template>
      <template slot="oper" slot-scope="scope">
        <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>
      </template>
    </mod-filter>
    <!--新增/编辑界面-->
    <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="100px">
        <el-form-item label="关联客户" prop="bcpTenantId">
          <el-select v-model="subFormData.bcpTenantId" size="mini">
            <el-option v-for="(item,index) in bcpTenantArr" :key="index" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="租户ID" prop="kitTenantId">
          <el-input v-model="subFormData.kitTenantId" maxlength="50" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="租户名称" prop="tenantName">
          <el-input v-model="subFormData.tenantName" maxlength="50" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="租户编码" prop="tenantCode">
          <el-input v-model="subFormData.tenantCode" maxlength="50" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="订单号" maxlength="50" prop="orderId">
          <el-input v-model="subFormData.orderId" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="实例ID" maxlength="50" prop="instanceId">
          <el-input v-model="subFormData.instanceId" size="mini" auto-complete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/customerTenant'

export default {
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name',
        disabled: 'disabled'
      },
      dialogRowVisible: false,
      dialogFormVisible: false,
      dialogPropListFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      curIndex: null,
      bcpTenantArr: [],
      rowData: {
        id: null,
        kitTenantId: null,
        tenantCode: null,
        tenantName: null,
        orderId: null,
        instanceId: null,
        enable: null
      },
      subFormData: {
        id: null,
        bcpTenantId: null,
        kitTenantId: null,
        tenantCode: null,
        tenantName: null,
        orderId: null,
        instanceId: null,
        enable: null
      },
      subFormDataRule: {
        'kitTenantId': [{
          required: true,
          message: '请填写租户ID'
        }]
      },
      tableData: [],
      rowTableData: [],
      params: {
        currentPage: 1,
        pageSize: 10
      },
      datas: {
        multipleSelection: [],
        params: {
          currentPage: 1,
          pageSize: 10
        },
        table: {
          selection: true,
          loading: true
        },
        resData: {
          rows: [],
          pageSize: 10,
          currentPage: 1,
          totalCount: 0
        },
        filterList: [
          {
            type: 'input',
            prop: 'kitTenantId',
            conditionshow: true,
            filedShow: true,
            label: '租户ID',
            placeholder: '租户ID',
            optList: []
          },
          {
            type: 'input',
            prop: 'tenantCode',
            conditionshow: true,
            filedShow: true,
            label: '租户编码',
            placeholder: '租户编码',
            optList: []
          },
          {
            type: 'input',
            prop: 'tenantName',
            conditionshow: true,
            filedShow: true,
            label: '租户名称',
            placeholder: '租户名称',
            optList: []
          },
          {
            type: 'select',
            prop: 'bcpTenantId',
            conditionshow: false,
            filedShow: true,
            label: '客户',
            placeholder: '客户',
            optList: []
          },
          {
            type: 'input',
            prop: 'orderId',
            conditionshow: true,
            filedShow: true,
            label: '订单号',
            placeholder: '订单号',
            optList: []
          },
          {
            type: 'input',
            prop: 'instanceId',
            conditionshow: true,
            filedShow: true,
            label: '实例ID',
            placeholder: '实例ID',
            optList: []
          },
          {
            type: 'input',
            prop: 'oper',
            conditionshow: false,
            filedShow: true,
            isSearchHide: true,
            slot: true,
            label: '操作',
            placeholder: '操作',
            optList: []
          }
        ]
      }
    }
  },
  created() {
    this.getTenantArr()
  },
  mounted() {},
  methods: {
    // 删除
    remove(row) {
      let items = []
      if (!row) {
        if (!this.datas.multipleSelection.length) {
          this.$message.info('请选择相关数据')
          return
        }
        items = this.datas.multipleSelection.map((value) => {
          return value['id']
        })
      } else {
        items.push(row.id)
      }
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.batchDelete({
            'items': items
          }).then(res => {
            this.$message.success({
              message: '删除成功'
            })
            this.getData()
            this.dialogFormVisible = false
          })
        })
        .catch(() => {})
    },
    // 提交
    subForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          api.submitForm(this[formData]).then(res => {
            this.$message.success('保存成功')
            this.getData(this.datas)
            this.dialogFormVisible = false
          }).catch(() => {
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 新增或编辑页面
    edit(row) {
      this.dialogFormVisible = true
      if (!row) {
        this.$set(this, 'subFormData', {
          'kitTenantId': null,
          'tenantCode': null,
          'tenantName': null,
          'orderId': null,
          'instanceId': null
        })
        if (this.$refs['subFormData']) {
          this.$refs['subFormData'].resetFields()
        }
        return
      }
      this.$set(this.subFormData, 'id', row.id)
      this.$set(this.subFormData, 'kitTenantId', row.kitTenantId)
      this.$set(this.subFormData, 'tenantCode', row.tenantCode)
      this.$set(this.subFormData, 'tenantName', row.tenantName)
      this.$set(this.subFormData, 'orderId', row.orderId)
      this.$set(this.subFormData, 'instanceId', row.instanceId)
      this.$set(this.subFormData, 'bcpTenantId', row.bcpTenantId)
    },

    getData(datas = this.datas) {
      this.$set(this, 'datas', datas)
      this.$set(this, 'params', datas.params)
      this.$set(this.datas.table, 'loading', true)
      api.getPage(this.params).then(res => {
        this.$set(this.datas.resData, 'rows', res.model)
        this.$set(this.datas.params, 'currentPage', res.currentPage)
        this.$set(this.datas.params, 'pageSize', res.pageSize)
        this.$set(this.datas.resData, 'totalCount', res.totalCount)
        this.$set(this.datas.table, 'loading', false)
      })
    },
    getTenantArr() {
      api.getTenantList().then(res => {
        this.bcpTenantArr = res.model
        const arr = {}
        res.model.forEach((item, key) => {
          // var tmp = {
          //   'label': item.name,
          //   'value': item.id
          // }
          // arr.push(tmp)
          arr[item.id + ''] = item.name
        })
        this.$set(this.datas.filterList[3], 'conv', arr)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
