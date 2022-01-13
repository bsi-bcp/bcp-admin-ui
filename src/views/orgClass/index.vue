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
        <el-button size="mini" type="text" @click="editConfig(scope.value.id)">配置</el-button>
         <el-button size="mini" type="text" @click="templateConfig(scope.value.id)">模板</el-button>
        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>
      </template>
    </mod-filter>
    <!--新增/编辑界面-->
    <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="subFormData.name" maxlength="100" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="subFormData.code" maxlength="20" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="最大用户数" prop="number">
          <el-input-number v-model="subFormData.number" :min="0" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="subFormData.phone" maxlength="50" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="subFormData.address" maxlength="200" size="mini" auto-complete="off"/>
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

    <!--配置界面-->
    <el-dialog width="50%" :title="'配置'" :visible.sync="configDialogFormVisible">
      <el-form ref="subConfigFormData" :model="subConfigFormData" :rules="subConfigFormDataRule"
               class="subConfigFormData" label-width="100px"
      >
        <el-form-item label="下发类型" prop="sendType">
          <el-select v-model="subConfigFormData.sendType" style="width:50%">
            <el-option v-for="(optItem,optindex) in typeOptions" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
          </el-select>
        </el-form-item>
         <el-form-item label="下发api地址" prop="url" v-if="subConfigFormData.sendType === 'noiot'">
          <el-input v-model="subConfigFormData.url" maxlength="500" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="项目id" prop="projectId" v-if="subConfigFormData.sendType === 'iot'">
          <el-input v-model="subConfigFormData.projectId" maxlength="50" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName" v-if="subConfigFormData.sendType === 'iot'">
          <el-input v-model="subConfigFormData.projectName" maxlength="50" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="模块id" prop="moduleId" v-if="subConfigFormData.sendType === 'iot'">
          <el-input v-model="subConfigFormData.moduleId" maxlength="50" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="iam账号" prop="iamUname" v-if="subConfigFormData.sendType === 'iot'">
          <el-input v-model="subConfigFormData.iamUname" maxlength="100" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="iam密码" prop="iamPassword" v-if="subConfigFormData.sendType === 'iot'">
          <el-input v-model="subConfigFormData.iamPassword" maxlength="100" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="iam域账号" prop="iamDomain" v-if="subConfigFormData.sendType === 'iot'">
          <el-input v-model="subConfigFormData.iamDomain" maxlength="100" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark" v-if="subConfigFormData.sendType === 'iot'">
          <el-input v-model="subConfigFormData.remark" maxlength="100" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="状态" prop="enable">
          <el-radio-group v-model="subConfigFormData.enable">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="false" label="租户id" prop="tenantId">
          <el-input v-model="subConfigFormData.tenantId" size="mini" auto-complete="off"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="configDialogFormVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subConfigForm('subConfigFormData')">确 定</el-button>
      </div>
    </el-dialog>
 
    <!-- 模板选择 -->
    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false" width="50%" title="选择模板" :visible.sync="templateDialogFormVisible">
      <div style="width: 100%;">
        <!-- //table 表格 -->
        <el-table
          max-height="380"
          ref="templateTable"
          :data="templateData"
          class="mt10"
          @selection-change="handleSelectionChange"
          :cell-style="{padding:'5px 0px'}" 
          highlight-current-row
          fit 
          style="width: 100%;"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column type="index" width="55"> </el-table-column>
          <el-table-column prop="templateName" align="center" label="模板名称">
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="saveTemplateList">确 定</el-button>
        <el-button size="mini" @click="templateDialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/orgClass'
