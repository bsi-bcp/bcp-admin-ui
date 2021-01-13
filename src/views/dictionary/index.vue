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
      <template slot="oper" slot-scope="scope">
        <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>
        <el-button size="mini" type="text" @click="openRow(scope.value)">属性</el-button>
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
    <!--新增/编辑propList界面-->
    <el-dialog width="50%" :title="subPropListFormData.id?'编辑':'新增'" :visible.sync="dialogPropListFormVisible">
      <el-form ref="subPropListFormData" :model="subPropListFormData" :rules="subPropListFormDataRule" class="subFormData" label-width="100px">
        <el-form-item label="属性名" prop="propkey">
          <el-input v-model="subPropListFormData.propkey" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="属性值" prop="propvalue">
          <el-input v-model="subPropListFormData.propvalue" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="序号" prop="orderNo">
          <el-input v-model="subPropListFormData.orderNo" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="分组" prop="group">
          <el-input v-model="subPropListFormData.group" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="subPropListFormData.remark" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="状态" prop="enable">
          <el-radio-group v-model="subPropListFormData.enable">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogPropListFormVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subPropListForm('subPropListFormData')">确 定</el-button>
      </div>
    </el-dialog>
    <!--行表页面-->
    <el-dialog width="80%" :title="dialogRowTitle" :visible.sync="dialogRowVisible">
      <div>
        <el-button
          size="mini"
          type="primary"
          @click="addTemp"
        >新增</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="handleDelete(0,0)"
        >批量删除</el-button>
      </div>
      <el-table
        :header-cell-style="{background:'#fafafa',color:'#606266'}"
        class="template-list"
        :data="rowTableData"
        style="width: 100%;margin-top:15px;"
        @selection-change="changePropListSelect"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column label="唯一标识key">
          <template slot-scope="scope">
            <div v-if="!scope.row.editing">
              <span>{{ scope.row.propkey }}</span>
            </div>
            <div v-else>
              <el-input v-model="scope.row.propkey" placeholder="唯一标识" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="属性值">
          <template slot-scope="scope">
            <div v-if="!scope.row.editing">
              <span>{{ scope.row.propvalue }}</span>
            </div>
            <div v-else>
              <el-input v-model="scope.row.propvalue" placeholder="属性值" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template slot-scope="scope">
            <div v-if="!scope.row.editing">
              <span>{{ scope.row.orderNo }}</span>
            </div>
            <div v-else>
              <el-input v-model="scope.row.orderNo" type="number" placeholder="排序" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分组">
          <template slot-scope="scope">
            <div v-if="!scope.row.editing">
              <span>{{ scope.row.group }}</span>
            </div>
            <div v-else>
              <el-input v-model="scope.row.group" placeholder="分组" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template slot-scope="scope">
            <div v-if="!scope.row.editing">
              <span>{{ scope.row.remark }}</span>
            </div>
            <div v-else>
              <el-input v-model="scope.row.remark" placeholder="备注" />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div v-if="!scope.row.editing">
              <span>{{ scope.row.enable ? '启用':'禁用' }}</span>
            </div>
            <div v-else>
              <el-select v-model="scope.row.enable" placeholder="状态">
                <el-option v-for="(item,index) in enableList" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <div class="operate-groups">
              <el-button
                v-if="!scope.row.editing"
                type="text"
                size="mini"
                @click="handleEdit(scope.$index, scope.row)"
              >编辑
              </el-button>
              <el-button
                v-if="scope.row.editing"
                type="text"
                size="mini"
                @click="handleSave(scope.$index, scope.row)"
              >保存
              </el-button>
              <el-button
                v-if="!scope.row.editing"
                size="mini"
                type="text"
                @click="handleDelete(scope.$index, scope.row)"
              >删除
              </el-button>
              <el-button
                v-if="scope.row.editing"
                size="mini"
                type="text"
                @click="handleCancel(scope.$index, scope.row)"
              >取消
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/dictionary'

