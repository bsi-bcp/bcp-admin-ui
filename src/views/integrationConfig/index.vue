<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="edit(0)">新增</el-button>
      </template>
      <template slot="oper" slot-scope="scope">
        <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>
        <el-dropdown v-if="menuURL.indexOf('IMC')<0" trigger="click" size="mini" @command="handleExportCommand($event, scope.value)">
          <el-button size="mini" type="text">更多<i class="el-icon-arrow-down el-icon--right" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="export">导出</el-dropdown-item>
            <el-dropdown-item command="it">导出it</el-dropdown-item>
            <el-dropdown-item command="ot">导出ot</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </mod-filter>
    <!--新增/编辑界面  -->
    <el-dialog class="pub_dialog" :close-on-click-modal="false" :close-on-press-escape="false" width="1120px"
               :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible"
    >
      <el-form ref="configForm" label-position="top" inline-message size="mini" :model="subFormData"
               :rules="subFormDataRule" class="subFormData " label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="集成名称" prop="name">
              <el-input v-model="subFormData.name" placeholder="集成名称" maxlength="200" size="mini"
                        auto-complete="off"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="cur_user.userType=='admin'" :span="12">
            <el-form-item label="客户" prop="tenantId">
              <el-select v-model="subFormData.tenantId" placeholder="请选择" size="mini" style="width:100%">
                <el-option v-for="(optItem,optindex) in bcpTenantName" :key="optindex" :label="optItem" :value="optindex" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板选择" prop="templateId">
              <el-input v-model="subFormData.templateName" disabled placeholder="模板选择" maxlength="20" size="mini" />
              <el-button style="margin-left:5px" size="mini" :disabled="!!subFormData.id" @click="ShowMoule=true">选择模板</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="集成节点" prop="nodeId">
              <el-input v-model="subFormData.nodeId" placeholder="集成节点" maxlength="20" size="mini"
                        auto-complete="off"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!--参数-->
        <el-form-item label="参数" prop="parameter" style="margin-top:20px;">
          <el-table ref="paramTable" :data="tableData" class="mt10" :cell-style="{padding:'10px 0px'}"
                    :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit
                    highlight-current-row style="width: 100%" row-key="__sortId"
          >
            <!-- align="center"使内容居中 -->
            <el-table-column label="参数名称" align="center" width="350">
              <template slot-scope="scope">
                <el-input v-model="scope.row.key" style="width: calc(100% - 30px)" />
                <el-tooltip content="复制获取参数代码" placement="top">
                  <i class="el-icon-document-copy"
                     style="cursor:pointer;margin-left:5px;color:#409EFF"
                     @click="copyParamCode(scope.row.key)"
                  />
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column label="参数值" align="center">
              <template slot-scope="scope">
                <el-tooltip placement="right-start">
                  <!-- :content="" -->
                  <div slot="content">
                    <pre
                      style="max-width: 300px;white-space: pre-wrap;word-wrap: break-word;"
                    ><code>{{
                      formatContent(scope.row.value)
                    }}</code></pre>
                  </div>
                  <el-input v-model="scope.row.value" />
                </el-tooltip>

              </template>
            </el-table-column>

            <el-table-column label="操作" align="center" width="200">
              <template slot-scope="scope">
                <el-popconfirm title="确定删除该参数？" @confirm="delTableData(scope)">
                  <el-button slot="reference" type="text">删除</el-button>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <!--参数的添加按钮-->
          <el-button type="text" style="margin-top:5px" @click="addParam">添加</el-button>
          <!-- <div @click="addParam">添加</div> -->

        </el-form-item>
        <!--新增界面的插件文件（暂不需）-->
        <el-form-item
          label="插件文件"
        >
          <!--on-exceed文件超出个数；:limit最大允许上传个数；http-request实现自定义上传；	action必选参数，上传的地址；before-upload 限制用户上传的图片格式和大小-->
          <el-upload
            ref="pluginsUpload"
            :disabled="!subFormData.id"
            :on-preview="handlePreview"
            :on-exceed="exceedFile"
            :file-list="fileList"
            :limit="5"
            :http-request="handleUpload"
            action="undefined"
            :before-upload="beforeUpload"
          >
            <el-button v-if="subFormData.id" size="small" type="text">上传插件<i class="el-icon-upload el-icon--right" />
            </el-button>
          </el-upload>
        </el-form-item>
        <!--新增界面的任务列表-->

        <el-form-item
          label="任务列表" style="margin-top:20px;"
        >
          <!-- 任务列表的滚动条 -->
          <div style="float:right;margin-bottom:10px;">
            <span class="task-stats">
              总数: {{ jobList.length }} |
              启用: {{ jobList.filter(j => j.enable === 'true').length }} |
              禁用: {{ jobList.filter(j => j.enable === 'false').length }}
            </span>
            <el-button size="mini" type="primary" @click="import_flag=true">导入</el-button>
            <el-button size="mini" type="primary" @click="batchSetParams">批量设置</el-button>
            <el-button size="mini" type="primary" @click="enableAll('true')">一键启用</el-button>
            <el-button size="mini" type="primary" @click="enableAll('false')">一键禁用</el-button>
          </div>
          <el-table ref="jobTable" :data="jobList" class="mt10" :cell-style="{padding:'5px 0px'}"
                    :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit
                    highlight-current-row style="width: 100%" row-key="__sortId"
                    :row-class-name="jobRowClassName"
          >
            <!--任务列表的行号-->
            <el-table-column type="index" label="#" width="50" align="center" />
            <!--任务列表的名称-->
            <el-table-column prop="jobName" label="名称" align="center" width="280">
              <template slot-scope="scope">
                <el-popover :ref="`popover-${scope.$index}`" placement="left-start" trigger="hover"
                            :content="scope.row['jobName']"
                />
                <el-input v-model="scope.row['jobName']" v-popover="`popover-${scope.$index}`" />
              </template>
            </el-table-column>
            <!--任务列表的输入节点-->
            <el-table-column prop="inNode" label="输入节点" align="center" width="190">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span="16">
                    <el-select v-model="scope.row['inNode']['type']" placeholder="请选择">
                      <el-option v-for="(optItem,optindex) in optionsInput" :key="optindex" :label="optItem.propvalue"
                                 :value="optItem.propkey"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="8">
                    <el-button type="text" :disabled="scope.row['inNode']['type']==''"
                               @click="changeOptionsInput(scope)"
                    >
                      配置
                    </el-button>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的转换节点-->
            <el-table-column prop="transformNode" label="转换节点" align="center" width="100">
              <template slot-scope="scope">
                <el-row>
                  <el-col>
                    <el-button type="text" :disabled="scope.row['transformNode']['type']==''"
                               @click="changeOptionsTransform(scope)"
                    >配置
                    </el-button>
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
                      <el-option v-for="(optItem,optindex) in optionsOutput" :key="optindex" :label="optItem.propvalue"
                                 :value="optItem.propkey"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="8">
                    <!-- 不选择则不能点击=>:disabled="jobList[scope.$index].outputType==undefined" -->
                    <el-button type="text" :disabled="scope.row['outNode']['type']==''"
                               @click="changeOptionsOutput(scope)"
                    >配置
                    </el-button>
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
                      <el-option label="启用" value="true" />
                      <el-option label="禁用" value="false" />
                    </el-select>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <!--任务列表的操作-->
            <el-table-column prop="oper" label="操作" align="center" width="210">
              <template slot-scope="scope">
                <div style="text-align:left;">
                  <el-popconfirm
                    confirm-button-text="复制一行"
                    cancel-button-text="复制到内存"
                    icon="el-icon-info"
                    icon-color="red"
                    title="请选择复制方式"
                    @confirm="copyJob(scope)"
                    @cancel="copyJobJson(scope)"
                  >
                    <el-button slot="reference" style="margin-right:10px;" type="text" width="30">复制</el-button>
                  </el-popconfirm>
                  <el-button type="text" width="30" @click="deljobList(scope)">删除</el-button>
                  <el-button type="text" width="30" @click="runAgain(scope)">补数</el-button>
                  <!-- <el-button type="text" disabled width="30">全量</el-button> -->
                  <el-button type="text" width="30" @click="logSearch(scope)">日志</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <!--任务列表的按钮-->
          <el-row>
            <el-popconfirm
              confirm-button-text="添加空行"
              cancel-button-text="通过Json添加"
              icon="el-icon-info"
              icon-color="red"
              title="请选择添加方式"
              @confirm="addJob()"
              @cancel="addByJson()"
            >
              <el-button slot="reference" type="text" style="margin-top:5px">添加</el-button>
            </el-popconfirm>
          </el-row>

        </el-form-item>
      </el-form>
      <!--新增界面的确定取消-->
      <div slot="footer" class="dialog-footer">
        <el-button v-prevent-repeat-click size="mini" type="primary" @click="subForm('configForm')">保存</el-button>
        <el-button v-prevent-repeat-click size="mini" :disabled="subFormData.id==undefined" type="primary"
                   @click="issue(subFormData.id)"
        >下发
        </el-button>
        <el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-----------------------------------------------跳转的界面--------------------------------------------------------->
    <!--模板选择按钮的跳转界面-->
    <!--:visible.sync="ShowMoule"的功能为控制当前模态窗的显示和隐藏-->
    <!-- :close-on-click-modal="false"和:close-on-press-escape="false"的功能为控制窗口不会被点击或是ESC按键关闭 -->
    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false" width="50%" title="选择模板"
               :visible.sync="ShowMoule"
    >
      <multipleTable @templateData="templateData" />
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="modelShow">确 定</el-button>
        <el-button size="mini" @click="ShowMoule = false">取 消</el-button>
      </div>
    </el-dialog>
    <!--任务列表的输入节点-->
    <el-dialog class="dialog-skip" width="60%" :title="ShowInput_title" :visible.sync="ShowInput_Database"
               :close-on-click-modal="false" :close-on-press-escape="false"
    >
      <el-form ref="inNodeForm" :model="inNode" label-width="100px" size="mini" :rules="inNodeFormRule" inline-message
               label-position="top"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item v-if="ShowInput_title!='API上报'" prop="cron" label="定时设置">
              <el-input v-model="inNode.cron" placeholder="请输入cron表达式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="ShowInput_title!='自定义脚本'" prop="dataSource" label="数据源">
              <el-select v-model="inNode.dataSource" placeholder="请选择" style="width:calc(100% - 85px)">
                <el-option v-for="(optItem,optindex) in bcpDatasourceName" :key="optindex" :label="optItem"
                           :value="optindex + ''"
                />
              </el-select>
              <el-button type="text" size="mini" @click="goToDatasource">管理数据源</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <div v-if="ShowInput_title=='API上报'">
          <el-form-item prop="protocol" label="协议">
            <el-select v-model="inNode.protocol" class="baseinfo">
              <el-option label="http" value="http" />
              <!-- <el-option label="https" value="https"></el-option> -->
            </el-select>
          </el-form-item>
          <el-form-item prop="authFlag" label="是否认证">
            <el-select v-model="inNode.authFlag" class="baseinfo">
              <el-option label="是" value="y" />
              <el-option label="否" value="n" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item v-if="ShowInput_title=='数据库查询'" label="增量标识字段">
          <el-input v-model="inNode.IncrementalField" placeholder="请输入" class="baseinfo" />
        </el-form-item>
        <el-form-item v-if="ShowInput_title=='API查询'||ShowInput_title=='API上报'" prop="path" label="访问路径">
          <el-input v-model="inNode.path" placeholder="请输入" class="baseinfo" :title="inNode.path" />
        </el-form-item>
        <el-form-item required label="脚本">
          <MonAco ref="MonAco" :fields="currentFields" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dg-footer">
        <span>{{ foot_job_name }}</span>
        <div>
          <el-button size="mini" type="primary" @click="affirmInNode">确 定</el-button>
          <el-button size="mini" @click="ShowInput_Database = false">取 消</el-button>
        </div>
      </div>
    </el-dialog>
    <!--任务列表的转换节点-->
    <el-dialog class="dialog-skip" width="60%" :title="switchNode_title" :visible.sync="switchNode"
               :close-on-click-modal="false" :close-on-press-escape="false"
    >
      <el-form ref="transformNodeForm" label-width="100px" size="mini" inline-message label-position="top">
        <el-form-item label="脚本" required>
          <MonAco ref="MonAcoTransformNode" :fields="currentFields" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dg-footer">
        <span>{{ foot_job_name }}</span>
        <div>
          <el-button size="mini" type="primary" @click="affirmTransformNode">确 定</el-button>
          <el-button size="mini" @click="switchNode = false">取 消</el-button>
        </div>
      </div>
    </el-dialog>
    <!--任务列表的输出节点-->
    <el-dialog class="dialog-skip" width="60%" :title="Showoutput_title" :visible.sync="Showoutput_Transfer"
               :close-on-click-modal="false" :close-on-press-escape="false"
    >
      <el-form ref="outNodeForm" :rules="outNodeFormRule" :model="outNode" label-width="100px" size="mini"
               inline-message label-position="top"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item v-if="Showoutput_title!='自定义脚本'" prop="dataSource" label="数据源">
              <el-select v-model="outNode.dataSource" placeholder="请选择" style="width:calc(100% - 85px)">
                <el-option v-for="(optItem,optindex) in bcpDatasourceName" :key="optindex" :label="optItem"
                           :value="optindex + ''"
                />
              </el-select>
              <el-button type="text" size="mini" @click="goToDatasource">管理数据源</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="Showoutput_title=='API调用'" label="访问路径" prop="path">
              <el-input v-model="outNode.path" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="脚本" required>
          <MonAco ref="outMonAco" :fields="currentFields" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dg-footer">
        <span>{{ foot_job_name }}</span>
        <div>
          <el-button size="mini" type="primary" @click="affirmOutNode">确 定</el-button>
          <el-button size="mini" @click="Showoutput_Transfer = false">取 消</el-button>
        </div>
      </div>
    </el-dialog>
    <!--Cron 可视化设置-->
    <el-dialog title="Cron 表达式设置" :visible.sync="cronDialogVisible" width="640px"
               :close-on-click-modal="false" append-to-body
    >
      <cron v-model="cronExpression" />
      <div slot="footer">
        <el-button size="mini" @click="cronDialogVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="cronConfirm">确 定</el-button>
      </div>
    </el-dialog>
    <!--补数界面-->
    <el-dialog class="dialog-skip" width="1120px" :title="foot_job_name" :visible.sync="rerun_falg" :close-on-click-modal="false"
               :close-on-press-escape="false" @close="clearLogPoll"
    >
      <el-form ref="reRunForm" :model="reRun" label-width="100px" size="mini" inline-message label-position="top">
        <el-form-item prop="runTime" label="运行时间">
          <el-date-picker
            v-model="reRun.runTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          />
        </el-form-item>
        <el-form-item label="运行参数" prop="runParams">
          <el-input v-model="reRun.runParams" type="textarea" :rows="3" placeholder="请输入" class="baseinfo"
                    maxlength="2000"
          />
        </el-form-item>

        <!--        <el-form-item label="运行结果">-->
        <!--          <el-input type="textarea" :rows="3" v-model="reRun.responseMsg" placeholder="请输入" class="baseinfo"-->
        <!--                    maxlength="2000"></el-input>-->
        <!--        </el-form-item>-->
      </el-form>

      <br>
      <div>
        <el-button v-prevent-repeat-click size="mini" type="primary" @click="runTask">确 定</el-button>
        <el-button size="mini" @click="rerun_falg = false">取 消</el-button>
      </div>
      <br>
      <div v-if="logList.length > 0" style="margin-top:10px;">
        <el-divider content-position="left">补数日志</el-divider>
        <el-table :data="logList" max-height="250" size="mini"
                  :cell-style="{padding:'2px 0'}" style="width:100%"
        >
          <el-table-column prop="timestamp" label="时间" width="180" />
          <el-table-column prop="message" label="内容" show-overflow-tooltip />
        </el-table>
      </div>
    </el-dialog>

    <!--批量设置界面-->
    <el-dialog class="dialog-skip" width="60%" title="批量设置" :visible.sync="batch_falg" :close-on-click-modal="false"
               :close-on-press-escape="false"
    >
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
            <el-select v-model="scope.row.dataSource" placeholder="请选择">
              <el-option v-for="(optItem,optindex) in bcpDatasourceName" :key="optindex" :label="optItem"
                         :value="optindex + ''"
              />
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
    <el-dialog class="dialog-skip" width="400px" title="导入" :visible.sync="import_flag" :close-on-click-modal="false"
               :close-on-press-escape="false"
    >
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
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">只能上传文本文件，且不超过5MB</div>
        </el-upload>
      </div>
    </el-dialog>

    <!-- 从json字符串新增数据 -->
    <el-dialog class="dialog-skip" width="650px" title="" :visible.sync="new_flag" :close-on-click-modal="false"
               :close-on-press-escape="false"
    >
      <el-form ref="newTaskForm" :model="jsonTask" label-width="100px" size="mini" inline-message label-position="top">
        <el-form-item label="JSON串">
          <el-input v-model="jsonTask.newJson" type="textarea" :rows="5" placeholder="请输入"
                    style="width:550px"
          />
        </el-form-item>
      </el-form>
      <br>
      <div>
        <el-button v-prevent-repeat-click size="mini" type="primary" @click="addJobJson">确 定</el-button>
        <el-button size="mini" @click="new_flag = false">取 消</el-button>
      </div>
    </el-dialog>

    <!--日志查询界面-->
    <el-dialog class="dialog-skip" width="1120px" title="日志" :visible.sync="log_flag" :close-on-click-modal="false"
               :close-on-press-escape="false"
    >
      <el-form ref="logForm" :model="log" label-width="100px" size="mini" inline-message label-position="top">
        <el-form-item>
          <el-date-picker
            v-model="log.runTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          />
          <el-input v-model="log.message" placeholder="请输入要搜索的日志内容" class="baseinfo" maxlength="50" />
          <el-button size="mini" @click="getTaskLog">搜索</el-button>
        </el-form-item>
      </el-form>
      <br>
      <div>
        <el-table :data="logList" :height="650+'px'" class="mt10" :cell-style="{padding:'5px 0px'}"
                  :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit
                  highlight-current-row style="width: 100%"
        >
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
        <div v-if="log.totalCount>0" class="mod-pagination mt10">
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
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as sel from '@/api/select'
import * as api from '@/api/IntegratedConfig'
import { formatDate } from '@/utils/date'
import * as menuApi from '@/api/menu'
import { Loading } from 'element-ui'
// 引入组件
import multipleTable from './moudel/multipleTable'
import MonAco from './moudel/monaco'
import Cron from '@/components/cron/cron'
import { mapGetters } from 'vuex'
import Sortable from 'sortablejs'

