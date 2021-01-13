<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
        <el-button type="primary" size="mini" @click="remove(0)">删除</el-button>
      </template>
      <template slot="enable" slot-scope="scope">
        <span>{{ scope.value.enable ? '启用' : '禁用' }}</span>
      </template>
      <template slot="oper" slot-scope="scope">
        <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>
      </template>
    </mod-filter>
    <!--新增/编辑界面-->
    <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="100px">
        <el-form-item label="租户" prop="sourceType">
          <el-select v-model="subFormData.tenantId" size="mini">
            <el-option v-for="(optItem,optindex) in tenants" :key="optindex" :label="optItem.name" :value="optItem.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="subFormData.name" maxlength="100" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="subFormData.code" maxlength="20" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="节点id" prop="nodeId">
          <el-input v-model="subFormData.nodeId" maxlength="50" size="mini" auto-complete="off"
                    onkeyup="this.value=this.value.replace(/[^\d.]/g,'')"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="subFormData.remark" maxlength="500" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="状态" prop="enable">
          <el-radio-group v-model="subFormData.enable">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
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
import * as api from '@/api/frontComputer'

export default {
  data() {
    return {
      tenants: [],
      dialogFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      rowData: {
        id: null,
        name: null,
        code: null,
        remark: null,
        tenantId: null,
        nodeId: null,
        enable: null
      },
      subFormData: {
        id: null,
        name: null,
        code: null,
        remark: null,
        tenantId: null,
        nodeId: null,
        enable: null
      },
      subFormDataRule: {
        'name': [{
          required: true,
          message: '请填写名称'
        }],
        'code': [{
          required: true,
          message: '请填写编码'
        }],
        'tenantId': [{
          required: true,
          message: '请填写租户'
        }],
        'nodeId': [{
          required: true,
          message: '请填写节点id'
        }],
        'enable': [{
          required: true,
          message: '请选择状态'
        }]
      },
      tableData: [],
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
            prop: 'tenant',
            conditionshow: true,
            filedShow: true,
            label: '租户',
            placeholder: '租户',
            optList: []
          },
          {
            type: 'input',
            prop: 'name',
            conditionshow: true,
            filedShow: true,
            label: '名称',
            placeholder: '名称',
            optList: []
          },
          {
            type: 'input',
            prop: 'code',
            conditionshow: true,
            filedShow: true,
            label: '编码',
            placeholder: '编码',
            optList: []
          },
          {
            type: 'input',
            prop: 'nodeId',
            conditionshow: true,
            filedShow: true,
            label: '节点id',
            placeholder: '节点id',
            optList: []
          },
          {
            type: 'input',
            prop: 'remark',
            conditionshow: true,
            filedShow: true,
            label: '备注',
            placeholder: '备注',
            optList: []
          },
          {
            type: 'select',
            prop: 'enable',
            conditionshow: true,
            filedShow: true,
            slot: true,
            label: '状态',
            placeholder: '状态',
            optList: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]
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
  async created() {
    this.getTenants()
  },
  mounted() {
  },
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
        .catch(() => {
        })
    },
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
          return false
        }
      })
    },
    // 新增或编辑页面
    edit(row) {
      this.dialogFormVisible = true
      if (!row) {
        debugger
        this.$set(this, 'subFormData', {
          'name': null,
          'code': null,
          'number': null,
          'remark': null,
          'tenantId': null,
          'nodeId': null,
          'enable': true
        })
        if (this.$refs['subFormData']) {
          this.$refs['subFormData'].resetFields()
        }
        return
      }
      this.$set(this.subFormData, 'id', row.id)
      this.$set(this.subFormData, 'name', row.name)
      this.$set(this.subFormData, 'code', row.code)
      this.$set(this.subFormData, 'remark', row.remark)
      this.$set(this.subFormData, 'tenantId', row.tenantId)
      this.$set(this.subFormData, 'nodeId', row.nodeId)
      this.$set(this.subFormData, 'enable', row.enable)
    },
    getData(datas = this.datas) {
      this.$set(this, 'datas', datas)
      this.$set(this, 'params', datas.params)
      this.$set(this.datas.table, 'loading', true)
      this.$set(this.params, 'orgId', this.params.orgName)
      api.getPage(this.params).then(res => {
        this.$set(this.datas.resData, 'rows', res.model)
        this.$set(this.datas.params, 'currentPage', res.currentPage)
        this.$set(this.datas.params, 'pageSize', res.pageSize)
        this.$set(this.datas.resData, 'totalCount', res.totalCount)
        this.$set(this.datas.table, 'loading', false)
      })
    },
    getTenants() {
      api.getTenants().then(res => {
        this.tenants = res.model
      }).catch(e => {
        return false
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
