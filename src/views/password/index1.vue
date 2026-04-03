<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
        <el-button type="primary" size="mini" @click="remove(0)">删除</el-button>
      </template>
      <template slot="strongFlag" slot-scope="scope">
        <span>{{ scope.value.strongFlag?'是':'否' }}</span>
      </template>
      <template slot="containsDigits" slot-scope="scope">
        <span>{{ scope.value.containsDigits?'是':'否' }}</span>
      </template>
      <template slot="containsUpper" slot-scope="scope">
        <span>{{ scope.value.containsUpper?'是':'否' }}</span>
      </template>
      <template slot="containsLower" slot-scope="scope">
        <span>{{ scope.value.containsLower?'是':'否' }}</span>
      </template>
      <template slot="enable" slot-scope="scope">
        <span>{{ scope.value.enable?'启用':'禁用' }}</span>
      </template>
      <template slot="oper" slot-scope="scope">
        <!-- <el-button size="mini" type="text" @click="openRow(scope.value)">行表</el-button> -->
        <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>
      </template>
    </mod-filter>
    <!--新增/编辑界面-->
    <el-dialog width="35%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="120px">
        <el-form-item label="密码位数：" prop="chars">
          <el-input v-model="subFormData.chars" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="错误次数：" prop="errorTimes">
          <el-input v-model="subFormData.errorTimes" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="初始密码：" prop="defaultPwd">
          <el-input v-model="subFormData.defaultPwd" size="mini" auto-complete="off" />
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ModFilter from '../../components/ModFilter/index.vue'
import * as api from '@/api/password'
import * as menuApi from '@/api/menu'
import { collectParam } from '../../utils'