import * as menuApi from '@/api/menu'
export default {
  data() {
    return {
      typeOptions: [], 
      dialogFormVisible: false,
      configDialogFormVisible: false,
      templateDialogFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      selectionTemplateList: [],
      selectionTenantId:null,
      rowData: {
        id: null,
        name: null,
        code: null,
        phone: null,
        address: null,
        remark: null,
        enable: null
      },
      subFormData: {
        id: null,
        name: null,
        code: null,
        number: 1,
        phone: null,
        address: null,
        remark: null,
        enable: null
      },
      subConfigFormData: {
        id: null,
        projectId: null,
        projectName: null,
        moduleId: null,
        iamUname: null,
        iamPassword: null,
        iamDomain: null,
        remark: null,
        enable: null,
        tenantId: null,
        url: null,
        sendType: 'iot'
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
        'number': [{
          required: true,
          message: '请填写最大用户数'
        }],
        'phone': [{
          required: true,
          message: '请填写联系方式'
        }],
        'address': [{
          required: true,
          message: '请填写地址'
        }],
        'enable': [{
          required: true,
          message: '请选择状态'
        }]
      },
      subConfigFormDataRule: {
        'projectId': [{
          required: true,
          message: '请填写项目Id'
        }],
        'projectName': [{
          required: true,
          message: '请填写项目名称'
        }],
        'moduleId': [{
          required: true,
          message: '请填写模块Id'
        }],
        'iamUname': [{
          required: true,
          message: '请填写iam账号'
        }],
        'iamPassword': [{
          required: true,
          message: '请填写iam密码'
        }],
        'iamDomain': [{
          required: true,
          message: '请填写域账号'
        }],
        'url': [{
          required: true,
          message: '请填写下发api地址'
        }],
        'enable': [{
          required: true,
          message: '请选择状态'
        }]
      },
      tableData: [],
      templateData: [],
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
            prop: 'number',
            conditionshow: false,
            filedShow: true,
            isSearchHide: true,
            label: '最大用户数',
            placeholder: '最大用户数',
            optList: []
          },
          {
            type: 'input',
            prop: 'phone',
            conditionshow: true,
            filedShow: true,
            label: '联系方式',
            placeholder: '联系方式',
            optList: []
          },
          {
            type: 'input',
            prop: 'address',
            conditionshow: true,
            filedShow: true,
            label: '地址',
            placeholder: '地址',
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
            minWidth: '120px',
            label: '操作',
            placeholder: '操作',
            optList: []
          }
        ]
      }
    }
  },
  created() {
      this.getSourceTypeOptions()
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
    getSourceTypeOptions() {
      menuApi.getSourceTypeOptions('md.bcp.sendType').then(res => {
        this.typeOptions = res.model
      }).catch(e => {
        return false
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
    subConfigForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          api.submitConfigForm(this[formData]).then(res => {
            this.$message.success('保存成功')
            this.getData(this.datas)
            this.configDialogFormVisible = false
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
          'number': null,
          'phone': null,
          'address': null,
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
      this.$set(this.subFormData, 'number', row.number)
      this.$set(this.subFormData, 'phone', row.phone)
      this.$set(this.subFormData, 'address', row.address)
      this.$set(this.subFormData, 'remark', row.remark)
      this.$set(this.subFormData, 'enable', row.enable)
    },
    // 配置页面
    editConfig(id) {
      this.configDialogFormVisible = true
      if (id == null) {
        this.resetConfigValue()
      }else{
        this.getConfigData(id)
        this.$set(this.subConfigFormData, 'tenantId', id)
      }
    },
    // 配置模板页面
    templateConfig(id) {
      this.templateDialogFormVisible = true
      this.selectionTenantId = id
      var params = {"tenantId":id}
      api.getTemplate(params).then( res=>{
        this.templateData = res
      }).then(a=>{
        this.templateData.forEach(
          row =>{
            if(row.checked==='1'){
              this.$refs.templateTable.toggleRowSelection(row, true)
            }
          }
        )
      })
    },
    handleSelectionChange(val) {
      this.selectionTemplateList = []
       //val是选中的数据的数组
       val.forEach(item => {
           const id = item.templateId
           const obj = {"tenantId":this.selectionTenantId,"templateId":item.templateId}
           this.selectionTemplateList.push(obj)
       })
    },
    saveTemplateList(){
      api.saveTemplate(this.selectionTenantId,this.selectionTemplateList).then(
        res=>{
          this.$message.success('保存成功')
        }
      )
      this.templateDialogFormVisible = false;
    },
    resetConfigValue() {
      this.$set(this, 'subConfigFormData', {
        'projectId': null,
        'projectName': null,
        'moduleId': null,
        'iamUname': null,
        'iamPassword': null,
        'iamDomain': null,
        'remark': null,
        'enable': true,
        'url': null,
        'sendType': 'iot'
      })
      this.$nextTick(() => {
        this.$refs['subConfigFormData'].resetFields()
      })
      return
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
    getConfigData(id) {
      api.getConfigData(id).then(res => {
        if (res.model != null) {
          this.subConfigFormData = JSON.parse(JSON.stringify(res.model))
        } else {
          this.resetConfigValue()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