export default {
  // 组件注册
  components: {
    multipleTable,
    MonAco,
    Cron
  },
  data() {
    return {
      fileList: [],
      sortIdCounter: 0,
      cronDialogVisible: false,
      cronExpression: '',
      fileMap: {},
      logLoading: null,
      queryLogTask: null,
      logFlag: false,
      showEditor: 0,
      currentRow: 0,
      bcpDatasourceName: [],
      bcpTenantName: [],
      pathMap: new Map(),
      exampleData: [], // 示例数据
      currentFields: [], // 当前节点的数据源字段列表（Monaco 补全用）
      batchTableData: [], // 批量设置的数据
      value: '',
      ShowInput_title: '',
      foot_job_name: '',
      switchNode_title: '',
      Showoutput_title: '',
      curTenantId: null,
      transformNodedata: {
        scriptContent: '',
        index: 0
      },
      menuURL: this.$route.path, // 菜单链接
      rerun_falg: false, // 补数页面
      batch_falg: false, // 批量设置
      import_flag: false, // 导入标识
      new_flag: false, // 新增标识 json
      jsonTask: {
        newJson: '' // 新增的json串
      },
      log_flag: false, // 日志标识
      ShowInput_Reported: false, // “任务列表的输入节点=>API上报”模态窗的显示隐藏
      ShowInput_Database: false, // “                =>数据库查询”模态窗的显示隐藏
      ShowInput_Inquire: false, // “                 =>API查询”模态窗的显示隐藏
      switchNode: false, // “转换节点=>脚本转换”模态窗的显示隐藏
      Showoutput_Transfer: false, // “输出节点=>API调用”模态窗的显示隐藏
      Showoutput_Writeback: false, // “      =>数据库回写”模态窗的显示隐藏
      Showoutput_Script: false, // “         =>自定义脚本”模态窗的显示隐藏
      ShowMoule: false, // 模态窗的显示隐藏
      Reported: false, // 模态窗的显示隐藏
      reRun: {
        taskId: '', // 任务id
        runTime: '', // 允许时间段
        runParams: '', // 允许参数
        responseMsg: ''
      },
      log: {
        taskId: '', // 任务id
        runTime: [], // 允许时间段
        message: '', // 日志内容
        pageSize: 20, // 每页条数
        currentPage: 0, // 当前页数
        totalCount: 0, // 总条数
        repairFlag: false // 是否补数
      },
      logList: [],
      inNode: {
        cron: null, // 定时设置
        IncrementalField: null, // 增量标识字段
        dataSource: null, // 增量标识字段
        protocol: 'http', // 协议
        authFlag: 'Y' // 是否认证
      },
      outNode: {
        cron: null, // 定时设置
        IncrementalField: null,
        dataSource: null,
        scriptContent: null
      },
      transformNode: {
        IncrementalField: null, // 增量标识字段
        dataSource: null,
        scriptContent: null
      },
      jobList: [],
      tableData: [{}], // 使打开新增窗口时参数新增行数不为空
      dialogFormVisible: false,
      subFormData: {
        id: null,
        name: null,
        nodeId: null,
        templateId: null,
        tenantId: null,
        templateName: null
      },
      optionsInput: [],
      optionsTransform: [],
      optionsOutput: [],
      subFormDataRule: {
        name: [
          {
            required: true,
            message: '请填写名称',
            trigger: 'blur'
          }
        ],
        tenantId: [
          {
            required: true,
            message: '请选择客户'
          }
        ],
        templateId: [
          {
            required: true,
            message: '请选择模板'
          }
        ]
      },
      inNodeFormRule: {
        dataSource: [
          {
            required: true,
            message: '请选择数据源',
            trigger: 'change'
          }
        ],
        cron: [
          {
            required: true,
            message: '请填写定时配置',
            trigger: 'blur'
          }
        ],
        IncrementalField: [
          {
            required: true,
            message: '请填写自增字段',
            trigger: 'blur'
          }
        ],
        path: [
          {
            required: true,
            message: '请填写访问路径',
            trigger: 'blur'
          }
        ]
      },
      outNodeFormRule: {
        dataSource: [
          {
            required: true,
            message: '请选择数据源',
            trigger: 'change'
          }
        ],
        path: [
          {
            required: true,
            message: '请填写访问路径',
            trigger: 'blur'
          }
        ]
      },
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
            queryName: '关键词',
            prop: 'name',
            conditionshow: true,
            filedShow: true,
            sortable: true,
            label: '名称',
            placeholder: '关键词',
            optList: [],
            align: 'left'
          },
          {
            type: 'input',
            prop: 'tenantName',
            conditionshow: false,
            filedShow: true,
            label: '客户',
            placeholder: '客户',
            optList: []
          },
          {
            type: 'input',
            prop: 'templateName',
            conditionshow: false,
            filedShow: true,
            label: '模板',
            placeholder: '模板',
            optList: []
          },
          {
            type: 'input',
            prop: 'lastUpdateTime',
            conditionshow: false,
            filedShow: true,
            sortable: true,
            label: '修改时间',
            placeholder: '修改时间',
            optList: []
          },
          {
            type: 'input',
            prop: 'status',
            conditionshow: false,
            filedShow: true,
            sortable: true,
            label: '状态',
            placeholder: '状态',
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
            minWidth: 120,
            optList: []
          }
        ]
      },
      temData: {}
    }
  },
  computed: {
    ...mapGetters([
      'cur_user'
    ])
  },
  async created() {
    // 初始化下拉框
    this.initOptions()
    this.initData(false)
  },
  methods: {
    formatContent(content) {
      var stack = [] // 栈-用于括号匹配
      var tmpStr = '' // 新格式化JSON字符串
      var len = Object.keys(content).length // 原始JSON长度
      // 遍历每一个字符
      for (let i = 0; i < len; i++) {
        if (content[i] === '{' || content[i] === '[') {
          tmpStr += content[i] + '\n'
          stack.push(content[i])
          tmpStr += ' '.repeat(stack.length)
        } else if (content[i] === ']' || content[i] === '}') {
          stack.pop()
          tmpStr += '\n' + ' '.repeat(stack.length) + content[i]
        } else if (content[i] === ',') {
          tmpStr += content[i] + '\n' + ' '.repeat(stack.length)
        } else {
          tmpStr += content[i]
        }
      }
      return tmpStr
    },

    _assignSortIds(list) {
      if (!list) return
      list.forEach(item => {
        if (!item.__sortId) item.__sortId = ++this.sortIdCounter
      })
    },
    jobRowClassName({ row }) {
      return row.enable === 'false' ? 'job-disabled-row' : ''
    },
    handleExportCommand(command, row) {
      if (command === 'export') {
        this.derive(row)
      } else {
        this.expForIot(command, row)
      }
    },
    copyParamCode(key) {
      if (!key) {
        this.$message.warning('请先输入参数名称')
        return
      }
      const code = 'context.getParams().get("' + key + '")'
      navigator.clipboard.writeText(code).then(() => {
        this.$message({ message: '已复制: ' + code, type: 'success', duration: 2000 })
      })
    },
    showCronDialog() {
      this.cronExpression = this.inNode.cron || ''
      this.cronDialogVisible = true
    },
    cronConfirm() {
      this.inNode.cron = this.cronExpression
      this.cronDialogVisible = false
    },
    goToDatasource() {
      const routeData = this.$router.resolve({ path: '/config-center/datasource' })
      window.open(routeData.href, '_blank')
    },
    initParamSortable() {
      this.$nextTick(() => {
        if (!this.$refs.paramTable) return
        const el = this.$refs.paramTable.$el.querySelector('.el-table__body-wrapper tbody')
        if (this._paramSortable) this._paramSortable.destroy()
        this._paramSortable = Sortable.create(el, {
          animation: 150,
          onEnd: ({ oldIndex, newIndex, item }) => {
            const parent = item.parentNode
            const refNode = parent.children[oldIndex]
            parent.removeChild(item)
            if (oldIndex < newIndex) {
              parent.insertBefore(item, refNode)
            } else {
              parent.insertBefore(item, refNode.nextSibling)
            }
            const row = this.tableData.splice(oldIndex, 1)[0]
            this.tableData.splice(newIndex, 0, row)
          }
        })
      })
    },
    initJobSortable() {
      this.$nextTick(() => {
        if (!this.$refs.jobTable) return
        const el = this.$refs.jobTable.$el.querySelector('.el-table__body-wrapper tbody')
        if (this._jobSortable) this._jobSortable.destroy()
        this._jobSortable = Sortable.create(el, {
          animation: 150,
          onEnd: ({ oldIndex, newIndex, item }) => {
            const parent = item.parentNode
            const refNode = parent.children[oldIndex]
            parent.removeChild(item)
            if (oldIndex < newIndex) {
              parent.insertBefore(item, refNode)
            } else {
              parent.insertBefore(item, refNode.nextSibling)
            }
            const row = this.jobList.splice(oldIndex, 1)[0]
            this.jobList.splice(newIndex, 0, row)
          }
        })
      })
    },
    initOptions() {
      sel.getFreelist({ code: 'bcp.tenant.name' }).then((res) => {
        this.bcpTenantName = res.model
      })
      sel.getFreelist({ code: 'bcp.datasource.name', params: this.cur_user.tenantId }).then((res) => {
        this.bcpDatasourceName = res.model
      })
      sel.getFreelist({ code: 'bcp.example.data' }).then((res) => {
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
    // 初始化日期默认值，默认当天
    initData(curFlag) {
      this.log.runTime = []
      const curDate = new Date()
      let pattern = 'yyyy-MM-dd 00:00:00'
      if (curFlag) {
        pattern = 'yyyy-MM-dd hh:mm:ss'
        this.log.pageSize = 500
      }
      const startDate = formatDate(curDate, pattern)
      const endDate = formatDate(curDate, 'yyyy-MM-dd 23:59:59')
      this.log.runTime.push(startDate)
      this.log.runTime.push(endDate)
    },
    // 导出
    derive(row) {
      api.exportExcel(row.id).then(res => {
        const blob = new Blob([res], { type: `${res.type}` })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = row.name + '.json'
        link.click()
        link.remove()
      })
    },
    expForIot(type, row) {
      api.expForIot({ 'type': type, 'id': row.id }).then(res => {
        const blob = new Blob([res], { type: `${res.type}` })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = row.name + '.json'
        link.click()
        link.remove()
      })
    },
    runAgain(data) {
      this.reRun = {}
      this.reRun.taskId = data.row.id
      this.reRun.configId = this.subFormData.id
      this.logList = []
      this.log.taskId = data.row.id
      this.foot_job_name = data.row.jobName
      this.rerun_falg = true
    },
    logSearch(data) {
      alert('建设中...')
      /* this.log.totalCount = 0
      this.log.pageSize = 20
      this.initData(false)
      this.logList = []
      this.log.message = ''
      this.log.taskId = data.row.id
      this.log_flag = true
      this.log.repairFlag = false*/
    },
    getTaskLog() {
      api.getTaskLog(this.log).then((res) => {
        this.logList = res.model
        this.log.totalCount = res.totalCount
      })
    },
    logload() {
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
    runTask() {
      this.initData(true)
      this.logList = []
      this.logLoading = Loading.service({
        fullscreen: true,
        text: '任务执行中，请等待...',
        background: 'rgba(0, 0, 0, 0.7)',
        spinner: 'el-icon-loading'
      })
      api.runTask(this.reRun).then(() => {
        this.logLoading.text = '日志加载中...'
        this.pollTaskLog(0)
      }).catch(() => {
        this.logLoading.close()
        this.$message.error('补数请求失败')
      })
    },
    pollTaskLog(retryCount) {
      const MAX_RETRIES = 5
      const INTERVAL = 5000
      api.getTaskLog(this.log).then(res => {
        this.logList = res.model || []
        this.log.totalCount = res.totalCount
        if (this.logList.length === 0 && retryCount < MAX_RETRIES) {
          this.queryLogTask = setTimeout(() => {
            this.pollTaskLog(retryCount + 1)
          }, INTERVAL)
        } else {
          this.logLoading.close()
        }
      }).catch(() => {
        if (retryCount < MAX_RETRIES) {
          this.queryLogTask = setTimeout(() => {
            this.pollTaskLog(retryCount + 1)
          }, INTERVAL)
        } else {
          this.logLoading.close()
        }
      })
    },
    clearLogPoll() {
      if (this.queryLogTask) {
        clearTimeout(this.queryLogTask)
        this.queryLogTask = null
      }
      if (this.logLoading) {
        this.logLoading.close()
      }
    },
    // 下发配置到 Agent
    issue(row) {
      const loading = this.$loading({ lock: true, text: '正在下发，请稍候...', background: 'rgba(0,0,0,0.5)' })
      api.issueType(row).then(res => {
        loading.close()
        if (res.model.code === 200) {
          this.$message({
            showClose: true,
            message: '下发成功!',
            type: 'success'
          })
          this.getData(this.datas)
        } else {
          this.$message({
            showClose: true,
            message: res.model.msg,
            type: 'error'
          })
        }
      }).catch(() => {
        loading.close()
      })
    },
    // 任务列表的上移
    moveUp(index, row) {
      var that = this
      if (index > 0) {
        const upDate = that.jobList[index - 1]
        that.jobList.splice(index - 1, 1)
        that.jobList.splice(index, 0, upDate)
      } else {
        alert('已经是第一条，不可上移')
      }
    },
    // 任务列表的下移
    moveDown(index, row) {
      var that = this
      if ((index + 1) === that.jobList.length) {
        alert('已经是最后一条，不可下移')
      } else {
        const downDate = that.jobList[index + 1]
        that.jobList.splice(index + 1, 1)
        that.jobList.splice(index, 0, downDate)
      }
    },
    templateData(val, type) {
      this.temData = { ...val }
      if (type === 2) {
        this.modelShow()
      }
    },
    affirmInNode() {
      this.$refs.inNodeForm.validate((valid) => {
        if (valid) {
          // 如果是api上报类型，则需要判断访问路径是否唯一
          if (this.jobList[this.currentRow].inNode.type === 'apiUp') {
            let nodeId = this.pathMap.get(this.inNode.path)
            if (nodeId !== undefined && nodeId !== this.jobList[this.currentRow].inNode.id) {
              this.$message.error({
                message: this.inNode.path + '已存在，请重新输入访问路径'
              })
              return
            } else {
              nodeId = nodeId === undefined ? -99 : nodeId
              this.pathMap.set(this.inNode.path, nodeId)
            }
          }
          // 获取当前代码块的值
          if (this.$refs.MonAco) {
            this.inNode.scriptContent = this.$refs.MonAco.getVal()
            if (!this.scriptNotNull(this.inNode)) {
              return false
            }
          }
          this.jobList[this.currentRow].inNode.configValue = JSON.stringify(this.inNode)
          if (this.$refs.MonAco) {
            this.$refs.MonAco.clearContent()
          }
          this.ShowInput_Database = false
        }
      })
    },
    scriptNotNull(node) {
      if (node.scriptContent === '') {
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
      // 赋值操作
      this.transformNode.scriptContent = this.$refs.MonAcoTransformNode.getVal()
      if (!this.scriptNotNull(this.transformNode)) {
        return false
      }
      this.jobList[this.currentRow].transformNode.configValue = JSON.stringify(this.transformNode)
      this.$refs.MonAcoTransformNode.clearContent()
      // 返回新增弹窗
      this.switchNode = false
    },
    affirmOutNode() {
      this.$refs.outNodeForm.validate((valid) => {
        if (valid) {
          // 获取当前代码块的值
          this.outNode.scriptContent = this.$refs.outMonAco.getVal()
          if (!this.scriptNotNull(this.outNode)) {
            return false
          }
          this.jobList[this.currentRow].outNode.configValue = JSON.stringify(this.outNode)
          // 返回新增弹窗
          this.$refs.outMonAco.clearContent()
          this.Showoutput_Transfer = false
        }
      })
    },
    // 任务列表的输入节点配置按钮方法
    changeOptionsInput(data) {
      if (this.$refs.inNodeForm) {
        this.$refs.inNodeForm.clearValidate()
      }
      this.currentRow = data.$index
      this.inNode = JSON.parse(data.row.inNode.configValue)
      if (this.inNode.scriptContent === undefined) {
        this.inNode.scriptContent = this.exampleData['in']
      }
      // 获取数据源字段列表（Monaco 自动补全）
      this.loadDatasourceFields(this.inNode.dataSource)
      setTimeout(() => {
        this.showEditor = 1
        this.$nextTick(() => {
          if (this.$refs.MonAco) {
            this.setValue(this.$refs.MonAco, this.inNode)
          }
        })
      }, 50)
      this.ShowInput_title = this.optionsInput.find(val => val.propkey === data.row.inNode.type).propvalue
      this.foot_job_name = data.row.jobName
      // 设置默认值
      // api上报设置默认值
      if (data.row.inNode.type === 'apiUp') {
        this.inNode.protocol = this.inNode.protocol ? this.inNode.protocol : this.$set(this.inNode, 'protocol', 'http')
        this.inNode.authFlag = this.inNode.authFlag ? this.inNode.authFlag : this.$set(this.inNode, 'authFlag', 'y')
      }
      this.ShowInput_Database = true
    },
    // 任务列表的转换节点的配置按钮方法
    changeOptionsTransform(data) {
      if (this.$refs.transformNodeForm) {
        this.$refs.transformNodeForm.clearValidate()
      }
      this.currentRow = data.$index
      this.transformNode = JSON.parse(data.row.transformNode.configValue)
      if (this.transformNode.scriptContent === undefined) {
        this.transformNode.scriptContent = this.exampleData['transform']
      }
      setTimeout(() => {
        this.showEditor = 2
        this.$nextTick(() => {
          if (this.$refs.MonAcoTransformNode) {
            this.setValue(this.$refs.MonAcoTransformNode, this.transformNode)
          }
        })
      }, 50)
      this.foot_job_name = data.row.jobName
      this.switchNode_title = this.optionsTransform.find(val => val.propkey === data.row.transformNode.type).propvalue
      // 返回
      this.switchNode = true
    },
    // 任务列表的输出节点的配置按钮方法
    changeOptionsOutput(data) {
      if (this.$refs.outNodeForm) {
        this.$refs.outNodeForm.clearValidate()
      }
      this.currentRow = data.$index
      this.outNode = JSON.parse(data.row.outNode.configValue)
      if (this.outNode.scriptContent === undefined) {
        this.outNode.scriptContent = this.exampleData['out']
      }
      // 获取数据源字段列表（Monaco 自动补全）
      this.loadDatasourceFields(this.outNode.dataSource)
      setTimeout(() => {
        this.showEditor = 3
        this.$nextTick(() => {
          if (this.$refs.outMonAco) {
            this.setValue(this.$refs.outMonAco, this.outNode)
          }
        })
      }, 50)
      this.foot_job_name = data.row.jobName
      this.Showoutput_title = this.optionsOutput.find(val => val.propkey === data.row.outNode.type).propvalue
      // 返回
      this.Showoutput_Transfer = true
    },
    setValue(monaco, node) {
      monaco.$data.defaultOpts.value = node.scriptContent
      monaco.setValue(node.scriptContent)
    },
    // 获取数据源字段列表，传递给 Monaco 编辑器自动补全
    loadDatasourceFields(datasourceId) {
      if (datasourceId === null || datasourceId === undefined || datasourceId === '') {
        this.currentFields = []
        return
      }
      api.getDatasourceFields(datasourceId).then(res => {
        this.currentFields = res.model || []
      }).catch(() => {
        this.currentFields = []
      })
    },
    // 参数的删除
    delTableData(index) {
      this.tableData.splice(index.$index, 1)
    },
    // 任务列表的删除
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
    copyJob(data) {
      const copyRow = JSON.parse(JSON.stringify(data.row))
      copyRow.jobName = copyRow.jobName + '_COPY'
      copyRow.id = ''
      copyRow.inNode.id = ''
      copyRow.outNode.id = ''
      copyRow.transformNode.id = ''
      copyRow.__sortId = ++this.sortIdCounter
      this.jobList.push(copyRow)
    },
    enableAll(flag) {
      this.jobList.forEach(a => {
        a.enable = flag
      })
    },
    copyJobJson(data) {
      const copyRow = JSON.parse(JSON.stringify(data.row))
      copyRow.jobName = copyRow.jobName + '_COPY_J'
      copyRow.id = ''
      copyRow.inNode.id = ''
      copyRow.outNode.id = ''
      copyRow.transformNode.id = ''

      const transfer = document.createElement('input')
      document.body.appendChild(transfer)
      transfer.value = JSON.stringify(copyRow)
      transfer.focus()
      transfer.select()
      if (document.execCommand('copy')) {
        document.execCommand('copy')
      }
      transfer.blur()
      document.body.removeChild(transfer)
      this.$message({
        showClose: true,
        message: '复制成功!',
        type: 'success'
      })
    },
    // 参数的添加
    addParam() {
      this.tableData.push({ 'key': '', 'value': '', __sortId: ++this.sortIdCounter })
    },
    batchSetParams() {
      this.batch_falg = true
      if (!this.jobList) {
        return
      }
      this.batchTableData = []
      const inSet = new Set()
      const outSet = new Set()
      this.jobList.forEach(a => {
        inSet.add(a.inNode.type)
        outSet.add(a.outNode.type)
      })
      inSet.forEach(inObj => {
        const obj = {
          'sourceType': inObj, // 数据源类型
          'sourceTypeName': this.optionsInput.find(val => val.propkey === inObj).propvalue,
          'nodeType': 'in', // 节点
          'nodeTypeName': '输入节点',
          'dataSource': '' // 数据源
        }
        this.batchTableData.push(obj)
      })
      outSet.forEach(outObj => {
        const obj = {
          'sourceType': outObj, // 数据源类型
          'sourceTypeName': this.optionsOutput.find(val => val.propkey === outObj).propvalue,
          'nodeType': 'out', // 节点
          'nodeTypeName': '输出节点',
          'dataSource': '' // 数据源
        }
        this.batchTableData.push(obj)
      })
    },
    batchSetConfirm() {
      this.jobList.forEach(a => {
        const inDs = this.batchTableData.find(val => val.nodeType === a.inNode.classify && val.sourceType === a.inNode.type).dataSource
        const outDs = this.batchTableData.find(val => val.nodeType === a.outNode.classify && val.sourceType === a.outNode.type).dataSource
        const inConfigValue = JSON.parse(a.inNode.configValue)
        const outConfigValue = JSON.parse(a.outNode.configValue)
        inConfigValue.dataSource = inDs
        outConfigValue.dataSource = outDs
        a.inNode.configValue = JSON.stringify(inConfigValue)
        a.outNode.configValue = JSON.stringify(outConfigValue)
      })
      this.batch_falg = false
      this.$message({
        showClose: true,
        message: '批量设置成功，请点击保存完成数据更新',
        type: 'success'
      })
    },
    importFile(event) {
      const that = this
      this.import_flag = false
      const loading = Loading.service({
        fullscreen: true,
        text: '导入中',
        background: 'rgba(0, 0, 0, 0.7)',
        spinner: 'el-icon-loading'
      })
      const reader = new FileReader()
      reader.readAsText(event.raw, 'utf-8')// 发起异步请求
      reader.onload = function() {
        var res = JSON.parse(reader.result)
        that.jobList = res.jobList
        that.tableData = res.configValue != null ? JSON.parse(res.configValue) : []
        that._assignSortIds(that.jobList)
        that._assignSortIds(that.tableData)
        setTimeout(() => {
          that.$refs.impUpload.clearFiles()
          loading.close()
        }, 1000)
      }
    },
    addByJson() {
      this.new_flag = true
      this.jsonTask.newJson = ''
    },
    // 任务列表的添加
    addJob() {
      this.jobList.push({
        __sortId: ++this.sortIdCounter,
        valueName: '',
        enable: 'true',
        inNode: {
          classify: 'in',
          configValue: '{}',
          type: ''
        },
        outNode: {
          classify: 'out',
          configValue: '{}',
          type: ''
        },
        transformNode: {
          classify: 'transform',
          configValue: '{}',
          type: ''
        }
      })
    },
    addJobJson() {
      if (this.jsonTask.newJson === '') {
        this.$message.error('json串格式不能为空，请填写')
        return
      }
      let jsonObj = null
      let flag = false
      try {
        jsonObj = JSON.parse(this.jsonTask.newJson)
        if (!(jsonObj.inNode && jsonObj.transformNode && jsonObj.outNode)) {
          flag = true
        }
      } catch (e) {
        flag = true
      }
      if (flag) {
        this.$message.error('json串格式不正确,请检查')
        return
      }
      jsonObj.__sortId = ++this.sortIdCounter
      this.jobList.push(jsonObj)
      this.new_flag = false
    },
    // 关闭模板选择按钮的跳转界面弹窗并赋值
    modelShow() {
      // 设置模板名称和模板id
      this.subFormData.templateName = this.temData.name
      this.subFormData.templateId = this.temData.id
      // 加载模板内容
      api.getTemplateContent(this.temData.id).then(res => {
        this.jobList = res.jobList
        this.tableData = res.configValue != null ? JSON.parse(res.configValue) : []
        this._assignSortIds(this.jobList)
        this._assignSortIds(this.tableData)
        this.pathMap.clear()
        this.jobList.forEach(job => {
          if (job.inNode.type === 'apiUp') {
            const conf = JSON.parse(job.inNode.configValue)
            this.pathMap.set(conf.path, job.inNode.id)
          }
        })

        this.fileMap = {}
        this.fileList = []
        if (res.pluginsList) {
          res.pluginsList.forEach(ps => {
            const pluginFile = {
              name: ps.name
            }
            this.fileList.push(pluginFile)
            this.fileMap[ps.name] = ps.fileUrl
          })
        }
      })
      this.ShowMoule = false
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
      })
    },
    handlePreview(file) {
      location.href = `${process.env.VUE_APP_BASE_API}/services/fwcore/config/down-plugins/${this.subFormData.id}/${file.name}`
    },
    beforeUpload(file) {
      const lastDotIndex = file.name.lastIndexOf('.')
      const extension = file.name.slice(lastDotIndex)
      const isJs = (extension === '.js')

      if (file.size / (1024 * 1024) > 5) {
        this.$notify.warning({
          title: '警告',
          message: `文件大小不得超过2M`
        })
        return false
      } else if (!isJs) {
        this.$notify.warning({
          title: '警告',
          message: `只能上传js文件`
        })
        return isJs
      } else {
        const formData = new FormData()
        formData.append('file', file)
        api.upload(formData, this.subFormData.id).then((res) => {
          this.fileMap[file.name] = res.model
        })
      }
    },
    handleUpload(file, fileList) {
    },
    // 新增&编辑的确认方法
    subForm(formData) {
      const obj = {
        ...this.subFormData,
        jobList: this.jobList
      }
      obj.configValue = this.tableData
      // 始终从上传组件构建 pluginsList，避免残留导致重复
      obj.pluginsList = []
      if (this.$refs.pluginsUpload && this.$refs.pluginsUpload.uploadFiles.length > 0) {
        this.$refs.pluginsUpload.uploadFiles.forEach(a => {
          const file = {
            name: a.name,
            configId: this.subFormData.id,
            fileUrl: this.fileMap[a.name]
          }
          obj.pluginsList.push(file)
        })
      }

      this.$refs[formData].validate((valid) => {
        if (valid) {
          api
            .submitForm(obj)
            .then((res) => {
              this.$message.success('保存成功')
              this.subFormData.id = res.model
              this.getData(this.datas)
              api.getIdRow(this.subFormData.id).then(rr => {
                const cdata = JSON.parse(rr.model)
                // 把访问路径加到集合中,用来判断是否存在重复的访问路径
                this.jobList = cdata.jobList
                this._assignSortIds(this.jobList)
                this.pathMap.clear()
                this.jobList.forEach(job => {
                  if (job.inNode.type === 'apiUp') {
                    const conf = JSON.parse(job.inNode.configValue)
                    this.pathMap.set(conf.path, job.inNode.id)
                  }
                })
              }).catch(e1 => {
                console.error(e1)
              })
            })
            .catch(e => {
              console.error(e)
            })
        } else {
          return false
        }
      })
    },
    clearValidate() {
      if (this.$refs.configForm) {
        this.$refs.configForm.clearValidate()
      }
    },
    // 新增或编辑页面
    async edit(row) {
      // 重置验证
      this.clearValidate()
      this.fileMap = {}
      this.fileList = []
      if (this.$refs.pluginsUpload) {
        this.$refs.pluginsUpload.clearFiles()
      }
      // 当为新增时，重置表单 row ==0  操作全是重置表单
      if (row === 0) {
        // 初始化数据
        Object.keys(this.subFormData).forEach((key) => (this.subFormData[key] = null))
        this.tableData = []
        Object.keys(this.transformNode).forEach((key) => (this.transformNode[key] = null))
        Object.keys(this.inNode).forEach((key) => (this.inNode[key] = null))
        Object.keys(this.outNode).forEach((key) => (this.outNode[key] = null))
        this.jobList = []
        // 默认自定义模板
        this.subFormData.templateName = '自定义'
        this.subFormData.templateId = 0
        // 客户默认当前用户所属租户
        this.subFormData.tenantId = this.cur_user.tenantId + ''
        // this.subFormData.tenantId = Object.keys(this.bcpTenantName)[0]
        // 显示窗口
        this.dialogFormVisible = true
        this.initParamSortable()
        this.initJobSortable()
        return
      }
      // 编辑
      const res = await api.getIdRow(row.id)
      const data = JSON.parse(res.model)
      // 把访问路径加到集合中,用来判断是否存在重复的访问路径
      this.jobList = data.jobList
      this.tableData = JSON.parse(data.configValue)
      this._assignSortIds(this.jobList)
      this._assignSortIds(this.tableData)
      this.pathMap.clear()
      this.jobList.forEach(job => {
        if (job.inNode.type === 'apiUp') {
          const conf = JSON.parse(job.inNode.configValue)
          this.pathMap.set(conf.path, job.inNode.id)
        }
      })
      if (data.pluginsList) {
        data.pluginsList.forEach(ps => {
          const pluginFile = {
            name: ps.name
          }
          this.fileList.push(pluginFile)
          this.fileMap[ps.name] = ps.fileUrl
        })
      }
      const { id, name, nodeId, templateId, templateName } = data
      const tenantId = data.tenantId + ''
      this.subFormData = { id, name, nodeId, templateId, tenantId, templateName }
      this.dialogFormVisible = true
      this.initParamSortable()
      this.initJobSortable()
    },
    getData(datas = this.datas) {
      this.$set(this, 'datas', datas)
      this.$set(this, 'params', datas.params)
      this.$set(this.datas.table, 'loading', true)
      this.$set(this.params, 'orgId', this.params.orgName)
      api.getPage({ ...this.params, key: this.datas.filterList[0].name }).then((res) => {
        this.$set(this.datas.resData, 'rows', res.model)
        this.$set(this.datas.params, 'currentPage', res.currentPage)
        this.$set(this.datas.params, 'pageSize', res.pageSize)
        this.$set(this.datas.resData, 'totalCount', res.totalCount)
        this.$set(this.datas.table, 'loading', false)
      })
    },
    cellMouseEnter(row, column, cell, enter) {
      alert('row...')
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

.debug {
  margin-left: 0px;
}

//设置form-item中lable的样式
.el-form--label-top .el-form-item__label {
  float: none;
  display: inline-block;
  text-align: left;
  padding: 0 0 1px;
}

//设置弹出窗口内容样式
.el-dialog__body {
  padding: 10px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}

//新增弹窗样式
.pub_dialog .el-dialog {
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
.pub_dialog .el-dialog .el-dialog__body {
  max-height: 80% !important;
  overflow-y: auto;
}

.dg-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}

.task-stats {
  font-size: 12px;
  color: #909399;
  margin-right: 15px;
}
</style>
<style lang="scss">
.el-table .job-disabled-row {
  background-color: #f5f5f5 !important;
  opacity: 0.6;
}
</style>
