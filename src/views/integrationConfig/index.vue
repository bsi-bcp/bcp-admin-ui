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
    <!--新增/编辑界面  -->
    <el-dialog  class="pub_dialog"  :close-on-click-modal="false"  :close-on-press-escape="false" width="1120px"   :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
    <el-form label-position="top" inline-message size="mini" ref="configForm" :model="subFormData"  :rules="subFormDataRule" class="subFormData " label-width="100px">
        <!--新增界面的集成名称项-->
    <el-form-item label="集成名称" prop="name">
        <el-input class="baseinfo" v-model="subFormData.name" placeholder="集成名称"  maxlength="200" size="mini" auto-complete="off" />
    </el-form-item>
        <!--新增界面的客户项-->
    <el-form-item label="客户" prop="tenantId" v-if="cur_user.userType=='admin'">
        <el-select class="baseinfo" v-model="subFormData.tenantId" placeholder="请选择" size="mini">
          <el-option v-for="(optItem,optindex) in bcpTenantName" :key="optindex" :label="optItem" :value="optindex" />
        </el-select>
    </el-form-item>
        <!--新增界面的模板选择-->
      <el-form-item label="模板选择" prop="templateId">
        <el-input class="baseinfo" v-model="subFormData.templateName" disabled placeholder="模板选择" maxlength="20" size="mini" ></el-input>
        <el-button style="margin-left:5px" size="mini" @click="ShowMoule=true" :disabled="!!subFormData.id">选择模板</el-button>
      </el-form-item>
      <!--新增界面的集成节点-->
      <el-form-item label="集成节点" prop="nodeId">
        <el-input class="baseinfo" v-model="subFormData.nodeId" placeholder="集成节点" maxlength="20" size="mini" auto-complete="off"></el-input>
      </el-form-item>
        <!--新增界面的参数-->
        <el-form-item label="参数" prop="parameter" style="margin-top:20px;">
          <el-table :data="tableData" class="mt10" :cell-style="{padding:'10px 0px'}" :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit highlight-current-row style="width: 100%">
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
          <!-- 任务列表的滚动条 -->
          <el-table :data="jobList"  class="mt10" :cell-style="{padding:'5px 0px'}" :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit highlight-current-row style="width: 100%">
            <!--任务列表的选择点击按钮-->
            <el-table-column type="selection"  width="45">
            </el-table-column>
            <!--任务列表的名称-->
            <el-table-column prop="jobName" label="名称" align="center" width="240">
              <template slot-scope="scope">
                <el-col :span='20'>
                  <el-input v-model="scope.row['jobName']" />
                </el-col>
                <el-col :span='2'>
                <el-button type="text" width="30" @click="moveUp(scope.$index,scope.row)" icon="el-icon-top"></el-button>
                </el-col>
                <el-col :span='2'>
                <el-button type="text"  width="30" @click="moveDown(scope.$index,scope.row)" icon="el-icon-bottom"></el-button>
                </el-col>
              </template>
            </el-table-column>
            <!--任务列表的输入节点-->
            <el-table-column prop="inNode"  label="输入节点" align="center" width="180">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span='14'>
                    <el-select v-model="scope.row['inNode']['type']" placeholder="请选择">
                      <el-option v-for="(optItem,optindex) in optionsInput" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
                    </el-select>  
                  </el-col>
                  <el-col :span='10'>
                    <el-button type="text" :disabled="scope.row['inNode']['type']==''" @click="changeOptionsInput(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的转换节点-->
            <el-table-column prop="transformNode" label="转换节点" align="center" width="180">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span='14'>
                    <el-select v-model="scope.row['transformNode']['type']" placeholder="请选择" >
                      <el-option v-for="(optItem,optindex) in optionsTransform" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
                    </el-select>  
                  </el-col>
                  <el-col :span='10'>
                    <el-button type="text" :disabled="scope.row['transformNode']['type']==''" @click="changeOptionsTransform(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的输出节点-->
            <el-table-column prop="outNode" label="输出节点" align="center" width="180">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span="14">
                    <el-select v-model="scope.row['outNode']['type']" placeholder="请选择">
                      <el-option v-for="(optItem,optindex) in optionsOutput" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
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
            <el-table-column prop="oper" label="操作" align="center" width="230">
              <template slot-scope="scope">
              <div style="text-align:left">
                  <el-button type="text" @click="deljobList(scope)" width="30">删除</el-button>
                  <el-button type="text" disabled width="30">复制</el-button>
                  <el-button type="text" disabled width="30">调试</el-button>
                  <el-button type="text" disabled width="30">全量</el-button>
                  <el-button type="text" disabled width="30">日志</el-button>
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
        <el-button size="mini" type="primary" @click="subForm('configForm')" v-prevent-repeat-click>保存</el-button>
        <el-button size="mini" :disabled="subFormData.id==undefined"  type="primary" @click="issue(subFormData.id)" v-prevent-repeat-click>下发</el-button>
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
        <el-button size="mini" type="primary" @click="modelShow">确 定</el-button>
        <el-button size="mini" @click="ShowMoule = false">取 消</el-button>
      </div>
    </el-dialog>
    <!--任务列表的输入节点-->
    <el-dialog class="dialog-skip" width="60%" :title="ShowInput_title" :visible.sync="ShowInput_Database" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="inNodeForm" :model="inNode" label-width="100px" size="mini" :rules="inNodeFormRule" inline-message label-position="top">
        <el-form-item prop="cron" label="定时设置" v-if="ShowInput_title!='API上报'" >
          <el-input v-model="inNode.cron" placeholder="请输入" class="baseinfo"></el-input>
        </el-form-item>
        <el-form-item prop="dataSource" label="数据源">
          <el-select v-model="inNode.dataSource" placeholder="请选择" class="baseinfo"> 
            <el-option v-for="(optItem,optindex) in bcpDatasourceName" :key="optindex" :label="optItem" :value="optindex" />
          </el-select>
        </el-form-item>
        <el-form-item label="增量标识字段" v-if="ShowInput_title=='数据库查询'">
          <el-input v-model="inNode.IncrementalField" placeholder="请输入" class="baseinfo"></el-input>
        </el-form-item>
        <el-form-item prop="path" label="访问路径" v-if="ShowInput_title=='API查询'||ShowInput_title=='API上报'">
          <el-input v-model="inNode.path" placeholder="请输入" class="baseinfo" :title="inNode.path"></el-input>
        </el-form-item>
        <el-form-item required label="脚本" v-if="ShowInput_title!='API上报'" >
          <MonAco ref='MonAco'></MonAco>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="affirmInNode">确 定</el-button>
        <el-button size="mini" @click="ShowInput_Database = false">取 消</el-button>
      </div>
    </el-dialog>
    <!--任务列表的转换节点-->
    <el-dialog class="dialog-skip" width="60%" :title="switchNode_title" :visible.sync="switchNode" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="transformNodeForm" label-width="100px" size="mini" inline-message label-position="top">
        <el-form-item label="脚本" required>
          <MonAco ref='MonAcoTransformNode'></MonAco>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="affirmTransformNode">确 定</el-button>
        <el-button size="mini" @click="switchNode = false">取 消</el-button>
      </div>
    </el-dialog>
    <!--任务列表的输出节点-->
    <el-dialog class="dialog-skip" width="60%" :title="Showoutput_title" :visible.sync="Showoutput_Transfer" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="outNodeForm" :rules="outNodeFormRule" :model="outNode" label-width="100px" size="mini" inline-message label-position="top">
        </el-form-item>
          <el-form-item prop="dataSource" label="数据源" v-if="Showoutput_title=='API调用'||Showoutput_title=='数据库回写'">
          <el-select v-model="outNode.dataSource" placeholder="请选择" class="baseinfo"> 
            <el-option v-for="(optItem,optindex) in bcpDatasourceName" :key="optindex" :label="optItem" :value="optindex" />
          </el-select>
        </el-form-item>
        <el-form-item label="访问路径" v-if="Showoutput_title=='API调用'" prop="path">
          <el-input v-model="outNode.path" placeholder="请输入" class="baseinfo"></el-input>
        </el-form-item>
        <el-form-item label="脚本" required>
          <MonAco ref='outMonAco'></MonAco>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="affirmOutNode">确 定</el-button>
        <el-button size="mini" @click="Showoutput_Transfer = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as sel from "@/api/select";
