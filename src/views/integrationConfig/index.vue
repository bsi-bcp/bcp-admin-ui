<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
      </template>
      <template slot="oper" slot-scope="scope">
        <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>
        <el-button size="mini" type="text" @click="derive(scope.value)">导出</el-button>
      </template>
    </mod-filter>
    <!--新增/编辑界面-->
    <el-dialog :close-on-click-modal="false"  :close-on-press-escape="false" width="1100px" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
    <el-form label-position="top" inline-message size="mini" ref="configForm" :model="subFormData"  :rules="subFormDataRule" class="subFormData " label-width="100px">
        <!--新增界面的集成名称项-->
    <el-form-item label="集成名称" prop="name">
        <el-input class="baseinfo" v-model="subFormData.name" placeholder="集成名称"  maxlength="20" size="mini" auto-complete="off" />
    </el-form-item>
        <!--新增界面的客户项-->
     <el-form-item label="客户" prop="tenantId">
        <el-select class="baseinfo" v-model="subFormData.tenantId" placeholder="请选择" size="mini">
          <el-option
              v-for="item in bcpTenantName"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <!-- <sxf-freelist v-model="subFormData.tenantId"   code="bcp.tenant.name" size="mini" placeholder="请选择客户项" /> -->
     </el-form-item>
        <!--新增界面的模板选择-->
      <el-form-item label="模板选择" prop="templateId">
        <el-input class="baseinfo" v-model="subFormData.templateName" disabled placeholder="模板选择" maxlength="20" size="mini" ></el-input><el-button style="margin-left:5px" size="mini" @click="ShowMoule=true">选择模板</el-button>
      </el-form-item>
      <!--新增界面的集成节点-->
      <el-form-item label="集成节点" prop="nodeId">
        <el-input class="baseinfo" v-model="subFormData.nodeId" placeholder="集成节点" maxlength="20" size="mini" auto-complete="off" width="300px"></el-input>
      </el-form-item>
        <!--新增界面的参数-->
        <el-form-item label="参数" prop="parameter" style="margin-top:20px;">
          <el-table :data="tableData" class="mt10" :cell-style="{padding:'10px 0px'}" :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit highlight-current-row style="width: 100%" @select="handleSelectionChange">
            <!-- align="center"使内容居中 -->
            <el-table-column label="参数名称" align="center">
              <!-- slot-scope="scope"获取表格到当前行的数据 -->
              <template slot-scope="scope">
                <el-input v-model="scope.row.key" />
              </template>
            </el-table-column>
            <el-table-column  label="参数数据" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.value" />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
              <el-button type="text" @click="delTableData(scope)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!--参数的添加按钮-->
          <el-button type="text" @click="addParam" style="margin-top:5px">添加</el-button>
          <!-- <div @click="addParam">添加</div> -->
        </el-form-item>
        <!--新增界面的插件文件（暂不需）-->
        <!-- <el-form-item label="插件文件" prop="">
          <el-button type="primary">上传插件<i class="el-icon-upload el-icon--right"></i></el-button>
        </el-form-item> -->
        <!--新增界面的任务列表-->
        <el-form-item label="任务列表" style="margin-top:20px;">
          <el-table :data="jobList" class="mt10" :cell-style="{padding:'5px 0px'}" :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit highlight-current-row style="width: 100%" @select="handleSelectionChange">
            <!--任务列表的选择点击按钮-->
            <el-table-column type="selection"  width="45">
            </el-table-column>
            <!--任务列表的名称-->
            <el-table-column prop="jobName" label="名称" align="center" width="120">
              <template slot-scope="scope">
                <el-input v-model="scope.row['jobName']" />
              </template>
            </el-table-column>
            <!--任务列表的输入节点-->
            <el-table-column prop="inNode"  label="输入节点" align="center" width="220">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span='14'>
                    <el-select v-model="scope.row['inNode']['type']" placeholder="请选择">
                      <el-option
                        v-for="item in optionsInput"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>  
                  </el-col>
                  <el-col :span='10'>
                    <el-button type="text" :disabled="scope.row['inNode']['type']==''" @click="changeOptionsInput(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的转换节点-->
            <el-table-column prop="transformNode" label="转换节点" align="center" width="220">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span='14'>
                    <el-select v-model="scope.row['transformNode']['type']" placeholder="请选择" >
                      <el-option
                        v-for="item in optionsTransform"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>  
                  </el-col>
                  <el-col :span='10'>
                    <el-button type="text" :disabled="scope.row['transformNode']['type']==''" @click="changeOptionsTransform(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的输出节点-->
            <el-table-column prop="outNode" label="输出节点" align="center" width="220">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span="14">
                    <el-select v-model="scope.row['outNode']['type']" placeholder="请选择">
                      <el-option
                        v-for="item in optionsOutput"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-col>
                  <el-col :span="10">
                    <!-- 不选择则不能点击=>:disabled="jobList[scope.$index].outputType==undefined" -->
                    <el-button type="text" :disabled="scope.row['outNode']['type']==''" @click="changeOptionsOutput(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的状态-->
            <!-- <el-table-column prop="status" label="状态" align="center" width="80"> -->
            <!-- </el-table-column> -->
            <!--任务列表的操作-->
            <el-table-column prop="oper" label="操作" align="center" width="300">
              <template slot-scope="scope">
               <div style="text-align:left">
                  <el-button type="text" disabled width="30">复制</el-button>
                  <el-button type="text" @click="deljobList(scope)" width="30">删除</el-button>
                  <el-button type="text" disabled>调试</el-button>
                  <el-button type="text" disabled>全量</el-button>
                  <el-button type="text" disabled>日志</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <!--任务列表的按钮-->
          <el-row>
            <el-button type="text" @click="addJob" style="margin-top:5px">添加</el-button>
          </el-row>
        </el-form-item>
      </el-form>
      <!--新增界面的确定取消-->
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="subForm('configForm')">确 定</el-button>
        <el-button size="mini" :disabled="subFormData.id==undefined"  type="primary" @click="issue(subFormData.id)">下发</el-button>
        <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