export default {
  data() {
    return {
      enableList: [
        { label: '启用', value: true },
        { label: '禁用', value: false }
      ],
      tempList: [],
      dialogRowVisible: false,
      dialogFormVisible: false,
      dialogPropListFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
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
        enable: null
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
      originRowTableData: [],
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
  },
  mounted() {},
  methods: {
    // 编辑
    handleEdit($index, row) {
      this.$set(this.rowTableData[$index], 'editing', true)
    },
    // 保存
    handleSave($index, row) {
      this.rowTableData[$index].createTime = null
      this.rowTableData[$index].lastUpdateTime = null
      api.submitPropListForm(this.rowTableData[$index]).then(res => {
        if (res.msg) {
          this.$message.warning(res.msg)
        } else {
          this.$message.success('保存成功')
          this.$set(this.rowTableData[$index], 'editing', false)
          this.openRow({ id: this.rowData.id })
        }
      }).catch(() => {})
    },
    // 取消
    handleCancel($index, row) {
      this.$set(this.rowTableData[$index], 'editing', false)
      if (!this.rowTableData[$index].id) {
        this.rowTableData.splice($index, 1)
      } else {
        this.$set(this.rowTableData[$index], 'propkey', this.originRowTableData[$index].propkey)
        this.$set(this.rowTableData[$index], 'propvalue', this.originRowTableData[$index].propvalue)
        this.$set(this.rowTableData[$index], 'orderNo', this.originRowTableData[$index].orderNo)
        this.$set(this.rowTableData[$index], 'group', this.originRowTableData[$index].group)
        this.$set(this.rowTableData[$index], 'remark', this.originRowTableData[$index].remark)
        this.$set(this.rowTableData[$index], 'enable', this.originRowTableData[$index].enable)
      }
    },
    // 新增一条模板数据
    addTemp() {
      // debugger
      this.rowTableData = this.rowTableData || []
      this.rowTableData.push({
        id: null,
        propId: this.rowData.id,
        propkey: null,
        propvalue: null,
        orderNo: 1,
        group: 1,
        remark: null,
        enable: true,
        editing: true
      })
    },
    // 删除
    handleDelete($index, row) {
      let items = []
      if (!row) {
        for (var index = this.selectionPropList.length - 1; index >= 0; index--) {
          if (!this.selectionPropList[index].id) {
            this.selectionPropList.splice(index, 1)
          }
        }
        if (!this.selectionPropList.length) {
          this.$message.info('请选择相关数据')
          return
        }
        // items = collectParam(this.selectionPropList, 'id')
        items = this.datas.selectionPropList.map((value) => {
          return value['id']
        })
      } else {
        if (!row.id) {
          this.$message.info('请选择有效数据')
          return
        }
        items.push(row.id)
      }
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
        .catch((e) => {
          if (e !== 'cancel') {
            this.$message.error({
              message: '删除失败'
            })
          }
        })
    },
    // 行表表格选择
    changePropListSelect(val) {
      this.selectionPropList = val
    },
    // 展示行表数据
    openRow(row) {
      if (row.name) {
        this.dialogRowTitle = '数据字典详情--' + row.name
      }
      this.rowData = row
      api.getPropListByPropId(row.id).then(res => {
        this.rowTableData = res.model
        this.originRowTableData = JSON.parse(JSON.stringify(res.model))
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
        .catch((e) => {
          if (e !== 'cancel') {
            this.$message.error({
              message: '删除失败'
            })
          }
        })
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
          return false
        }
      })
    },
    // 新增或编辑页面
    edit(row) {
      this.dialogFormVisible = true
      if (!row) {
        this.$set(this, 'subFormData', {
          'name': null,
          'code': null,
          'remark': null,
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
    getOrgList() {

    },
    getOrgId(orgName) {

    }
  }
}
</script>

<style lang="scss" scoped>

</style>