export default {
  components: {
    'mod-filter': ModFilter
  },
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
      subPropListFormData: {
        id: null,
        propId: null,
        propkey: null,
        propvalue: null,
        orderNo: null,
        group: null,
        remark: null,
        enable: null
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
        pageSize: 20
      },
      datas: {
        multipleSelection: [],
        params: {
          currentPage: 1,
          pageSize: 20
        },
        table: {
          selection: true,
          loading: true
        },
        resData: {
          rows: [],
          pageSize: 20,
          currentPage: 1,
          totalCount: 0
        },
        filterList: [
          {
            type: 'select',
            prop: 'strongFlag',
            conditionshow: true,
            filedShow: true,
            slot: true,
            label: '是否强密码',
            placeholder: '是否强密码',
            optList: [{ label: '是', value: true }, { label: '否', value: false }]
          },
          {
            type: 'input',
            prop: 'chars',
            conditionshow: true,
            filedShow: true,
            label: '密码位数',
            placeholder: '密码位数',
            optList: []
          },
          {
            type: 'input',
            prop: 'errorTimes',
            conditionshow: false,
            filedShow: true,
            label: '错误次数',
            placeholder: '错误次数',
            optList: []
          },
          {
            type: 'input',
            prop: 'defaultPwd',
            conditionshow: false,
            filedShow: true,
            label: '初始密码',
            placeholder: '初始密码',
            optList: []
          },
          {
            type: 'select',
            prop: 'containsDigits',
            conditionshow: true,
            filedShow: true,
            slot: true,
            label: '包含数字',
            placeholder: '包含数字',
            optList: [{ label: '是', value: true }, { label: '否', value: false }]
          },
          {
            type: 'select',
            prop: 'containsUpper',
            conditionshow: true,
            filedShow: true,
            slot: true,
            label: '包含大写字母',
            placeholder: '包含大写字母',
            optList: [{ label: '是', value: true }, { label: '否', value: false }]
          },
          {
            type: 'select',
            prop: 'containsLower',
            conditionshow: true,
            filedShow: true,
            slot: true,
            label: '包含小写字母',
            placeholder: '包含小写字母',
            optList: [{ label: '是', value: true }, { label: '否', value: false }]
          },
          {
            type: 'input',
            prop: 'orgClassId',
            conditionshow: false,
            filedShow: false,
            label: '租户',
            placeholder: '租户',
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
    // 行表表格选择
    changePropListSelect(val) {
      this.selectionPropList = val
    },
    // 删除行表数据
    removePropList(row) {
      const items = [row.id]
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.batchDeletePropList({
            'items': items
          }).then(res => {
            this.$message.success({
              message: '删除成功'
            })
            this.openRow({ id: this.rowData.id })
          })
        })
        .catch(() => {
          this.$message.error({
            message: '删除失败'
          })
        })
    },
    // 提交行表数据
    subPropListForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          api.submitPropListForm(this[formData]).then(res => {
            if (res.msg) {
              this.$message.warning(res.msg)
            } else {
              this.$message.success('保存成功')
              this.openRow({ id: this.rowData.id })
              this.dialogPropListFormVisible = false
            }
          }).catch(() => {
          })
        } else {
          return false
        }
      })
    },
    // 新增/编辑行表数据
    editPropList(row) {
      this.dialogPropListFormVisible = true
      if (!row) {
        this.$set(this, 'subPropListFormData', {
          propId: this.rowData.id,
          propkey: null,
          propvalue: null,
          orderNo: null,
          group: null,
          remark: null,
          enable: true
        })
        this.$nextTick(() => {
          this.$refs['subPropListFormData'].resetFields()
        })
        return
      }
      this.$set(this.subPropListFormData, 'id', row.id)
      this.$set(this.subPropListFormData, 'propId', row.propId)
      this.$set(this.subPropListFormData, 'propkey', row.propkey)
      this.$set(this.subPropListFormData, 'propvalue', row.propvalue)
      this.$set(this.subPropListFormData, 'orderNo', row.orderNo)
      this.$set(this.subPropListFormData, 'group', row.group)
      this.$set(this.subPropListFormData, 'remark', row.remark)
      this.$set(this.subPropListFormData, 'enable', row.enable)
    },
    // 展示行表数据
    openRow(row) {
      this.dialogRowTitle = '数据字典详情--' + row.name
      this.rowData = row
      api.getPropListByPropId(row.id).then(res => {
        this.rowTableData = res.model
      })
      this.dialogRowVisible = true
    },
    // 删除
    remove(row) {
      let items = []
      if (!row) {
        if (!this.datas.multipleSelection.length) {
          this.$message.info('请选择相关数据')
          return
        }
        // items = _.map(this.datas.multipleSelection, 'id')
        items = collectParam(this.datas.multipleSelection, 'id')
      } else {
        items.push(row.id)
      }
      this.subFormData = row
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
          this.$message.error({
            message: '删除失败'
          })
        })
    },
    // 提交
    subForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          if (!this.subFormData.id) {
            api.submitFormAdd(this.subFormData).then(res => {
              this.$message.success('保存成功')
              this.getData(this.datas)
              this.dialogFormVisible = false
            }).catch(() => {
              this.$message({
                type: 'error',
                message: '新增失败'
              })
            })
          } else {
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
          }
        } else {
          return false
        }
      })
    },
    // 新增或编辑页面
    edit(row) {
      this.dialogFormVisible = true
      if (!row) {
        // this.subFormData = Object.assign(this.subFormData)
        this.$set(this, 'subFormData', {
          'strongFlag': true,
          'containsDigits': true,
          'containsUpper': true,
          'containsLower': true,
          'enable': true
        })
        // this.$nextTick(() => {
        //   this.$refs['subFormData'].resetFields()
        // })
        return
      }
      this.$set(this, 'subFormData', row)
    },

    getData(datas = this.datas) {
      this.$set(this, 'datas', datas)
      this.$set(this, 'params', datas.params)
      this.$set(this.datas.table, 'loading', true)
      this.$set(this.params, 'orgId', this.params.orgName)
      api.getPsdPage(this.params).then(res => {
        this.$set(this.datas.resData, 'rows', res.model)
        this.$set(this.datas.params, 'currentPage', res.currentPage)
        this.$set(this.datas.params, 'pageSize', res.pageSize)
        this.$set(this.datas.resData, 'totalCount', res.totalCount)
        this.$set(this.datas.table, 'loading', false)
      })
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
      return menuApi.getMenuTree().then(res => {
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

