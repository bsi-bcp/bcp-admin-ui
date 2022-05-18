<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
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
    <!-- todo1 -->
    <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="120px" size="mini">
        <el-form-item v-if="cur_user.userType=='admin'" label="客户" prop="tenantId">
          <el-select v-model="subFormData.tenantId" placeholder="请选择">
            <el-option v-for="(optItem,optindex) in customerOptions" :key="optindex" :label="optItem" :value="optindex" />
          </el-select>
          <!-- <sxf-freelist v-model="subFormData.tenantId" code="bcp.tenant.name" /> -->
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <!--maxlength 属性规定输入字段的最大长度-->
          <el-input v-model="subFormData.name" placeholder="单行输入" maxlength="20" size="mini" auto-complete="off" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <template>
            <el-select v-model="subFormData.type" placeholder="请选择">
              <el-option v-for="(optItem,optindex) in typeOptions" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
            </el-select>
          </template>
        </el-form-item>
        <!--类型是EMAIL-->
        <div v-if="subFormData.type === 'email'">
          <el-form ref="subFormData_email" :model="subFormData_email" :rules="subFormDataRule1" class="subFormData_email" label-width="120px" size="mini">
            <el-form-item label="服务器" prop="host">
              <el-input v-model="subFormData_email.host" placeholder="单行输入" maxlength="100" size="mini" auto-complete="off" />
            </el-form-item>
            <el-form-item label="账号" prop="userName">
              <el-input v-model="subFormData_email.userName" placeholder="单行输入" maxlength="100" size="mini" auto-complete="off" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="subFormData_email.password" placeholder="单行输入" maxlength="100" size="mini" auto-complete="off" />
            </el-form-item>
            <el-form-item label="邮件标题" prop="title">
              <el-input v-model="subFormData_email.title" placeholder="单行输入" maxlength="100" size="mini" auto-complete="off" />
            </el-form-item>
            <el-form-item label="收件人" prop="receiver">
              <el-input v-model="subFormData_email.receiver" placeholder="单行输入" maxlength="100" size="mini" auto-complete="off" />
            </el-form-item>
            <el-form-item label="内容" prop="content">
              <el-input v-model="subFormData_email.content" type="textarea" rows = "6" placeholder="单行输入" maxlength="1000" size="mini" auto-complete="off" />
            </el-form-item>
          </el-form>
        </div>
        <div v-if="subFormData.type === 'tel'">
          <el-form ref="subFormData_tel" :model="subFormData_tel" :rules="subFormDataRule1" class="subFormData_tel" label-width="120px" size="mini">
            <el-form-item label="电话号码" prop="phoneNumber">
              <el-input v-model="subFormData_tel.phoneNumber" placeholder="单行输入" maxlength="100" size="mini" auto-complete="off" />
            </el-form-item>
          </el-form>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-prevent-repeat-click size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
        <el-button size="mini" @click="dialogFormVisible = false;showCronBox=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/warnMethod'
