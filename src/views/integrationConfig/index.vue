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
    <el-dialog :close-on-click-modal="false"  :close-on-press-escape="false" width="1200px" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible">
    <el-form ref="subFormData" :model="subFormData"  :rules="subFormDataRule" class="subFormData " label-width="100px" >
    <el-row>

      <el-col :span='12'>
        <!--新增界面的集成名称项-->
        <el-form-item label="集成名称" prop="name" >
          <el-input v-model="subFormData.name" placeholder="集成名称"  maxlength="20" size="large" auto-complete="off" /></el-form-item>
      </el-col>
      <el-col :span='12'>
        <!--新增界面的客户项-->
        <el-form-item label="客户" prop="tenantId">
          <el-select v-model="subFormData.tenantId" placeholder="请选择">
            <el-option
              v-for="item in bcpTenantName"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <!-- <sxf-freelist v-model="subFormData.tenantId"   code="bcp.tenant.name" size="large" placeholder="请选择客户项" /> -->
        </el-form-item>
      </el-col>
      </el-row> 
        <!--新增界面的集成节点-->
        <el-form-item label="集成节点" prop="nodeId">
          <el-input v-model="subFormData.nodeId" placeholder="集成节点" maxlength="20" size="large" auto-complete="off"  ></el-input>
        </el-form-item>
        <!--新增界面的模板选择-->
      <el-row>
        <el-col :span="22">
          <el-form-item label="模板选择" prop="templateId">
            <!-- 布局的一行（el-row）的宽度分为24等份，通过span属性来确定每一个列el-col的宽度，占了24份中的几份 -->
            <el-input v-model="subFormData.templateName" disabled placeholder="模板选择" maxlength="20" size="large"   ></el-input>
          </el-form-item>
        </el-col>
          <el-col :span="2">
            <el-button @click="ShowMoule=true">选择模板</el-button>
          </el-col>
      </el-row>

        <!--新增界面的参数-->
        <el-form-item label="参数" prop="parameter">
          <!-- border=>使表格带边框 -->
          <el-table ref="multipleTable" :data="tableData" border tooltip-effect="dark" style="width: 100%"   @select="handleSelectionChange">
            <!-- align="center"使内容居中 -->
            <el-table-column label="参数名称" align="center">
              <!-- slot-scope="scope"获取表格到当前行的数据 -->
              <template slot-scope="scope">
                <el-input v-model="scope.row.parameterName" />
              </template>
            </el-table-column>
            <el-table-column  label="参数数据" align="center">
              <template slot-scope="scope">
                <!-- parameterValues 改为 cron （9月8日）-->
                <el-input v-model="scope.row.cron" />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
              <el-button type="text" @click="delTableData(scope)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!--参数的添加按钮-->
           <el-row>
            <el-button style="width:100%;margin-top:10px;" @click="tableAdd" >添加</el-button>
          </el-row>
          <!-- <div @click="tableAdd">添加</div> -->
        </el-form-item>
        <!--新增界面的插件文件（暂不需）-->
        <!-- <el-form-item label="插件文件" prop="">
          <el-button type="primary">上传插件<i class="el-icon-upload el-icon--right"></i></el-button>
        </el-form-item> -->
        <!--新增界面的任务列表-->
        <el-form-item label="任务列表" >
          <!-- border=>使表格带边框 -->
          <el-table ref="multipleTable" :data="jobList" border tooltip-effect="dark"style="width: 100%" @select="handleSelectionChange">
            <!--任务列表的选择点击按钮-->
            <el-table-column type="selection"  width="55">
            </el-table-column>
            <!--任务列表的名称-->
            <el-table-column prop="jobName" label="名称" align="center" width="150">
              <template slot-scope="scope">
                <el-input v-model="jobList[scope.$index].jobName" />
              </template>
            </el-table-column>
            <!--任务列表的输入节点-->
            <el-table-column  label="输入节点" align="center" width="230">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span='14'>
                    <el-select v-model="jobList[scope.$index].valueInputName" placeholder="请选择">
                      <el-option
                        v-for="item in optionsInput"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>  
                  </el-col>
                  <el-col :span='10'>
                    <el-button :disabled="jobList[scope.$index].valueInputName==undefined" @click="changeOptionsInput(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的转换节点-->
            <el-table-column label="转换节点" align="center" width="230">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span='14'>
                    <el-select v-model="jobList[scope.$index].valueTransformName" placeholder="请选择" >
                      <el-option
                        v-for="item in optionsTransform"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>  
                  </el-col>
                  <el-col :span='10'>
                    <el-button :disabled="jobList[scope.$index].valueTransformName==undefined" @click="changeOptionsTransform(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的输出节点-->
            <el-table-column label="输出节点" align="center" width="230">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span="14">
                    <el-select v-model="jobList[scope.$index].valueOutputName" placeholder="请选择">
                      <el-option
                        v-for="item in optionsOutput"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-col>
                  <el-col :span="10">
                    <!-- 不选择则不能点击=>:disabled="jobList[scope.$index].valueOutputName==undefined" -->
                    <el-button :disabled="jobList[scope.$index].valueOutputName==undefined" @click="changeOptionsOutput(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的状态-->
            <el-table-column prop="status" label="状态" align="center" width="80">
              <!-- 9月8日更新=> 值为未配置-->
            </el-table-column>
            <!--任务列表的操作-->
            <el-table-column prop="oper" label="操作" align="center" width="80">
              <template slot-scope="scope">
              <el-row>
                <el-col :span="8">  
                <el-button type="text" @click="deljobList(scope)">删除</el-button>
                </el-col>
              </el-row>
              </template>
            </el-table-column>
          </el-table>
          <!--任务列表的按钮-->
          <el-row>
            <el-button style="width:100%;margin-top:10px;" @click="tableAddSecond" >添加</el-button>
          </el-row>
        </el-form-item>
      </el-form>
      <!--新增界面的确定取消-->
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
        <el-button size="mini" :disabled="subFormData.id==undefined"  type="primary" @click="issue(subFormData.id)">下发</el-button>
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
      <el-form ref="inNode" :model="inNode"   label-width="100px" >
        <el-form-item label="定时设置" v-if="ShowInput_title!='API上报'">
          <el-input v-model="inNode.timingSettings" placeholder="请输入定时设置"></el-input>
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
    <el-dialog width="50%" title="switchNode_title" :visible.sync="switchNode" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="transformNode"   label-width="100px" >
        <el-form-item label="脚本" >
          <MonAco1 ref='MonAcoTransformNode'></MonAco1>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="switchNode = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="affirmTransformNode">确 定</el-button>
      </div>
    </el-dialog>
    <!--任务列表的输出节点-->
    <el-dialog width="50%" title="Showoutput_title" :visible.sync="Showoutput_Transfer" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="outNode" :model="outNodeTypeData" label-width="100px" >
        </el-form-item>
          <el-form-item label="数据源" v-if="Showoutput_title=='API调用'||Showoutput_title=='数据库回写'">
          <sxf-freelist v-model="outNodeTypeData.dataSource" code="bcp.datasource.name" />
        </el-form-item>
        <el-form-item label="访问路径" v-if="Showoutput_title=='API调用'">
          <el-input v-model="outNodeTypeData.IncrementalField" placeholder="增量标识字段"></el-input>
        </el-form-item>
        <el-form-item label="脚本" >
          <MonAco2 ref='outNodeData'></MonAco2>
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
import MonAco1 from "./moudel/monaco";
import MonAco2 from "./moudel/monaco";
import MonAco from "./moudel/monaco";
export default {
  //组件注册
  components: {
    multipleTable,
    MonAco,
    MonAco1,
    MonAco2,
  },
  data() {
    return {
      bcpDatasourceName:[],
      bcpTenantName:[],
      value: "",
      ShowInput_title: "",
      switchNode_title: "",
      Showoutput_title: "",
      transformNodedata: {
        MonAcoData:'',
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
        timingSettings: null, //定时设置
        IncrementalField: null, //增量标识字段
        dataSource: null, //增量标识字段
      },
      outNodeTypeData: {
        MonAcoData:'',
        index:0,
        IncrementalField: null, //访问路径
      },
      jobList: [  
        {
        inNode:{
          //要什么就改成什么
          classify:"in",
          configValue:"",
          type:""
        },
        outNode: {
          classify: "out",
          configValue: "",
          type: ""
        },      
        transformNode: {
          classify:"transform",
          configValue: "",
          type: ""
        }
        }
       ],
      tableData: [{}],//使打开新增窗口时参数新增行数不为空
      dialogFormVisible: false,
      subFormData: {
        name: null,
        nodeId: null,
        templateId: null,
        tenantId: 419,
        templateName:null,
      },
      optionsInput: [
        {
          value: 1,
          label: "数据库查询",
        },
        {
          value: 2,
          label: "API查询",
        },
        {
          value: 3,
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
          },
        ],
        code: [
          {
            required: true,
            message: "请填写编码",
          },
        ],
        plan: [
          {
            required: true,
            message: "请填写运行计划",
          },
        ],
        execService: [
          {
            required: true,
            message: "请填写绑定service",
          },
        ],
        cron: [
          {
            required: true,
            message: "请填写cron",
          },
        ],
        type: [
          {
            required: true,
            message: "请填写类型",
          },
        ],
        userCaseId: [
          {
            required: true,
            message: "请填写绑定用户场景",
          },
        ],
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
      console.log("val",val)
      this.temData = {...val}
    },
    affirmInNode() {
      //获取当前代码块的值
      this.$nextTick(()=>{
      this.inNode.MonAcoData = this.$refs.MonAco.getVal()
      })
      console.log(this.inNode.idnex)
      this.jobList[this.inNode.idnex].inNode.type = this.jobList[this.inNode.idnex].valueInputName
      let data = JSON.parse(JSON.stringify(this.inNode))
      this.jobList[this.inNode.idnex].inNode.configValue = JSON.stringify(data)
      this.ShowInput_Database = false
    },
    affirmTransformNode() {
      //获取当前代码块的值      
        this.$nextTick(()=>{
    this.transformNodedata.MonAcoData = this.$refs.MonAcoTransformNode.getVal()
      })
       //赋值操作
      this.joLbist[this.transformNodedata.index].transformNode.type = this.jobList[this.transformNodedata.index].valueTransformName
     let data = JSON.parse(JSON.stringify(this.transformNodedata))
    this.jobList[this.transformNodedata.index].transformNode.configValue = JSON.stringify(data)
        //返回新增弹窗
        this.switchNode = false
    },
    affirmOutNode() {
          this.$nextTick(()=>{
    this.outNodeTypeData.MonAcoData =  this.$refs.outNodeData.getVal()
      })

    this.jobList[this.outNodeTypeData.index].transformNode.type = this.jobList[this.outNodeTypeData.index].valueOutputName
     let data = JSON.parse(JSON.stringify(this.outNodeTypeData))
     console.log(data)
     console.log(JSON.stringify(data))
    this.jobList[this.outNodeTypeData.index].outNode.configValue = JSON.stringify(data)
      //获取当前代码块的值
    
        //返回新增弹窗
        this.Showoutput_Transfer = false
    },
    //任务列表的输入节点的配置按钮方法
    changeOptionsInput(data) {
      console.log(data)
      if(data.row.id!==undefined){
        this.inNode = JSON.parse(data.row.inNode.configValue)
        this.$nextTick(()=>{
        this.$refs.MonAco.$data.defaultOpts.value = this.inNode.MonAcoData
        this.$refs.MonAco.setValue(this.inNode.MonAcoData)
      
        })
      }else{
        this.inNode={
            timingSettings: null, //定时设置
          IncrementalField: null, //增量标识字段
          dataSource: null, //增量标识字段
          }
      }
      //声明
      const map = {
        1: () => {
          this.ShowInput_title = "数据库查询";
        },
        2: () => {
          this.ShowInput_title = "API查询";
        },
        3: () => {
          this.ShowInput_title = "API上报";
        },
      };
      //返回
      this.inNode.idnex = data.$index
      this.ShowInput_Database = true;
      return map[Number(data.row.valueInputName)]();
    },
    //任务列表的转换节点的配置按钮方法
    changeOptionsTransform(data) {
    console.log('data0',data)
           if(data.row.id!==undefined){
        this.inNode = JSON.parse(data.row.inNode.configValue)
        this.$nextTick(()=>{
        this.$refs.MonAcoTransformNode.$data.defaultOpts.value = this.inNode.MonAcoData
        this.$refs.MonAcoTransformNode.setValue(this.inNode.MonAcoData)
        })

      }
      //声明
      const map = {
        1: () => {
          this.switchNode_title = "脚本转换";
        },
      };
      console.log(data)
      //返回
      this.transformNodedata.index = data.$index
      this.switchNode = true;
      return map[Number(data.row.valueTransformName)]();
    },
    //任务列表的输出节点的配置按钮方法
    changeOptionsOutput(data) {
        console.log(data)
                 if(data.row.id!==undefined){
         this.outNodeTypeData = JSON.parse(data.row.outNode.configValue)
         console.log(  this.outNodeTypeData)
        this.$nextTick(()=>{
        // this.$refs.MonAco.$data.defaultOpts.value = this.inNode.MonAcoData
        // this.$refs.MonAco.setValue(this.inNode.MonAcoData)
        // console.log('this.$refs.MonAco',this.$refs.MonAco.setValue(this.inNode.MonAcoData))
        // this.$refs.MonAco.init()
        })

      }else{
        this.outNodeTypeData ={
            MonAcoData:'',
        index:0,
        IncrementalField: null, //访问路径
        }
      }
      const map = {
        1: () => {
          this.Showoutput_title = "API调用";
        },
        2: () => {
          this.Showoutput_title = "数据库回写";
        },
        3: () => {
          this.Showoutput_title = "自定义脚本";
        },
      };
       this.outNodeTypeData.index = data.$index
      //返回
      this.Showoutput_Transfer = true;
      return map[Number(data.row.valueOutputName)]();
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
    tableAdd() {
      this.tableData.push({

        inNode:{
          //要什么就改成什么
          classify:"in",
          configValue:"",
          type:""
        },
          outNode: {
          classify: "out",
          configValue: "",
          type: ""
          },      
        transformNode: {
            classify:"transform",
            configValue: "",
            type: ""
          }
      });
    },
    //任务列表的添加
    tableAddSecond() {
      this.jobList.push({ valueName: "", 
      inNode:{
          //要什么就改成什么
          classify:"in",
          configValue:"",
          type:""
        },
          outNode: {
          classify: "out",
          configValue: "",
          type: ""
          },      
        transformNode: {
            classify:"transform",
            configValue: "",
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
      let  obj  ={
        ...this.subFormData,
        jobList:this.jobList
      }
      obj.configValue={
          tableData:JSON.stringify(this.tableData),
          subFormData:JSON.stringify(this.subFormData),
          jobList:JSON.stringify(this.jobList)
        },
      this.$refs[formData].validate((valid) => {
        if (valid) {
          console.log(this[formData]);
          api
            .submitForm(obj)
            .then((res) => {
              this.$message.success("保存成功");
              this.getData(this.datas);
              console.log('res==>',res)
              // this.dialogFormVisible = false;
            })
            .catch(() => {});
        } else {
          return false;
        }
      });
    },

    // 新增或编辑页面
  async edit(row) {
      //当为新增时，重置表单 row ==0  操作全是重置表单
      if(row===0){
        //row 等于0的时候令this.subFormData为默认值name等等
        this.subFormData = {
          name: null,
          nodeId: null,
          templateId: null,
          tenantId: null,
          templateName:null,
        }
        //令this.tableData为默认值为空数组
        this.tableData = [{}]
        this.transformNodedata={
        MonAcoData:null,
        //让外面的赋值操作获取当前的下标
        index:0,
        }
        //制空任务列表里面所选表单的内容
        this.inNode={
        index:0,//获取当前行数
        timingSettings: null, //定时设置
        IncrementalField: null, //增量标识字段
        dataSource: null, //增量标识字段
        }
        this.outNodeTypeData={
        index:0,
        MonAcoData:'',//提前给她占个坑蛤
        IncrementalField: null, //访问路径
        },
        //制空任务列表
        this.jobList=[  
        {
          inNode:{
              classify:"in",
              configValue:"",
              type:""
            },
            outNode: {
              classify: "out",
              configValue: "",
              type: ""
            },      
            transformNode: {
              classify:"transform",
              configValue: "",
              type: ""
            }
        }
        ]
        this.dialogFormVisible = true;
        return  
      }
    this.dialogFormVisible = true;
    const res = await api.getIdRow(row.id)
    let data =JSON.parse(res.model)
    console.log('data=>',data.jobList)
    let configValue =  JSON.parse(data.configValue)

    this.jobList = JSON.parse(configValue.jobList)
    data.jobList.forEach(item=>{
      this.jobList.forEach(it=>{
        if(item.jobName==it.jobName){
          it.id = item.id
        }
      })
    })
    console.log('data=>1111',this.jobList )

    this.tableData = JSON.parse(configValue.tableData)
    this.subFormData = JSON.parse(configValue.subFormData)
    let {id} = data
    this.subFormData.id = id
    },

    getData(datas = this.datas) {
      this.$set(this, "datas", datas);
      this.$set(this, "params", datas.params);
      this.$set(this.datas.table, "loading", true);
      this.$set(this.params, "orgId", this.params.orgName);
      api.getPage({...this.params}).then((res) => {
        this.$set(this.datas.resData, "rows", res.model);
        this.$set(this.datas.params, "currentPage", res.currentPage);
        this.$set(this.datas.params, "pageSize", res.pageSize);
        this.$set(this.datas.resData, "totalCount", res.totalCount);
        this.$set(this.datas.table, "loading", false);
      });
    },

  },
};
</script>

<style lang="scss" scoped>
// lang ==>告诉webpack当前用的是什么预编译器
// scoped   当前下面写的样式只在当前的页面生效=>解决样式混乱的问题
/deep/ .el-table__header-wrapper .el-checkbox {
  display: none;
}
</style>
