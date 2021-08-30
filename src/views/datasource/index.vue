<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
        <el-button type="primary" size="mini" @click="remove(0)">删除</el-button>
        <el-button type="primary" size="mini" @click="allocation(0)">分配</el-button>
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
    <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="100px">
        <el-form-item label="客户" prop="userCaseId">
         <template>
          <el-select v-model="subFormData.userCaseId" placeholder="请选择">
          <el-option
          v-for="item in optionsOne"
          :key="item.value"
          :label="item.label"
          :value="item.value">
          </el-option>
          </el-select>
        </template>
        </el-form-item>
        <el-form-item label="数据源名称" prop="name" >
          <el-input v-model="subFormData.name" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <template>
            <el-select v-model="subFormData.type" placeholder="请选择">
            <el-option
            v-for="item in optionsTwe"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
          </el-select>
          </template>
        </el-form-item>
          <!--类型是API-->
          <div v-if="subFormData.type === '1'">
          <el-form-item label="URL" prop="url" >
            <el-input v-model="subFormData.url" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="认证方式" prop="authmode">
            <template>
              <el-select id="elSelectChange" v-model="subFormData.authmode" placeholder="请选择" >
              <el-option
              v-for="item in optionsThree"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              </el-option>
            </el-select>
            </template>
          </el-form-item>
          <!--认证方式 无需改变-->
          <div id="noChangeOne" else v-if="subFormData.authmode === '1'">
          <el-form-item label="集成节点" prop="nodeId" >
            <el-input  v-model="subFormDanodeIdta.nodeId" placeholder="节点ID"  maxlength="20" size="mini" auto-complete="off"></el-input>
          </el-form-item>
          </div>
          <!--认证方式 Basic Auth-->
          <div id="divBasicAuth" else v-if="subFormData.authmode === '2'">
            <el-form-item label="用户名" prop="username" >
              <el-input v-model="subFormData.username" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password" >
            <el-input v-model="subFormData.password" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="集成节点" prop="nodeId">
              <template>
                <el-select v-model="subFormData.nodeId" placeholder="请选择">
                <el-option
                v-for="item in optionsfore"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
                </el-select>
              </template>
            </el-form-item>
          </div>
          <!--认证方式 Bearer Token-->
          <div id="divBearerToken" v-if="subFormData.authmode === '3'">
          <el-form-item label="Token URL" prop="password" >
            <el-input v-model="subFormData.url" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="集成节点" prop="nodeId">
            <template>
              <el-select v-model="subFormData.nodeId" placeholder="请选择">
              <el-option
              v-for="item in optionsfore"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              </el-option>
            </el-select>
            </template>
          </el-form-item>
          </div>
          </div>
          <!-- todo3 -->
          <!--类型是数据库-->
          <div v-if="subFormData.type === '2'">
            <el-form-item label="分类" prop="classify">
              <template>
                <el-select v-model="subFormData.classify" placeholder="sqlserver">
                <el-option
                v-for="item in optionsFive"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
                </el-select>
              </template>
            </el-form-item> 
            <el-form-item label="数据库地址" prop="url" >
              <el-input v-model="subFormData.url" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
            </el-form-item> 
            <el-form-item label="数据库名称" prop="databaseName" >
              <el-input v-model="subFormData.databaseName" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
            </el-form-item> 
            <el-form-item label="端口号" prop="port" >
              <el-input v-model="subFormData.port" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
            </el-form-item> 
            <el-form-item label="用户名" prop="username" >
              <el-input v-model="subFormData.username" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
            </el-form-item> 
            <el-form-item label="密码" prop="password" >
              <el-input v-model="subFormData.password" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
            </el-form-item> 
            <el-form-item label="集成节点" prop="nodeId" >
              <el-input v-model="subFormData.nodeId" placeholder="节点ID"  maxlength="20" size="mini" auto-complete="off"></el-input>
            </el-form-item>
        </div>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false;showCronBox=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
      </div>
    </el-dialog>

    <!--分配界面-->
    <el-dialog width="50%" :title="'分配'" :visible.sync="allocationDialogFormVisible">
      <el-form ref="allocationSubFormData" :model="allocationSubFormData" :rules="allocationSubFormDataRule"
               class="allocationSubFormData" label-width="100px"
      >
        <el-form-item label="计划任务名称">
          <el-select v-model="allocationNames" multiple disabled size="mini" auto-complete="off">
            <el-option v-for="item in allocationNames" :key="item" :label="item" :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-show="false" label="items" prop="items">
          <el-input v-model="allocationSubFormData.items" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="租户" prop="sourceType">
          <el-select v-model="allocationSubFormData.tenantId" size="mini" @change="getComputers">
            <el-option v-for="(optItem,optindex) in tenants" :key="optindex" :label="optItem.name" :value="optItem.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="前置机" prop="sourceType">
          <el-select v-model="allocationSubFormData.computerId" size="mini">
            <el-option v-for="(optItem,optindex) in computers" :key="optindex" :label="optItem.name"
                       :value="optItem.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="allocationDialogFormVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="allocationSubForm('allocationSubFormData')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/datasource'