import * as api from "@/api/IntegratedConfig";
import * as menuApi from '@/api/menu'

//引入组件
import multipleTable from "./moudel/multipleTable";
import MonAco from "./moudel/monaco";
import { deepEqual } from 'assert';
import { connect } from 'tls';
import { mapGetters } from 'vuex'

export default {
  //组件注册
  components: {
    multipleTable,
    MonAco
  },
  data() {
    return {
      showEditor: 0,
      currentRow: 0,
      bcpDatasourceName:[],
      bcpTenantName:[],
      exampleData:[], //示例数据
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
        scriptContent: null
      },
      transformNode: {
        IncrementalField: null, //增量标识字段
        dataSource: null, //增量标识字段
        scriptContent: null
      },
      jobList: [],
      tableData: [{}],//使打开新增窗口时参数新增行数不为空
      dialogFormVisible: false,
      subFormData: {
        id: null,
        name: null,
        nodeId: null,
        templateId: null,
        tenantId: null,
        templateName:null,
      },
      optionsInput: [],
      optionsTransform: [],
      optionsOutput: [],
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
      inNodeFormRule: {
        dataSource: [
          {
            required: true,
            message: "请选择数据源",
            trigger: 'change'
          }
        ],
        cron: [
          {
            required: true,
            message: "请填写定时配置",
            trigger: 'blur'
          }
        ],
        IncrementalField: [
          {
            required: true,
            message: "请填写自增字段",
            trigger: 'blur'
          }
        ],
        path: [
          {
            required: true,
            message: "请填写访问路径",
            trigger: 'blur'
          }
        ]
      },
      outNodeFormRule: {
        dataSource: [
          {
            required: true,
            message: "请选择数据源",
            trigger: 'change'
          }
        ],
        path: [
          {
            required: true,
            message: "请填写访问路径",
            trigger: 'blur'
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
            type: "input",
            queryName: '关键词',
            prop: "name",
            conditionshow: true,
            filedShow: true,
            label: "名称",
            placeholder: "关键词",
            optList: [],
            align:"left",
          },
          {
            type: "input",
            prop: "tenantName",
            conditionshow: false,
            filedShow: true,
            label: "客户",
            placeholder: "客户",
            optList: []
          },
          {
            type: "input",
            prop: "templateName",
            conditionshow: false,
            filedShow: true,
            label: "模板",
            placeholder: "模板",
            optList: []
          },
          {
            type: "input",
            prop: "lastUpdateTime",
            conditionshow: false,
            filedShow: true,
            label: "修改时间",
            placeholder: "修改时间",
            optList: []
          },
          {
            type: "input",
            prop: "status",
            conditionshow: false,
            filedShow: true,
            label: "状态",
            placeholder: "状态",
            optList: []
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
            optList: []
          }
        ],
      },
      temData:{}
    };
  },
  async created() {
    this.initOptions()
  },
  computed: {
    ...mapGetters([
      'cur_user'
    ])
  },
  methods: {
    initOptions() {
      sel.getFreelist({ code: 'bcp.tenant.name'}).then((res) => {
        this.bcpTenantName = res.model
      })
      sel.getFreelist({ code: 'bcp.datasource.name',params:this.cur_user.tenantId}).then((res) => {
        this.bcpDatasourceName = res.model
      })
      sel.getFreelist({ code: 'bcp.example.data'}).then((res) => {
        this.exampleData = res.model
      })
      menuApi.getSourceTypeOptions('md.bcp.input.type').then(res => {
        this.optionsInput = res.model
      })
      menuApi.getSourceTypeOptions('md.bcp.transform.type').then(res => {
        this.optionsTransform = res.model
      })
      menuApi.getSourceTypeOptions('md.bcp.output.type').then(res => {
        this.optionsOutput = res.model
      })
      
    },
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
    //下发（存在前端这边已向后台发送id，但是后台报500的错误）
    issue(row){
      api.issueType(row).then(res=>{
        if(res.model.code==200){
          this.$message({
            showClose: true,
            message: '下发成功!',
            type: 'success'
          })
          this.getData(this.datas)
        }else{
          this.$message({
            showClose: true,
            message: res.model.msg,
            type: 'error'
          })
        }    
      })
    },
    //任务列表的上移
    moveUp(index, row) {
      var that = this;
      console.log('上移', index, row);
      console.log(that.jobList[index]);
      if (index > 0) {
        let upDate = that.jobList[index - 1];
        that.jobList.splice(index - 1, 1);
        that.jobList.splice(index, 0, upDate);
      } else {
        alert('已经是第一条，不可上移');
      }
    },
    //任务列表的下移
    moveDown(index, row) {
      var that = this;
      console.log('下移', index, row);
      if ((index + 1) === that.jobList.length) {
        alert('已经是最后一条，不可下移');
      } else {
        console.log(index);
        let downDate = that.jobList[index + 1];
        that.jobList.splice(index + 1, 1);
        that.jobList.splice(index, 0, downDate);
      }
    },
    
    templateData(val,type){
      this.temData = {...val}
      if(type==2){
        this.modelShow()
      }
    },
    affirmInNode() {
      this.$refs.inNodeForm.validate((valid) => {
        if (valid) {
          //获取当前代码块的值
          if(this.$refs.MonAco){
            this.inNode.scriptContent = this.$refs.MonAco.getVal()
            if(!this.scriptNotNull(this.inNode)){
              return false
            }
          }
          this.jobList[this.currentRow].inNode.configValue = JSON.stringify(this.inNode)
          if(this.$refs.MonAco){
            this.$refs.MonAco.clearContent()
          }
          this.ShowInput_Database = false
        }
      })
    },
    scriptNotNull(node){
      if(node.scriptContent===''){
        this.$message({
          showClose: true,
          message: '脚本为必填项',
          type: 'error'
        })
        return false
      } 
      return true
    },
    affirmTransformNode() {
      //赋值操作
      this.transformNode.scriptContent = this.$refs.MonAcoTransformNode.getVal()  
      if(!this.scriptNotNull(this.transformNode)){
        return false
      }
      this.jobList[this.currentRow].transformNode.configValue = JSON.stringify(this.transformNode)
      this.$refs.MonAcoTransformNode.clearContent()
      //返回新增弹窗
      this.switchNode = false
    },
    affirmOutNode() {
      this.$refs.outNodeForm.validate((valid) => {
        if (valid) {
           //获取当前代码块的值
          this.outNode.scriptContent = this.$refs.outMonAco.getVal()
          if(!this.scriptNotNull(this.outNode)){
            return false
          }
          this.jobList[this.currentRow].outNode.configValue = JSON.stringify(this.outNode)
          //返回新增弹窗
          this.$refs.outMonAco.clearContent()
          this.Showoutput_Transfer = false
        }
      })
    },
    //任务列表的输入节点配置按钮方法
    changeOptionsInput(data) {
      if(this.$refs.inNodeForm){
        this.$refs.inNodeForm.clearValidate()
      }
      this.currentRow = data.$index
      this.inNode = JSON.parse(data.row.inNode.configValue)
      if(this.inNode.scriptContent===undefined){
        this.inNode.scriptContent = this.exampleData["in"]
      }
      setTimeout(()=>{
        this.showEditor=1
        this.$nextTick(()=>{
          if(this.$refs.MonAco){
            this.setValue(this.$refs.MonAco,this.inNode)
          }
        })
      },50)
      this.ShowInput_title = this.optionsInput.find(val=>val.propkey==data.row.inNode.type).propvalue
      this.ShowInput_Database = true;
    },
    //任务列表的转换节点的配置按钮方法
    changeOptionsTransform(data) {
      if(this.$refs.transformNodeForm){
        this.$refs.transformNodeForm.clearValidate()
      }
      this.currentRow = data.$index
      this.transformNode = JSON.parse(data.row.transformNode.configValue)
      if(this.transformNode.scriptContent===undefined){
        this.transformNode.scriptContent = this.exampleData["transform"]
      }
      setTimeout(()=>{
        this.showEditor=2
        this.$nextTick(()=>{
          if(this.$refs.MonAcoTransformNode){
            this.setValue(this.$refs.MonAcoTransformNode,this.transformNode)
          }
        })
      },50)
      
      this.switchNode_title = this.optionsTransform.find(val=>val.propkey==data.row.transformNode.type).propvalue
      //返回
      this.switchNode = true;
    },
    //任务列表的输出节点的配置按钮方法
    changeOptionsOutput(data) {
      if(this.$refs.outNodeForm){
        this.$refs.outNodeForm.clearValidate()
      }
      this.currentRow = data.$index
      this.outNode = JSON.parse(data.row.outNode.configValue)
      if(this.outNode.scriptContent===undefined){
        this.outNode.scriptContent = this.exampleData["out"]
      }
      setTimeout(()=>{
        this.showEditor=3
        this.$nextTick(()=>{
          if(this.$refs.outMonAco){
            this.setValue(this.$refs.outMonAco,this.outNode)
          }
        })
      },50)
      this.Showoutput_title = this.optionsOutput.find(val=>val.propkey==data.row.outNode.type).propvalue
      //返回
      this.Showoutput_Transfer = true;
    },
    setValue(monaco,node){
        monaco.$data.defaultOpts.value = node.scriptContent
        monaco.setValue(node.scriptContent)
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
      this.tableData.push({ 'key':'', 'value':'' });
    },
    //任务列表的添加
    addJob() {
      this.jobList.push({ valueName: "", 
      inNode:{
          //要什么就改成什么
          classify: "in",
          configValue: "{}",
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
      //设置模板名称和模板id
      this.subFormData.templateName = this.temData.name
      this.subFormData.templateId = this.temData.id
      //加载模板内容
      api.getTemplateContent(this.temData.id).then(res=>{
        this.jobList = res.jobList
        this.tableData = res.configValue!=null?JSON.parse(res.configValue):[]
      })
      this.ShowMoule = false;
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
          api
            .submitForm(obj)
            .then((res) => {
              this.$message.success("保存成功")
              console.log(res.model)
              this.subFormData.id = res.model
              this.getData(this.datas)
            })
            .catch(() => {})
        } else {
          return false
        }
      })
    },
  clearValidate(){
    if( !!this.$refs.configForm ){
      this.$refs.configForm.clearValidate()
    }
  },
    // 新增或编辑页面
  async edit(row) {
      //重置验证
      this.clearValidate()
      //当为新增时，重置表单 row ==0  操作全是重置表单
      if(row===0){
        //初始化数据
        Object.keys(this.subFormData).forEach((key) => (this.subFormData[key] = null))
        this.tableData = []
        Object.keys(this.transformNode).forEach((key) => (this.transformNode[key] = null))
        Object.keys(this.inNode).forEach((key) => (this.inNode[key] = null))
        Object.keys(this.outNode).forEach((key) => (this.outNode[key] = null))
        this.jobList=[]
        //默认自定义模板
        this.subFormData.templateName = '自定义'
        this.subFormData.templateId = 0
        //客户默认当前用户所属租户
        this.subFormData.tenantId = this.cur_user.tenantId+'';
        // this.subFormData.tenantId = Object.keys(this.bcpTenantName)[0]
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
      tenantId = tenantId + ""
      this.subFormData = {id,name,nodeId,templateId,tenantId,templateName}
      this.dialogFormVisible = true
    },
    getData(datas = this.datas) {
      this.$set(this, "datas", datas)
      this.$set(this, "params", datas.params)
      this.$set(this.datas.table, "loading", true)
      this.$set(this.params, "orgId", this.params.orgName)
      api.getPage({...this.params, key: this.datas.filterList[0].name}).then((res) => {
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

.baseinfo {
  width: 400px;
}

//设置el-form的样式
.el-form-item {
  margin-bottom: 5px;
}

.debug{
margin-left: 0px;
}

//设置form-item中lable的样式
/deep/ .el-form--label-top .el-form-item__label {
    float: none;
    display: inline-block;
    text-align: left;
    padding: 0 0 1px;
}
//设置弹出窗口内容样式
/deep/ .el-dialog__body {
    padding: 10px 20px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
}

//新增弹窗样式
/deep/ .pub_dialog .el-dialog {
  margin-top: 10vh !important;
  position: relative;
  margin: 0 auto 0px;
  background: #FFFFFF;
  border-radius: 2px;
  -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 50%;
  height: 80%;
}

//新增弹窗样式，设置拉拽
/deep/ .pub_dialog .el-dialog .el-dialog__body {
  max-height:80%  !important;
  overflow-y: auto;
}


</style>