<!-----------------------------------------------跳转的界面--------------------------------------------------------->
    <!--模板选择按钮的跳转界面-->
    <!--:visible.sync="ShowMoule"的功能为控制当前模态窗的显示和隐藏-->
    <!-- :close-on-click-modal="false"和:close-on-press-escape="false"的功能为控制窗口不会被点击或是ESC按键关闭 -->
    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false" width="50%" title="选择模板" :visible.sync="ShowMoule">
     <multipleTable @templateData="templateData" >
     </multipleTable>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="ShowMoule = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="modelShow">确 定</el-button>
      </div>
    </el-dialog>
    <!--任务列表的输入节点-->
    <el-dialog width="50%" :title="ShowInput_title" :visible.sync="ShowInput_Database" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="inNode" :model="inNode" label-width="100px" >
        <el-form-item label="定时设置" v-if="ShowInput_title!='API上报'">
          <el-input v-model="inNode.cron" placeholder="请输入定时设置"></el-input>
        </el-form-item>
        <el-form-item label="数据源" >
          <el-select v-model="inNode.dataSource" placeholder="请选择">
            <el-option
              v-for="item in bcpDatasourceName"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <!-- <sxf-freelist v-model="inNode.dataSource" code="bcp.datasource.name" /> -->
        </el-form-item>
        <el-form-item label="增量标识字段" v-if="ShowInput_title=='数据库查询'">
          <el-input v-model="inNode.IncrementalField" placeholder="增量标识字段"></el-input>
        </el-form-item>
        <el-form-item label="访问路径" v-if="ShowInput_title=='API查询'||ShowInput_title=='API上报'">
          <el-input v-model="inNode.IncrementalField" placeholder="增量标识字段"></el-input>
        </el-form-item>
        <el-form-item label="脚本" v-if="ShowInput_title!='API上报'">
          <MonAco ref='MonAco'></MonAco>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="ShowInput_Database = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="affirmInNode">确 定</el-button>
      </div>
    </el-dialog>
    <!--任务列表的转换节点-->
    <el-dialog width="50%" :title="switchNode_title" :visible.sync="switchNode" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="transformNode"   label-width="100px" >
        <el-form-item label="脚本" >
          <MonAco ref='MonAcoTransformNode'></MonAco>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="switchNode = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="affirmTransformNode">确 定</el-button>
      </div>
    </el-dialog>
    <!--任务列表的输出节点-->
    <el-dialog width="50%" :title="Showoutput_title" :visible.sync="Showoutput_Transfer" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="outNode" :model="outNodeTypeData" label-width="100px" >
        </el-form-item>
          <el-form-item label="数据源" v-if="Showoutput_title=='API调用'||Showoutput_title=='数据库回写'">
          <sxf-freelist v-model="outNodeTypeData.dataSource" code="bcp.datasource.name" />
        </el-form-item>
        <el-form-item label="访问路径" v-if="Showoutput_title=='API调用'">
          <el-input v-model="outNodeTypeData.IncrementalField" placeholder="增量标识字段"></el-input>
        </el-form-item>
        <el-form-item label="脚本" >
          <MonAco ref='outMonAco'></MonAco>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="Showoutput_Transfer = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="affirmOutNode">确 定</el-button>
      </div>
    </el-dialog>
