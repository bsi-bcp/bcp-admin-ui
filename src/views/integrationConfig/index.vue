<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
      </template>
      <template slot="oper" slot-scope="scope">
        <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>
        <el-button v-if="menuURL.indexOf('IMC')<0" size="mini" type="text" @click="derive(scope.value)">导出</el-button>
        <el-button v-if="menuURL.indexOf('IMC')<0" size="mini" type="text" @click="expForIot(scope.value)">导出iot</el-button>
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
        <el-form-item label="插件文件">
          <!--on-exceed文件超出个数；:limit最大允许上传个数；http-request实现自定义上传；	action必选参数，上传的地址；before-upload 限制用户上传的图片格式和大小-->
          <el-upload 
            ref="pluginsUpload"
            :disabled="!subFormData.id"
            :on-preview="handlePreview"
            :on-exceed="exceedFile"
            :file-list="fileList"
            :limit="5"
            :http-request="handleUpload"
            action='undefined'
            :beforeUpload="beforeUpload">
              <el-button v-if="subFormData.id" size="small" type="text">上传插件<i class="el-icon-upload el-icon--right"></i></el-button>
          </el-upload>
        </el-form-item>
        <!--新增界面的任务列表-->
        <el-form-item label="任务列表" style="margin-top:20px;">
          <!-- 任务列表的滚动条 -->
          <div style="float:right;margin-bottom:10px;">
            <el-button size="mini" type="primary" @click="import_flag=true">导入</el-button>
            <el-button size="mini" type="primary" @click="batchSetParams">批量设置</el-button>
            <el-button size="mini" type="primary" @click="enableAll('true')">一键启用</el-button>
            <el-button size="mini" type="primary" @click="enableAll('false')">一键禁用</el-button>
          </div>
          <el-table :data="jobList"  class="mt10" :cell-style="{padding:'5px 0px'}" :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit highlight-current-row style="width: 100%">
            <!--任务列表的选择点击按钮-->
            <!-- <el-table-column type="selection"  width="45">
            </el-table-column> -->
            <!--任务列表的名称-->
            <el-table-column prop="jobName" label="名称" align="center" width="210">
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
            <el-table-column prop="inNode"  label="输入节点" align="center" width="190">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span='16'>
                    <el-select v-model="scope.row['inNode']['type']" placeholder="请选择">
                      <el-option v-for="(optItem,optindex) in optionsInput" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
                    </el-select>  
                  </el-col>
                  <el-col :span='8'>
                    <el-button type="text" :disabled="scope.row['inNode']['type']==''" @click="changeOptionsInput(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的转换节点-->
            <el-table-column prop="transformNode" label="转换节点" align="center" width="180">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span='16'>
                    <el-select v-model="scope.row['transformNode']['type']" placeholder="请选择" >
                      <el-option v-for="(optItem,optindex) in optionsTransform" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
                    </el-select>  
                  </el-col>
                  <el-col :span='8'>
                    <el-button type="text" :disabled="scope.row['transformNode']['type']==''" @click="changeOptionsTransform(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的输出节点-->
            <el-table-column prop="outNode" label="输出节点" align="center" width="190">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span="16">
                    <el-select v-model="scope.row['outNode']['type']" placeholder="请选择">
                      <el-option v-for="(optItem,optindex) in optionsOutput" :key="optindex" :label="optItem.propvalue" :value="optItem.propkey" />
                    </el-select>
                  </el-col>
                  <el-col :span="8">
                    <!-- 不选择则不能点击=>:disabled="jobList[scope.$index].outputType==undefined" -->
                    <el-button type="text" :disabled="scope.row['outNode']['type']==''" @click="changeOptionsOutput(scope)">配置</el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的状态-->
            <el-table-column prop="status" label="状态" align="center" width="100">
               <template slot-scope="scope">
                <el-row>
                  <el-col :span="24">
                    <el-select v-model="scope.row['enable']">
                      <el-option label="启用" value="true"></el-option>
                      <el-option label="禁用" value="false"></el-option>
                    </el-select>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的操作-->
            <el-table-column prop="oper" label="操作" align="center" width="210">
              <template slot-scope="scope">
                <div style="text-align:left">
                  <el-button type="text" @click="copyJob(scope)" width="30">复制</el-button>
                  <el-button type="text" @click="deljobList(scope)" width="30">删除</el-button>     
                  <el-button type="text" @click="runAgain(scope)" width="30">补数</el-button>
                  <!-- <el-button type="text" disabled width="30">全量</el-button> -->
                  <el-button type="text" @click="logSearch(scope)" width="30">日志</el-button>
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
        <div v-if="ShowInput_title=='API上报'">
          <el-form-item prop="protocol" label="协议" >
            <el-select v-model="inNode.protocol" class="baseinfo">
              <el-option label="http" value="http"></el-option>
              <!-- <el-option label="https" value="https"></el-option> -->
            </el-select>
          </el-form-item>
          <el-form-item prop="authFlag" label="是否认证" >
            <el-select v-model="inNode.authFlag" class="baseinfo">
              <el-option label="是" value="y"></el-option>
              <el-option label="否" value="n"></el-option>
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="增量标识字段" v-if="ShowInput_title=='数据库查询'">
          <el-input v-model="inNode.IncrementalField" placeholder="请输入" class="baseinfo"></el-input>
        </el-form-item>
        <el-form-item prop="path" label="访问路径" v-if="ShowInput_title=='API查询'||ShowInput_title=='API上报'">
          <el-input v-model="inNode.path" placeholder="请输入" class="baseinfo" :title="inNode.path"></el-input>
        </el-form-item>
        <el-form-item required label="脚本">
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
    <!--补数界面-->
    <el-dialog class="dialog-skip" width="1120px" title="补数" :visible.sync="rerun_falg" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="reRunForm" :model="reRun" label-width="100px" size="mini" inline-message label-position="top">
        </el-form-item>
          <el-form-item prop="runTime" label="运行时间">
            <el-date-picker
              v-model="reRun.runTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right">
            </el-date-picker>
        </el-form-item>
        <el-form-item label="运行参数" prop="runParams">
          <el-input type="textarea" :rows="3" v-model="reRun.runParams" placeholder="请输入" class="baseinfo" maxlength="2000"></el-input>
        </el-form-item>
      </el-form>
      <br>
      <div>
        <el-button size="mini" type="primary" v-prevent-repeat-click @click="runTask">确 定</el-button>
        <el-button size="mini" @click="rerun_falg = false">取 消</el-button>
      </div>
      <br>
      <el-switch
        v-model="logFlag"
        active-text="开启"
        inactive-text="关闭">
      </el-switch>
      <div v-if="this.logFlag" style="height:300px;background:black">
        <ul style="list-style-type:none;overflow:auto;height:300px;color:white;padding:0;">
          <li v-for="lg in logList">{{ lg.message }}</li>
        </ul>
      </div>

    </el-dialog>

    <!--批量设置界面-->
    <el-dialog class="dialog-skip" width="60%" title="批量设置" :visible.sync="batch_falg" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-table
        :data="batchTableData"
        max-height="380"
        class="mt10"
        :cell-style="{padding:'10px 0px'}"
        :header-cell-style="{background:'#fafafa',color:'#606266'}"
        highlight-current-row
        fit 
        style="width: 100%"
      >
        <el-table-column prop="sourceType" align="center" label="数据源类型">
          <template slot-scope="scope">
            <span>{{ scope.row.sourceTypeName }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="节点">
          <template slot-scope="scope">
            <span>{{ scope.row.nodeTypeName }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="数据源">
          <template slot-scope="scope">
            <el-select v-model="scope.row.dataSource" placeholder="请选择" > 
              <el-option v-for="(optItem,optindex) in bcpDatasourceName" :key="optindex" :label="optItem" :value="optindex" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="batchSetConfirm">确 定</el-button>
        <el-button size="mini" @click="batch_falg = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 导入 -->
    <el-dialog class="dialog-skip" width="400px" title="导入" :visible.sync="import_flag" :close-on-click-modal="false" :close-on-press-escape="false">
        <div class="align:center">
           <el-upload
            ref="impUpload"
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="importFile"
            drag
            >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传文本文件，且不超过5MB</div>
          </el-upload>
        </div>
    </el-dialog>

    <!--日志查询界面-->
    <el-dialog class="dialog-skip" width="1120px" title="日志" :visible.sync="log_flag" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="logForm" :model="log" label-width="100px" size="mini" inline-message label-position="top">
         <el-form-item>
            <el-date-picker
              v-model="log.runTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right">
            </el-date-picker>
          <el-input v-model="log.message" placeholder="请输入要搜索的日志内容" class="baseinfo" maxlength="50"></el-input>
          <el-button size="mini" @click="getTaskLog">搜索</el-button>
        </el-form-item>
      </el-form>
      <br>
      <div>
        <el-table :data="logList" :height="650+'px'"  class="mt10" :cell-style="{padding:'5px 0px'}" :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit highlight-current-row style="width: 100%">
          <el-table-column prop="sourceType" align="center" label="时间" width="200">
            <template slot-scope="scope">
              <span>{{ scope.row.timestamp }}</span>
            </template>
          </el-table-column>
          <el-table-column align="left" label="内容">
            <template slot-scope="scope">
              <span>{{ scope.row.message }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="this.log.totalCount>0" class="mod-pagination mt10">
            <el-pagination
              background
              prev-text="上一页"
              next-text="下一页"
              :current-page.sync="log.currentPage"
              :page-sizes="[20,50,100]"
              :page-size="log.pageSize"
              layout="slot,total, sizes, prev, pager, next, jumper"
              :total="log.totalCount"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange">
            </el-pagination>
          </div>
        </div>
    </el-dialog>
  </div>
</template>

<script>
import * as sel from "@/api/select";
import * as api from "@/api/IntegratedConfig";
import * as menuApi from '@/api/menu'
import { Loading } from 'element-ui'

//引入组件
import multipleTable from "./moudel/multipleTable";
import MonAco from "./moudel/monaco";
import { deepEqual } from 'assert';
import { connect } from 'tls';
import { mapGetters } from 'vuex'
import path from 'path';
import { group } from 'console';

export default {
  //组件注册
  components: {
    multipleTable,
    MonAco
  },
  data() {
    return {
      fileList: [],
      fileMap: {},
      logLoading: null,
      queryLogTask: null,
      logFlag: false,
      showEditor: 0,
      currentRow: 0,
      bcpDatasourceName:[],
      bcpTenantName:[],
      pathMap: new Map(),
      exampleData:[], //示例数据
      batchTableData:[],//批量设置的数据
      value: "",
      ShowInput_title: "",
      switchNode_title: "",
      Showoutput_title: "",
      curTenantId:null,
      transformNodedata: {
        scriptContent:'',
        index:0,
      },
      menuURL: this.$route.path, //菜单链接
      rerun_falg: false, //补数页面
      batch_falg: false, //批量设置
      import_flag: false, //导入标识
      log_flag: false, //日志标识
      ShowInput_Reported: false, //“任务列表的输入节点=>API上报”模态窗的显示隐藏
      ShowInput_Database: false, //“                =>数据库查询”模态窗的显示隐藏
      ShowInput_Inquire: false, //“                 =>API查询”模态窗的显示隐藏
      switchNode: false, //“转换节点=>脚本转换”模态窗的显示隐藏
      Showoutput_Transfer: false, //“输出节点=>API调用”模态窗的显示隐藏
      Showoutput_Writeback: false, //“      =>数据库回写”模态窗的显示隐藏
      Showoutput_Script: false, //“         =>自定义脚本”模态窗的显示隐藏
      ShowMoule: false, //模态窗的显示隐藏
      Reported: false, //模态窗的显示隐藏
      reRun: {
        taskId: "", //任务id
        runTime: "", //允许时间段
        runParams: "" //允许参数
      },
      log: {
        taskId: "", //任务id
        runTime: [], //允许时间段
        message: "", //日志内容
        pageSize: 20, //每页条数
        currentPage: 0, //当前页数
        totalCount: 0, //总条数
        repairFlag: false, //是否补数
      },
      logList: [],
      inNode: {
        cron: null, //定时设置
        IncrementalField: null, //增量标识字段
        dataSource: null, //增量标识字段
        protocol: 'http', //协议
        authFlag: 'Y' //是否认证
      },
      outNode: {
        cron: null, //定时设置
        IncrementalField: null, 
        dataSource: null, 
        scriptContent: null
      },
      transformNode: {
        IncrementalField: null, //增量标识字段
        dataSource: null, 
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
    //初始化下拉框
    this.initOptions()
    this.initData(false)
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
  //初始化日期默认值，默认当天
    initData(curFlag){
      this.log.runTime = []
      let curDate = new Date()
      let pattern = 'yyyy-MM-dd 00:00:00'
      if(curFlag){
        pattern = 'yyyy-MM-dd hh:mm:ss'
        this.log.pageSize = 500
      }
      let startDate = curDate.format(pattern)
      let endDate = curDate.format('yyyy-MM-dd 23:59:59')
      this.log.runTime.push(startDate)
      this.log.runTime.push(endDate)
    },
    //导出
    derive(row){
      api.exportExcel(row.id).then(res=>{
          let blob = new Blob([res], { type: `${res.type}` })
          let link = document.createElement("a")
          link.href = window.URL.createObjectURL(blob)
          link.download = row.name+".json"
          link.click()
          link.remove()
      })
    },
    expForIot(row){
      api.expForIot(row.id).then(res=>{
          let blob = new Blob([res], { type: `${res.type}` })
          let link = document.createElement("a")
          link.href = window.URL.createObjectURL(blob)
          link.download = row.name+".json"
          link.click()
          link.remove()
      })
    },
    runAgain(data){
      this.reRun = {}
      this.reRun.taskId = data.row.id
      this.reRun.configId = this.subFormData.id
      this.logList = []
      this.log.taskId = data.row.id
      this.rerun_falg = true
    },
    logSearch(data){
      this.log.totalCount = 0
      this.log.pageSize = 20
      this.initData(false)
      this.logList = []
      this.log.message = ""
      this.log.taskId = data.row.id
      this.log_flag = true
      this.log.repairFlag = false
    },
    getTaskLog() {
      api.getTaskLog(this.log).then((res) => {
        this.logList = res.model
        this.log.totalCount = res.totalCount
      })
    },
    logload(){
      this.log.repairFlag = true
      api.getTaskLog(this.log).then((res) => {
        this.logList = res.model
        this.log.totalCount = res.totalCount
        // this.logLoading = false
        this.logLoading.close()
      })
    },
    handleSizeChange(val) {
      // 切换每页显示数量
      this.log.pageSize = val
      this.getTaskLog()
    },
    handleCurrentChange(val) {
      // 切换页码
      this.log.currentPage = val
      this.getTaskLog()
    },
    runTask(){
      this.initData(true)
      this.logList = []
      this.logLoading  = Loading.service({ fullscreen: true,text: '任务执行中，请等待...',background:'rgba(0, 0, 0, 0.7)',spinner: 'el-icon-loading' })
      api.runTask(this.reRun).then(res=>{
        //采集日志
        if(this.logFlag){
          this.logLoading.text = '日志加载中，请等待...'
          setTimeout(() => {
            this.logload()
          }, 10000)
        }else{
          this.logLoading.text = '任务执行完毕'
          this.logLoading.close()
        }
       
      })
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
          //如果是api上报类型，则需要判断访问路径是否唯一
          if("apiUp"===this.jobList[this.currentRow].inNode.type){
             let nodeId = this.pathMap.get(this.inNode.path)
             if( nodeId!=undefined && nodeId!=this.jobList[this.currentRow].inNode.id){
                this.$message.error({
                  message: this.inNode.path+'已存在，请重新输入访问路径'
                })
               return
             }else{
               nodeId = nodeId===undefined ? -99 : nodeId
               this.pathMap.set(this.inNode.path,nodeId)
             }
             
          }
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
      //设置默认值
      //api上报设置默认值
      if('apiUp' === data.row.inNode.type){
        this.inNode.protocol=!!this.inNode.protocol?this.inNode.protocol:this.$set(this.inNode, "protocol", 'http')
        this.inNode.authFlag=!!this.inNode.authFlag?this.inNode.authFlag:this.$set(this.inNode, "authFlag", 'y')
      }
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
      this.tableData.splice(index.$index, 1)
    },
    //任务列表的删除
    deljobList(data) {
      this.$confirm('是否删除?删除之后点击保存才会生效', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
       .then(() => {
          this.jobList.splice(data.$index, 1)
        })
        .catch(() => {
        })
      
    },
    copyJob(data){
      let copyRow = JSON.parse( JSON.stringify(data.row) )
      copyRow.jobName = copyRow.jobName+"_COPY"
      copyRow.id = ""
      copyRow.inNode.id=""
      copyRow.outNode.id=""
      copyRow.transformNode.id=""
      this.jobList.push( copyRow )
    },
    enableAll(flag){
      this.jobList.forEach(a=>{
        a.enable = flag
      })
    },
    //参数的添加
    addParam() {
      this.tableData.push({ 'key':'', 'value':'' })
    },
    batchSetParams(){
      this.batch_falg = true
      if(!this.jobList){
        return
      }
      this.batchTableData = []
      let inSet = new Set()
      let outSet = new Set()
      this.jobList.forEach(a=>{
        inSet.add(a.inNode.type)
        outSet.add(a.outNode.type)
      })
      inSet.forEach(inObj=>{
        let obj = {
                    "sourceType":inObj, //数据源类型
                    "sourceTypeName":this.optionsInput.find(val=>val.propkey===inObj).propvalue,
                    "nodeType":"in",   //节点
                    "nodeTypeName":"输入节点",
                    "dataSource":""     //数据源
        }
        this.batchTableData.push(obj)
      })
      outSet.forEach(outObj=>{
        let obj = {
                    "sourceType":outObj, //数据源类型
                    "sourceTypeName":this.optionsOutput.find(val=>val.propkey===outObj).propvalue,
                    "nodeType":"out",   //节点
                    "nodeTypeName":"输出节点",
                    "dataSource":""     //数据源
        }
        this.batchTableData.push(obj)
      })
    },
    batchSetConfirm(){
      this.jobList.forEach(a=>{
         let inDs = this.batchTableData.find(val=>val.nodeType===a.inNode.classify && val.sourceType===a.inNode.type).dataSource
         let outDs = this.batchTableData.find(val=>val.nodeType===a.outNode.classify && val.sourceType===a.outNode.type).dataSource
         let inConfigValue = JSON.parse(a.inNode.configValue)
         let outConfigValue = JSON.parse(a.outNode.configValue)
         inConfigValue.dataSource = inDs
         outConfigValue.dataSource = outDs
         a.inNode.configValue = JSON.stringify( inConfigValue )
         a.outNode.configValue = JSON.stringify( outConfigValue )
      })
      this.batch_falg = false
      this.$message({
          showClose: true,
          message: '批量设置成功，请点击保存完成数据更新',
          type: 'success'
      })
    },
    importFile(event){
      let that = this
      this.import_flag = false
      let loading = Loading.service({ fullscreen: true,text: '导入中',background:'rgba(0, 0, 0, 0.7)',spinner: 'el-icon-loading' })
      let reader = new FileReader()
      reader.readAsText(event.raw,"utf-8")//发起异步请求
      reader.onload = function(){
        var res = JSON.parse(reader.result)
        that.jobList = res.jobList
        that.tableData = res.configValue!=null?JSON.parse(res.configValue):[]
        setTimeout(() => {
          that.$refs.impUpload.clearFiles()
          loading.close()
        }, 1000)
      }
    },
    //任务列表的添加
    addJob() {
      this.jobList.push({ valueName: "", 
      enable:"true",
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
        this.pathMap.clear()
        this.jobList.forEach(job=>{
          if("apiUp"===job.inNode.type){
              let conf = JSON.parse(job.inNode.configValue)
              this.pathMap.set(conf.path,job.inNode.id)
          }
        })

        this.fileMap = {}
        this.fileList = []
        if(res.pluginsList){
          res.pluginsList.forEach(ps=>{
            let pluginFile = {
              name:ps.name
            }
            this.fileList.push(pluginFile)
            this.fileMap[ps.name] = ps.fileUrl
          })
        }
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
    exceedFile(files, fileList) {
      this.$notify.warning({
        title: '警告',
        message: `只能选择5个文件，当前共选择了 ${files.length + fileList.length} 个`
      });
    },
    handlePreview(file){
      location.href = `${process.env.VUE_APP_BASE_API}/services/fwcore/config/down-plugins/${this.subFormData.id}/${file.name}`
    },
    beforeUpload(file) {
      if (file.size / (1024 * 1024) > 5) {
          this.$notify.warning({
            title: '警告',
            message: `文件大小不得超过2M`
          });
      }else{
        const formData = new FormData()
        formData.append("file", file)
        api.upload(formData,this.subFormData.id).then((res) => {
          this.fileMap[file.name] = res.model
        })
      }
    },
    handleUpload(file, fileList) {
    },
    //新增&编辑的确认方法
    subForm(formData) {
      let obj = {
        ...this.subFormData,
        jobList:this.jobList
      }
      obj.configValue = this.tableData
      //如果上传了插件则把插件保存到数据库
      if( this.$refs.pluginsUpload && this.$refs.pluginsUpload.uploadFiles.length>0 ){
         obj.pluginsList = []
        this.$refs.pluginsUpload.uploadFiles.forEach(a=>{
          let file = {
            name:a.name,
            configId:this.subFormData.id,
            //fileUrl:`%s#${this.subFormData.id}/${a.name}`
            fileUrl:this.fileMap[a.name]
          }
          obj.pluginsList.push(file)
        })
      }
      
      
      this.$refs[formData].validate((valid) => {
        if (valid) {
          api
            .submitForm(obj)
            .then((res) => {
              this.$message.success("保存成功")
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
      this.fileMap = {}
      this.fileList = []
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
      //把访问路径加到集合中,用来判断是否存在重复的访问路径
      this.jobList = data.jobList
      this.pathMap.clear()
      this.jobList.forEach(job=>{
         if("apiUp"===job.inNode.type){
            let conf = JSON.parse(job.inNode.configValue)
            this.pathMap.set(conf.path,job.inNode.id)
         }
      })
      if(data.pluginsList){
        data.pluginsList.forEach(ps=>{
          let pluginFile = {
            name:ps.name
          }
          this.fileList.push(pluginFile)
          this.fileMap[ps.name] = ps.fileUrl
        })
      }
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