export default {
  data() {
    return {
      planOptions: [],
      userCaseOptions: [],
      typeOptions: [],
      nameOptions: [],
      planCheckWay: 1,
      tenants: [],
      computers: [],
      dialogFormVisible: false,
      allocationDialogFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      isJxBc: false,
      optionsOne: [{
          value: '1',
          label: '则成'
        }, {
          value: '2',
          label: '云鲸'
        }],
        optionsTwe: [{
          value: '1',
          label: 'API'
        }, {
          value: '2',
          label: '数据库'
        }],
        optionsThree: [{
          value: '1',
          label: '无需认证'
        }, {
          value: '2',
          label: 'Basic Auth'
        }, {
          value: '3',
          label: 'Bearer Token'
        }],
        optionsfore: [{
          value: 'SRM集成节点',
          label: 'SRM集成节点'
        }, {
          value: 'MES集成节点',
          label: 'MES集成节点'
        }],
        optionsFive: [{
          value: 'sqlserver',
          label: 'sqlserver'
        }, {
          value: 'oracle',
          label: 'oracle'
        }],
      rowData: {
        id: null,
        name: null,
        code: null,
        plan: null,
        execService: null,
        cron: null,
        type: null,
        userCaseId: null,
        remark: null
      },
      subFormData: {
        id: null,
        name: null,
        code: null,
        plan: null,
        execService: null,
        cron: null,
        newType: null,
        userCaseId: null,
        remark: null,
        url:null,
        certificationMode:null,
        integrationNode:null,
        userName:null,
        password:null,
        authmode:null,//类型为API时的认证方式
        classify: ''
      },
      allocationSubFormData: {
        items: null,
        tenantId: null,
        computerId: null
      },
      allocationNames: null,
      subFormDataRule: {
        'name': [{
          required: true,
          message: '请填写名称'
        }],
        'code': [{
          required: true,
          message: '请填写编码'
        }],
        'plan': [{
          required: true,
          message: '请填写运行计划'
        }],
        'execService': [{
          required: true,
          message: '请填写绑定service'
        }],
        'cron': [{
          required: true,
          message: '请填写cron'
        }],
        'type': [{
          required: true,
          message: '请填写类型'
        }],
        'userCaseId': [{
          required: true,
          message: '请填写绑定用户场景'
        }]
      },
      allocationSubFormDataRule: {
        'tenantId': [{
          required: true,
          message: '请选择租户'
        }],
        'computerId': [{
          required: true,
          message: '请选择前置机'
        }]
      },
      tableData: [],
      params: {
        currentPage: 1,
        pageSize: 10
      },
      datas: {
        multipleSelection: [],
        nosetting: true,//true设置按钮消失 
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
            optList: [],
            name: ''
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
            prop: 'classify',
            conditionshow: false,
            filedShow: true,
            label: '分类',
            placeholder: '分类',
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
    this.getTenants()
  },
  mounted() {
  },
  methods: {
    inputByMenu() {
      this.subFormData.cron = null
    },
    inputByCustom() {
      this.subFormData.cron = null
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
        .catch(() => {
        })
    },
    allocation(row) {
      let items = []
      let names = []
      if (!row) {
        if (!this.datas.multipleSelection.length) {
          this.$message.info('请选择相关数据')
          return
        }
        items = this.datas.multipleSelection.map((value) => {
          return value['id']
        })
        names = this.datas.multipleSelection.map((value) => {
          return value['name']
        })
      } else {
        items.push(row.id)
        names.push(row.name)
      }
      this.allocationNames = names
      this.allocationDialogFormVisible = true
      this.$set(this.allocationSubFormData, 'items', items)
    },
    //新增的方法
    subForm(formData) {
      this.showCronBox = false
      this.$refs[formData].validate((valid) => {
        if (valid) {
          console.log(this[formData])

          let { userCaseId, name, type, url, authmode, tokenUrl, classify, databaseName, port, username, password, nodeId } = this[formData];
          let param = {
            userCaseId,
            name,
            type
          };
          
          if(type == 'API'){
            param.classify = type;
            param.configvalue = {
              url,
              authmode,
              username,
              password,
              tokenUrl
            }
          }else{
            param.classify = type;
            param.nodeId = nodeId;
             param.configvalue = {
              databaseName,
              port,
              username,
               password,
               url
            }
          }
   
          api.submitForm(param).then(res => {
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
    allocationSubForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          api.submitAllocationForm(this[formData]).then(res => {
            // console.log(this[formData])
            this.$message.success('分配成功')
            this.getData(this.datas)
            this.allocationDialogFormVisible = false
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
          'plan': null,
          'execService': null,
          'cron': null,
          'type': null,
          'userCaseId': null,
          'remark': null
        })
        if (this.$refs['subFormData']) {
          this.$refs['subFormData'].resetFields()
        }
        return
      }
      this.$set(this.subFormData, 'id', row.id)
      this.$set(this.subFormData, 'name', row.name)
      this.$set(this.subFormData, 'code', row.code)
      this.$set(this.subFormData, 'plan', row.plan)
      this.$set(this.subFormData, 'execService', row.execService)
      this.$set(this.subFormData, 'cron', row.cron)
      this.$set(this.subFormData, 'type', row.type)
      this.$set(this.subFormData, 'userCaseId', row.userCaseId)
      this.$set(this.subFormData, 'remark', row.remark)
    },
    getData(datas = this.datas) {
      console.log('this.params = ', this.params)

      this.$set(this, 'datas', datas)
      this.$set(this, 'params', datas.params)
      this.$set(this.datas.table, 'loading', true)
      this.$set(this.params, 'orgId', this.params.orgName)
  
      api.getPage({...this.params, key: this.datas.filterList[0].name}).then(res => {
        this.$set(this.datas.resData, 'rows', res.model)
        this.$set(this.datas.params, 'currentPage', res.currentPage)
        this.$set(this.datas.params, 'pageSize', res.pageSize)
        this.$set(this.datas.resData, 'totalCount', res.totalCount)
        this.$set(this.datas.table, 'loading', false)
      })
    },
    getSourceTypeOptions() {
      api.getSourceTypeOptions('fw.task.plan').then(res => {
        this.planOptions = res.model
      }).catch(e => {
        return false
      })
      api.getSourceTypeOptions('fw.task.userCase').then(res => {
        this.userCaseOptions = res.model
      }).catch(e => {
        return false
      })
      api.getSourceTypeOptions('fw.task.type').then(res => {
        this.typeOptions = res.model
      }).catch(e => {
        return false
      })
    },
    getTenants() {
      api.getTenants().then(res => {
        this.tenants = res.model
      }).catch(e => {
        return false
      })
    },
    getComputers() {
      this.allocationSubFormData.computerId = null
      const tenantId = this.allocationSubFormData.tenantId
      api.getComputers(tenantId).then(res => {
        console.log(res.model)
        this.computers = res.model
        if (this.computers.length === 1) {
          this.allocationSubFormData.computerId = this.computers[0].id
        }
      }).catch(e => {
        return false
      })
    }
    // // 定义plan转cron表达式
    // getCronByPlan(plan) {
    //   let cron
    //   switch (plan) {
    //     case '1':
    //       cron = '0 0/1 * * * ?'
    //       break
    //     case '2':
    //       cron = '0 0/5 * * * ?'
    //       break
    //     case '3':
    //       cron = '0 0/10 * * * ?'
    //       break
    //     case '4':
    //       cron = '0 0/30 * * * ?'
    //       break
    //     case '5':
    //       cron = '0 0 */1 * * ?'
    //       break
    //     case '6':
    //       cron = '0 0 */3 * * ?'
    //       break
    //     case '7':
    //       cron = '0 0 */6 * * ?'
    //       break
    //     case '8':
    //       cron = '0 0 */12 * * ?'
    //       break
    //     case '9':
    //       cron = '0 0 0 * * ? *'
    //       break
    //     case '10':
    //       cron = '0 0 0 /2 * ? *'
    //       break
    //     case '11':
    //       cron = '0 0 0 0 0 ? *'
    //       break
    //     case '12':
    //       cron = '0 0 0 0 * ? *'
    //       break
    //   }
    //   this.$set(this.subFormData, 'cron', cron)
    // }
  }
}
</script>

<style lang="scss" scoped>

</style>