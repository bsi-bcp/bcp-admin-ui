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
    <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="100px">
        <el-form-item label="客户" prop="tenantId">
            <el-select v-model="subFormData.tenantId" placeholder="请选择" >
                <el-option v-for="(optItem,optindex) in customerOptions" :key="optindex" :label="optItem" :value="optindex" />
              </el-select>
          <!-- <sxf-freelist v-model="subFormData.tenantId" code="bcp.tenant.name" /> -->
        </el-form-item>
        <el-form-item label="数据源名称" prop="name" >
          <!--maxlength 属性规定输入字段的最大长度-->
          <el-input v-model="subFormData.name" placeholder="单行输入"  maxlength="20" size="mini" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <template>
            <el-select v-model="subFormData.type" placeholder="请选择" >
              <el-option v-for="(optItem,optindex) in typeOptions" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
          </el-select>
          </template>
        </el-form-item>
          <!--类型是API-->
          <div v-if="subFormData.type === 'api'">
          <el-form-item label="URL" prop="url" >
            <el-input v-model="subFormData.url" placeholder="单行输入"  maxlength="100" size="mini" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="认证方式" prop="authmode">
            <template>
              <el-select id="elSelectChange" v-model="subFormData.authmode" placeholder="请选择" >
                <el-option v-for="(optItem,optindex) in authOptions" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
              </el-select>
            </template>
          </el-form-item>
          <!--认证方式 无需改变-->
          <div id="noChangeOne" else v-if="subFormData.authmode === 'noauth'">
          <el-form-item label="集成节点" prop="nodeId" >
            <el-input  v-model="subFormData.nodeId" placeholder="节点ID"  maxlength="200" size="mini" auto-complete="off"></el-input>
          </el-form-item>
          </div>
          <!--认证方式 Basic Auth-->
          <div id="divBasicAuth" else v-if="subFormData.authmode === 'basic'">
            <el-form-item label="用户名" prop="username" >
              <el-input v-model="subFormData.username" placeholder="单行输入"  maxlength="50" size="mini" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password" >
            <el-input v-model="subFormData.password" placeholder="单行输入"  maxlength="50" size="mini" auto-complete="off"></el-input>
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
          <div id="divBearerToken" v-if="subFormData.authmode === 'bearer'">
          <el-form-item label="Token URL" prop="tokenUrl" >
            <el-input v-model="subFormData.tokenUrl" placeholder="单行输入"  maxlength="100" size="mini" auto-complete="off"></el-input>
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
          <div v-if="subFormData.type === 'db'">
            <el-form-item label="分类" prop="classify">
              <template>
                <el-select v-model="subFormData.classify" placeholder="sqlserver" maxlength="10">
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
              <el-input v-model="subFormData.url" placeholder="单行输入"  maxlength="100" size="mini" auto-complete="off"></el-input>
            </el-form-item> 
            <el-form-item label="数据库名称" prop="databaseName" >
              <el-input v-model="subFormData.databaseName" placeholder="单行输入"  maxlength="50" size="mini" auto-complete="off"></el-input>
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
              <el-input v-model="subFormData.nodeId" placeholder="节点ID"  maxlength="50" size="mini" auto-complete="off"></el-input>
            </el-form-item>
        </div>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false;showCronBox=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/datasource'
import * as menuApi from '@/api/menu'
import * as sel from '@/api/select'
export default {
  data() {
    return {
      planOptions: [],
      userCaseOptions: [],
      typeOptions: [],
      authOptions: [],
      customerOptions: [],
      planCheckWay: 1,
      tenants: [],
      computers: [],
      dialogFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      isJxBc: false,
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
        type: null,
        remark: null
      },
      subFormData: {
        id: null,
        name: null,
        code: null,
        type: null,
        url:null,
        userName:null,
        password:null,
        authmode:null,//类型为API时的认证方式
        classify:null,
        tenantId:null,
        nodeId:null
      },
      subFormDataRule: {
        'name': [{
          required: true,
          message: '请填写名称',
          trigger: 'blur'
        }],
        'code': [{
          required: true,
          message: '请填写编码'
        }],
        'type': [{
          required: true,
          message: '请填写类型',
          trigger: 'blur'
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
  },
  mounted() {
  },
  methods: {
    input(data){
      console.log('data===>',data)
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
            this.$message.success({
              message: '删除成功'
            })
            this.getData()
            // this.dialogFormVisible = false
          })
        })
        .catch(() => {
        })
    },
    // 新增或编辑页面
    edit(row) {
      //清空验证信息
      if( !!this.$refs.subFormData ){
        this.$refs.subFormData.clearValidate()
      }
      
      this.dialogFormVisible = true
      //如果是新增
      if (row===0) {
        //清空属性值
        Object.keys(this.subFormData).forEach((key) => (this.subFormData[key] = null));
        return
      }
      //如果是更新
      let data =JSON.parse(row.configValue)
      let tmp = {};
      Object.assign(tmp, row)
      delete tmp.configValue
      this.subFormData = {
        ...data,
        ...tmp
      }
    },
    getData(datas = this.datas) {
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
    subForm(subFormData) {
      this.showCronBox = false
      this.$refs.subFormData.validate((valid) => {
        if (valid) {
          if(this.subFormData.type =='api'){
            this.subFormData.classify=this.subFormData.type
          }
          let dataVale = JSON.stringify(this.subFormData)
          let obj = {
            configValue:dataVale,
            ...this.subFormData
          }
          api.submitForm(obj).then(res => {
            this.$message.success('保存成功')
            this.getData(this.datas)
            this.dialogFormVisible = false
          })
        }else{
            return false
        }
      })
    },
    getSourceTypeOptions() {
      menuApi.getSourceTypeOptions('md.bcp.datasource.type').then(res => {
        this.typeOptions = res.model
      }).catch(e => {
        return false
      })
      menuApi.getSourceTypeOptions('md.bcp.datasource.authmode').then(res => {
        this.authOptions = res.model
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