import * as menuApi from '@/api/menu'
import * as sel from '@/api/select'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      planOptions: [],
      userCaseOptions: [],
      typeOptions: [],
      customerOptions: [],
      planCheckWay: 1,
      tenants: [],
      computers: [],
      dialogFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      isJxBc: false,
      rowData: {
        id: null,
        name: null,
        code: null,
        type: null,
        remark: null
      },
      subFormData: {
        id: null,
        name: null,
        type: null
      },
      subFormData_email: {
        host: null,
        userName: null,
        password: null,
        title: null,
        receiver: null,
        content: null
      },
      subFormData_tel: {
        phoneNumber: null
      },
      subFormDataRule: {
        'name': [{
          required: true,
          message: '请填写名称',
          trigger: 'blur'
        }],
        'type': [{
          required: true,
          message: '请填写类型',
          trigger: 'blur'
        }]
      },
      subFormDataRule1: {
        'host': [{
          required: true,
          message: '请填写服务器',
          trigger: 'blur'
        }],
        'userName': [{
          required: true,
          message: '请填写账号'
        }],
        'password': [{
          required: true,
          message: '请填写密码',
          trigger: 'blur'
        }],
        'title': [{
          required: true,
          message: '请填写标题',
          trigger: 'blur'
        }],
        'receiver': [{
          required: true,
          message: '请填写收件人',
          trigger: 'blur'
        }],
        'content': [{
          required: true,
          message: '请填写内容'
        }]
      },
      tableData: [],
      params: {
        currentPage: 1,
        pageSize: 10
      },
      datas: {
        multipleSelection: [],
        nosetting: true, // true设置按钮消失
        params: {
          currentPage: 1,
          pageSize: 10
        },
        table: {
          selection: false,
          loading: true,
          orderNo: true
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
            // 控制设置内部 复选框勾选的默认值
            conditionshow: true,
            // 控制该字段是否出现在表格里
            filedShow: true,
            // 控制搜索框的label显示与否
            isHiddenSearchLabel: true,
            label: '名称',
            placeholder: '关键词',
            queryName: '关键词',
            optList: [],
            name: '',
            align: 'left'
          },
          {
            type: 'input',
            prop: 'type',
            conditionshow: false,
            filedShow: true,
            label: '类型',
            placeholder: '类型',
            optList: []
          },
          {
            type: 'input',
            prop: 'createTime',
            conditionshow: false,
            filedShow: true,
            label: '创建时间',
            placeholder: '创建时间',
            optList: []
          },
          {
            type: 'input',
            prop: 'lastUpdateTime',
            conditionshow: false,
            filedShow: true,
            label: '修改时间',
            placeholder: '修改时间',
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
      },
      showCronBox: false
    }
  },
  async created() {
    this.getSourceTypeOptions()
  },
  mounted() {
  },
  computed: {
    ...mapGetters([
      'cur_user'
    ])
  },
  methods: {
    input(data) {
      console.log('data===>', data)
    },
    inputByMenu() {
      this.subFormData.cron = null
    },
    inputByCustom() {
      this.subFormData.cron = null
    },
    // 删除
    remove(row) {
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          api.singleDelete(row.id).then(res => {
            if (res.code === 500) {
              this.$message.warning({
                message: res.msg
              })
            } else {
              this.$message.success({
                message: res.msg
              })
            }
            this.getData()
            // this.dialogFormVisible = false
          })
        })
        .catch(() => {
        })
    },
    // 新增或编辑页面
    async edit(row) {
      // 清空验证信息
      if (this.$refs.subFormData) {
        this.$refs.subFormData.clearValidate()
      }
      this.dialogFormVisible = true
      // 如果是新增
      if (row === 0) {
        // 清空属性值
        Object.keys(this.subFormData).forEach((key) => (this.subFormData[key] = null))
        Object.keys(this.subFormData_email).forEach((key) => (this.subFormData_email[key] = null))
        Object.keys(this.subFormData_tel).forEach((key) => (this.subFormData_tel[key] = null))
        // 客户默认当前用户所属租户
        this.subFormData.tenantId = this.cur_user.tenantId + ''

        // 查询邮箱配置
        const emailConfOptions = {}
        await menuApi.getSourceTypeOptions('fw.email.config').then(res => {
          res.model.forEach(function(val) {
            emailConfOptions[val.propkey] = val.propvalue
          })
        }).catch(e => {
          return false
        })
        // 邮箱配置默认服务器、用户名、密码
        this.subFormData_email.type = emailConfOptions.type
        this.subFormData_email.host = emailConfOptions.host
        this.subFormData_email.userName = emailConfOptions.account
        this.subFormData_email.password = emailConfOptions.password
        this.subFormData_email.receiver = emailConfOptions.receiver
        return
      }
      // 如果是更新
      // eslint-disable-next-line no-unused-vars
      const queryObj = await api.getId(row.id)
      const data = JSON.parse(queryObj.model.configValue)
      const tmp = {}
      Object.assign(tmp, queryObj.model)
      delete tmp.configValue
      tmp.tenantId = tmp.tenantId + ''
      this.subFormData = {
        ...tmp
      }
      // eslint-disable-next-line no-unused-vars
      const subObj = 'subFormData_' + this.subFormData.type + ''
      this[subObj] = {
        ...data
      }
    },
    getData(datas = this.datas) {
      this.$set(this, 'datas', datas)
      this.$set(this, 'params', datas.params)
      this.$set(this.datas.table, 'loading', true)
      this.$set(this.params, 'orgId', this.params.orgName)

      api.getPage({ ...this.params, key: this.datas.filterList[0].name }).then(res => {
        this.$set(this.datas.resData, 'rows', res.model)
        this.$set(this.datas.params, 'currentPage', res.currentPage)
        this.$set(this.datas.params, 'pageSize', res.pageSize)
        this.$set(this.datas.resData, 'totalCount', res.totalCount)
        this.$set(this.datas.table, 'loading', false)
      })
    },
    // 新增
    subForm(subFormData) {
      this.showCronBox = false
      this.$refs.subFormData.validate((valid) => {
        if (valid) {
          const subObj = 'subFormData_' + this.subFormData.type + ''
          const dataVale = JSON.stringify(this[subObj])
          const obj = {
            configValue: dataVale,
            ...this.subFormData
          }
          api.submitForm(obj).then(res => {
            this.$message.success('保存成功')
            this.getData(this.datas)
            this.dialogFormVisible = false
          })
        } else {
          return false
        }
      })
    },
    getSourceTypeOptions() {
      menuApi.getSourceTypeOptions('md.bcp.warnmethod.type').then(res => {
        this.typeOptions = res.model
      }).catch(e => {
        return false
      })
      sel.getFreelist({ code: 'bcp.tenant.name', params: '' }).then(res => {
        this.customerOptions = res.model
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