<!-------------------------------------------------------------------------------------------------------->
  </div>
</template>

<script>
import * as sel from "@/api/select";
import * as api from "@/api/IntegratedConfig";
//引入组件
import multipleTable from "./moudel/multipleTable";
import MonAco from "./moudel/monaco";
import { deepEqual } from 'assert';
export default {
  //组件注册
  components: {
    multipleTable,
    MonAco
  },
  data() {
    return {
      currentRow: 0,
      bcpDatasourceName:[],
      bcpTenantName:[],
      value: "",
      ShowInput_title: "",
      switchNode_title: "",
      Showoutput_title: "",
      transformNodedata: {
        scriptContent:'',
        index:0,
      },
      ShowInput_Reported: false, //“任务列表的输入节点=>API上报”模态窗的显示隐藏
      ShowInput_Database: false, //“                =>数据库查询”模态窗的显示隐藏
      ShowInput_Inquire: false, //“                 =>API查询”模态窗的显示隐藏
      switchNode: false, //“转换节点=>脚本转换”模态窗的显示隐藏
      Showoutput_Transfer: false, //“输出节点=>API调用”模态窗的显示隐藏
      Showoutput_Writeback: false, //“      =>数据库回写”模态窗的显示隐藏
      Showoutput_Script: false, //“         =>自定义脚本”模态窗的显示隐藏
      ShowMoule: false, //模态窗的显示隐藏
      Reported: false, //模态窗的显示隐藏
      inNode: {
        cron: null, //定时设置
        IncrementalField: null, //增量标识字段
        dataSource: null, //增量标识字段

      },
      outNode: {
        cron: null, //定时设置
        IncrementalField: null, //增量标识字段
        dataSource: null, //增量标识字段
      },
      transformNode: {
        cron: null, //定时设置
        IncrementalField: null, //增量标识字段
        dataSource: null, //增量标识字段
      },
      outNodeTypeData: {
        scriptContent:'',
        index:0,
        IncrementalField: null, //访问路径
      },
      jobList: [],
      tableData: [{}],//使打开新增窗口时参数新增行数不为空
      dialogFormVisible: false,
      subFormData: {
        name: null,
        nodeId: null,
        templateId: null,
        tenantId: '',
        templateName:null,
      },
      optionsInput: [
        {
          value: "1",
          label: "数据库查询",
        },
        {
          value: "2",
          label: "API查询",
        },
        {
          value: "3",
          label: "API上报",
        },
      ],
      optionsTransform: [
        {
          value: "1",
          label: "脚本转换",
        },
      ],
      optionsOutput: [
        {
          value: "1",
          label: "API调用",
        },
        {
          value: "2",
          label: "数据库回写",
        },
        {
          value: "3",
          label: "自定义脚本",
        },
      ],
      subFormDataRule: {
        name: [
          {
            required: true,
            message: "请填写名称",
            trigger: 'blur'
          }
        ],
        tenantId: [
          {
            required: true,
            message: "请选择客户"
          }
        ],
        templateId: [
          {
            required: true,
            message: "请选择模板"
          }
        ]
      },

      params: {
        currentPage: 1,
        pageSize: 10,
      },
      datas: {
        multipleSelection: [],
        params: {
          currentPage: 1,
          pageSize: 10,
        },
        table: {
          selection: true,
          loading: true,
        },
        resData: {
          rows: [],
          pageSize: 10,
          currentPage: 1,
          totalCount: 0,
        },
        filterList: [
             {
            type: "input",
            prop: "key",
            conditionshow: true,
            filedShow: false,
            label: "名称",
            placeholder: "关键词",
            optList: [],
          },
          {
            type: "input",
            prop: "name",
            conditionshow: false,
            filedShow: true,
            label: "名称",
            placeholder: "名称",
            optList: [],
          },
          {
            type: "input",
            prop: "tenantName",
            conditionshow: false,
            filedShow: true,
            label: "客户",
            placeholder: "客户",
            optList: [],
          },
          {
            type: "input",
            prop: "templateName",
            conditionshow: false,
            filedShow: true,
            label: "模板",
            placeholder: "模板",
            optList: [],
          },
          {
            type: "input",
            prop: "lastUpdateTime",
            conditionshow: false,
            filedShow: true,
            label: "修改时间",
            placeholder: "修改时间",
            optList: [],
          },
          {
            type: "input",
            prop: "status",
            conditionshow: false,
            filedShow: true,
            label: "状态",
            placeholder: "状态",
            optList: [],
          },
          {
            type: "input",
            prop: "oper",
            conditionshow: false,
            filedShow: true,
            isSearchHide: true,
            slot: true,
            label: "操作",
            placeholder: "操作",
            optList: [],
          },
        ],
      },
      temData:{},
    };
  },
  created() {
    // Dom 创建完成，由自己执行
     sel.getFreelist({ code: 'bcp.tenant.name'}).then((res) => {
      let arr = []
      for (const item in res.model) {
        this.bcpTenantName.push({ label: res.model[item], value: item });
      }
    })
         sel.getFreelist({ code: 'bcp.datasource.name'}).then((res) => {
      let arr = []
      for (const item in res.model) {
        this.bcpDatasourceName.push({ label: res.model[item], value: item });
      }
    });
    
  },
  methods: {
    //导出
    derive(row){
      api.exportExcel(row.id).then(res=>{
          let blob = new Blob([res], { type: `${res.type}` });
          let link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.click();
          link.remove();
      })
      console.log(row)
    },
    //下发（问题：前端这边已向后台发送id，但是后台报500的错误）
    issue(row){
      api.issueType(row).then(res=>{
        if(res.model.code==200){
          this.$message({
          showClose: true,
          message: res.model.msg,
          type: 'success'
        });
        }else{
        this.$message({
          showClose: true,
          message: res.model.msg,
          type: 'warning'
        });
        }    
    
      })
      // location.href = `${process.env.VUE_APP_BASE_API}/services/fwcore/template/down/${row.id}`
    },
    templateData(val){
      //这个获取模板id
      this.temData = {...val}
    },
    affirmInNode() {
      //获取当前代码块的值
      if(this.$refs.MonAco){
        this.inNode.scriptContent = this.$refs.MonAco.getVal()
      }
      this.jobList[this.currentRow].inNode.configValue = JSON.stringify(this.inNode)
      if(this.$refs.MonAco){
        this.$refs.MonAco.clearContent()
      }
      this.ShowInput_Database = false
    },
    affirmTransformNode() {
      //赋值操作
      this.transformNode.scriptContent = this.$refs.MonAcoTransformNode.getVal()   
      this.jobList[this.currentRow].transformNode.configValue = JSON.stringify(this.transformNode)
      this.$refs.MonAcoTransformNode.clearContent()
      //返回新增弹窗
      this.switchNode = false
    },
    affirmOutNode() {
      //获取当前代码块的值
      this.outNode.scriptContent = this.$refs.outMonAco.getVal()
      this.jobList[this.currentRow].outNode.configValue = JSON.stringify(this.outNode)
      //返回新增弹窗
      this.$refs.outMonAco.clearContent()
      this.Showoutput_Transfer = false
    },
    //输入节点配置按钮方法
    changeOptionsInput(data) {
      this.currentRow = data.$index
      this.inNode = JSON.parse(data.row.inNode.configValue)
      this.$nextTick(()=>{
        if(this.$refs.MonAco){
          this.$refs.MonAco.$data.defaultOpts.value = this.inNode.scriptContent
          this.$refs.MonAco.setValue(this.inNode.scriptContent)
        }
      })
      this.ShowInput_title = this.optionsInput.find(val=>val.value==data.row.inNode.type).label
      this.ShowInput_Database = true;
    },
    //任务列表的转换节点的配置按钮方法
    changeOptionsTransform(data) {
      this.currentRow = data.$index
      this.transformNode = JSON.parse(data.row.transformNode.configValue)
      this.$nextTick(()=>{
        if(this.$refs.MonAcoTransformNode){
          this.$refs.MonAcoTransformNode.$data.defaultOpts.value = this.transformNode.scriptContent
          this.$refs.MonAcoTransformNode.setValue(this.transformNode.scriptContent)
        }
      })
      this.switchNode_title = this.optionsTransform.find(val=>val.value==data.row.transformNode.type).label
      //返回
      this.switchNode = true;
    },
    //任务列表的输出节点的配置按钮方法
    changeOptionsOutput(data) {
      this.currentRow = data.$index
      this.outNode = JSON.parse(data.row.outNode.configValue)
      if(this.$refs.outMonAco){
        this.$refs.outMonAco.$data.defaultOpts.value = this.outNode.scriptContent
        this.$refs.outMonAco.setValue(this.outNode.scriptContent)
      }
      this.Showoutput_title = this.optionsOutput.find(val=>val.value==data.row.outNode.type).label
      //返回
      this.Showoutput_Transfer = true;
    },
    //参数的删除
    delTableData(index) {
      this.tableData.splice(index.$index, 1);
    },
    //任务列表的删除
    deljobList(data) {
      this.jobList.splice(data.$index, 1);
    },
    //参数的添加
    addParam() {
      this.tableData.push({'key':'','value':''});
    },
    //任务列表的添加
    addJob() {
      this.jobList.push({ valueName: "", 
      inNode:{
          //要什么就改成什么
          classify:"in",
          configValue:"{}",
          type:""
        },
          outNode: {
          classify: "out",
          configValue: "{}",
          type: ""
          },      
        transformNode: {
            classify:"transform",
            configValue: "{}",
            type: ""
          }
      }); 
    },
    //关闭模板选择按钮的跳转界面弹窗并赋值
    modelShow() {
      this.subFormData.templateName = this.temData.name
      this.subFormData.templateId = this.temData.id
      this.ShowMoule = false;
    },

    handleSelectionChange(selection) {
     
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
          })
        })
        .catch(() => {
        })
    },
    
    //新增&编辑的确认方法
    subForm(formData) {
      let obj = {
        ...this.subFormData,
        jobList:this.jobList
      }
      obj.configValue = this.tableData
      this.$refs[formData].validate((valid) => {
        if (valid) {
          console.log(this[formData])
          api
            .submitForm(obj)
            .then((res) => {
              this.$message.success("保存成功")
              this.getData(this.datas)
              console.log('res==>',res)
            })
            .catch(() => {})
        } else {
          return false
        }
      });
    },

    // 新增或编辑页面
  async edit(row) {
      //当为新增时，重置表单 row ==0  操作全是重置表单
      if(row===0){
        //初始化数据
        Object.keys(this.subFormData).forEach((key) => (this.subFormData[key] = null))
        this.tableData = []
        Object.keys(this.transformNodedata).forEach((key) => (this.transformNodedata[key] = null))
        Object.keys(this.inNode).forEach((key) => (this.inNode[key] = null))
        Object.keys(this.outNodeTypeData).forEach((key) => (this.outNodeTypeData[key] = null))
        this.jobList=[]
        //显示窗口
        this.dialogFormVisible = true
        return  
      }
      //编辑
      const res = await api.getIdRow(row.id)
      let data =JSON.parse(res.model)
      this.jobList = data.jobList
      this.tableData = JSON.parse(data.configValue)
      let {id,name,nodeId,templateId,tenantId,templateName} = data
      this.subFormData = {id,name,nodeId,templateId,templateName}
      //客户的key是字符串的
      this.subFormData.tenantId = tenantId + ""
      this.dialogFormVisible = true
    },
    getData(datas = this.datas) {
      this.$set(this, "datas", datas)
      this.$set(this, "params", datas.params)
      this.$set(this.datas.table, "loading", true)
      this.$set(this.params, "orgId", this.params.orgName)
      api.getPage({...this.params}).then((res) => {
        this.$set(this.datas.resData, "rows", res.model)
        this.$set(this.datas.params, "currentPage", res.currentPage)
        this.$set(this.datas.params, "pageSize", res.pageSize)
        this.$set(this.datas.resData, "totalCount", res.totalCount)
        this.$set(this.datas.table, "loading", false)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// lang ==>告诉webpack当前用的是什么预编译器
// scoped   当前下面写的样式只在当前的页面生效

.baseinfo {
  width: 400px;
}

.el-form-item {
  margin-bottom: 5px;
}

/deep/ .el-dialog__body {
    padding: 10px 20px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
}

/deep/ .el-form--label-top .el-form-item__label {
    float: none;
    display: inline-block;
    text-align: left;
    padding: 0 0 1px;
}
</style>