<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
        <el-button type="primary" size="mini" @click="remove(0)">删除</el-button>
      </template>
      <template slot="enable" slot-scope="scope">
        <span>{{ scope.value.enable?'启用':'禁用' }}</span>
      </template>
      <template slot="menuList" slot-scope="scope">
        <el-popover
          placement="right"
          trigger="click"
        >
          <el-tree
            :data="scope.value.menuTree"
            show-checkbox
            node-key="id"
            default-expand-all
            :props="defaultProps"
            empty-text="未分配权限"
          />
          <el-button slot="reference" type="text">查看</el-button>
        </el-popover>
        <!--<el-dropdown trigger="click">
          <span class="el-dropdown-link">
            查看<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="(item,index) in scope.value.menuList" :key="index" disabled="disabled">{{ item.name }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>-->
      </template>
      <template slot="oper" slot-scope="scope">
        <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>
      </template>
    </mod-filter>
    <!--新增/编辑界面-->
    <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="subFormData.name" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="subFormData.code" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="菜单权限" prop="menuArr">
          <!--<el-select v-model="subFormData.menuArr" multiple size="5">
            <el-option v-for="(item,index) in menuList" :label="item.label" :value="item.value" :key="index"></el-option>
          </el-select>-->
          <el-cascader
            v-model="subFormData.menuArr"
            style="width: 100%;"
            :options="menuTree"
            :props="{ multiple: true, checkStrictly: false, label: 'name',value: 'id',children: 'children'}"
            clearable
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="subFormData.remark" size="mini" auto-complete="off" />
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
import * as api from '@/api/role'
import * as menuApi from '@/api/menu'

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
      menuList: [],
      menuTree: [],
      rowData: {
        id: null,
        name: null,
        code: null,
        remark: null,
        enable: null
      },
      subFormData: {
        id: null,
        name: null,
        code: null,
        remark: null,
        enable: null,
        menuArr: []
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
        'enable': [{
          required: true,
          message: '请选择状态'
        }]
      },
      subPropListFormDataRule: {
        'propId': [{
          required: true,
          message: '请选择配置主表'
        }],
        'propkey': [{
          required: true,
          message: '请输入唯一标识'
        }],
        'propvalue': [{
          required: true,
          message: '请输入内容'
        }],
        'orderNo': [{
          required: true,
          message: '请输入排序'
        }],
        'enable': [{
          required: true,
          message: '请选择状态'
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
            label: '是否有效',
            placeholder: '是否有效',
            optList: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]
          },
          {
            type: 'input',
            prop: 'menuList',
            conditionshow: false,
            filedShow: true,
            slot: true,
            label: '菜单权限',
            placeholder: '菜单权限',
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
  async created() {
    await this.getOrgList()
    await this.getMenuList()
    await this.getMenuTree()
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
      console.log('新增')
      this.dialogFormVisible = true
      if (!row) {
        this.$set(this, 'subFormData', {
          'name': null,
          'code': null,
          'menuArr': [],
          'remark': null,
          'enable': true
        })
        this.$nextTick(() => {
          this.$refs['subFormData'].resetFields()
        })
        return
      }
      this.$set(this.subFormData, 'id', row.id)
      this.$set(this.subFormData, 'name', row.name)
      this.$set(this.subFormData, 'code', row.code)
      this.$set(this.subFormData, 'menuArr', row.idArr)
      this.$set(this.subFormData, 'remark', row.remark)
      this.$set(this.subFormData, 'enable', row.enable)
    },

    getData(datas = this.datas) {
      this.$set(this, 'datas', datas)
      this.$set(this, 'params', datas.params)
      this.$set(this.datas.table, 'loading', true)
      this.$set(this.params, 'orgId', this.params.orgName)
      api.getPage(this.params).then(res => {
        if(res.model!=null){
          for (var i = 0; i < res.model.length; i++) {
            this.addDisable(res.model[i].menuTree)
          }
        }
        
        this.$set(this.datas.resData, 'rows', res.model)
        this.$set(this.datas.params, 'currentPage', res.currentPage)
        this.$set(this.datas.params, 'pageSize', res.pageSize)
        this.$set(this.datas.resData, 'totalCount', res.totalCount)
        this.$set(this.datas.table, 'loading', false)
      })
    },
    addDisable(treeNode) {
      // debugger
      for (let i = 0; i < treeNode.length; i++) {
        treeNode[i].disabled = true
        if (treeNode[i].children) {
          this.addDisable(treeNode[i].children)
        }
      }
    },
    getOrgList() {

    },
    getOrgId(orgName) {

    },
    getMenuList() {
      return menuApi.listAll().then(res => {
        this.$set(this, 'menuList', [])
        const list = []
        res.model.forEach(function(item, index) {
          list.push({
            label: item.name,
            value: item.id
          })
        })
        this.$set(this, 'menuList', list)
      })
    },
    getMenuTree() {
      return menuApi.getBusinessMenu().then(res => {
        // this.addDisable(res.model)
        this.menuTree = res.model
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
