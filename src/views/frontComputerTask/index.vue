<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="lastBtn">
        <el-button type="primary" size="mini" @click="remove(0)">删除</el-button>
        <el-button type="primary" size="mini" @click="send(0)">下发</el-button>
      </template>
      <template slot="enable" slot-scope="scope">
        <span>{{ scope.value.enable ? '启用' : '禁用' }}</span>
      </template>
      <template slot="oper" slot-scope="scope">
        <!-- 带参数跳转 -->
        <el-button size="mini" type="text" @click="edit(scope.value)">编辑</el-button>
        <!--
        <router-link :to="{path:'taskRunInfo',query:{code:scope.value.code}}">
          <el-button size="mini" type="text">日志</el-button>
        </router-link>
        -->
        <!--        <el-button size="mini" type="text" @click="send(scope.value)">下发</el-button>-->
        <!--        <el-button size="mini" type="text" @click="remove(scope.value)">删除</el-button>-->
      </template>
    </mod-filter>
    <!--编辑界面-->
    <el-dialog width="50%" :title="'编辑'" :visible.sync="dialogFormVisible">
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="100px">
        <el-form-item label="租户" prop="tenant">
          <el-select v-model="subFormData.tenantId" size="mini" @change="getComputers">
            <el-option v-for="(optItem,optindex) in tenants" :key="optindex" :label="optItem.name" :value="optItem.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="前置机" prop="computer">
          <el-select v-model="subFormData.computerId" size="mini">
            <el-option v-for="(optItem,optindex) in computers" :key="optindex" :label="optItem.name"
                       :value="optItem.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="taskId" v-show="false" prop="taskName">
          <el-input v-model="subFormData.taskId" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="subFormData.taskName" maxlength="100" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="任务编码" prop="code">
          <el-input v-model="subFormData.code" maxlength="20" size="mini" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="运行计划" prop="plan">
          <el-select v-model="subFormData.plan" size="mini" auto-complete="off">
            <el-option v-for="(optItem,optindex) in planOptions" :key="optindex" :label="optItem.propkey"
                       :value="optItem.propkey"
            />
          </el-select>
        </el-form-item>
<!--        <el-form-item v-show="false" label="cron" prop="cron">-->
<!--          <el-input v-model="subFormData.cron" size="mini" auto-complete="off"/>-->
<!--        </el-form-item>-->
        <!--   -->
        <!--        <el-form-item v-if="planCheckWay===1" label="运行计划" prop="plan">-->
        <!--          <el-select v-model="subFormData.plan" size="mini" auto-complete="off" @change="getCronByPlan">-->
        <!--            <el-option v-for="(optItem,optindex) in planOptions" :key="optindex" :label="optItem.propvalue"-->
        <!--                       :value="optItem.propkey"-->
        <!--            />-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item v-if="planCheckWay===1" v-show="false" label="cron" prop="cron">-->
        <!--          <el-input v-model="subFormData.cron" size="mini" auto-complete="off"/>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item v-if="planCheckWay===2" label="cron" prop="cron">-->
        <!--          <el-input v-model="subFormData.cron" size="mini" auto-complete="off"/>-->
        <!--        </el-form-item>-->
        <el-form-item label="绑定service" prop="execService">
          <el-input v-model="subFormData.execService" maxlength="50" size="mini" auto-complete="off"/>
        </el-form-item>
        <!--        <el-form-item label="绑定用户场景" prop="userCase">-->
        <!--          <el-input v-model="subFormData.userCaseId" maxlength="10" size="mini" auto-complete="off"/>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="下发状态" prop="sendStatusName">-->
        <!--          <el-select v-model="subFormData.sendStatus" size="mini">-->
        <!--            <el-option v-for="(optItem,optindex) in sendStatusOptions" :key="optindex" :label="optItem.propvalue"-->
        <!--                       :value="optItem.propkey"-->
        <!--            />-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="运行状态" prop="resultName">-->
        <!--          <el-select v-model="subFormData.result" size="mini">-->
        <!--            <el-option v-for="(optItem,optindex) in resultOptions" :key="optindex" :label="optItem.propvalue"-->
        <!--                       :value="optItem.propkey"-->
        <!--            />-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="任务状态" prop="status">-->
        <!--          <el-input v-model="subFormData.status" size="mini" auto-complete="off"/>-->
        <!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false;showCronBox=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/computerTask'

export default {
  data() {
    return {
      planOptions: [],
      nameOptions: [],
      sendStatusOptions: [],
      resultOptions: [],
      planCheckWay: 1,
      tenants: [],
      computers: [],
      dialogFormVisible: false,
      dialogRowTitle: null,
      selectionPropList: [],
      rowData: {
        id: null,
        tenant: null,
        tenantId: null,
        computer: null,
        computerId: null,
        taskName: null,
        taskId: null,
        code: null,
        plan: null,
        cron: null,
        execService: null,
        userCase: null,
        userCaseId: null,
        sendStatus: null,
        sendStatusName: null,
        result: null,
        resultName: null,
        status: null
      },
      subFormData: {
        id: null,
        tenant: null,
        tenantId: null,
        computer: null,
        computerId: null,
        taskName: null,
        taskId: null,
        code: null,
        plan: null,
        cron: null,
        execService: null,
        userCase: null,
        userCaseId: null,
        sendStatus: null,
        sendStatusName: null,
        result: null,
        resultName: null,
        status: null

      },
      subFormDataRule: {
        'tenant': [{
          required: true,
          message: '请填写租户'
        }],
        'computer': [{
          required: true,
          message: '请填写前置机'
        }],
        'taskName': [{
          required: true,
          message: '请填写任务名称'
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
        // 'userCaseId': [{
        //   required: true,
        //   message: '请填写绑定用户场景'
        // }],
        'sendStatusName': [{
          required: true,
          message: '请填写下发状态'
        }],
        'resultName': [{
          required: true,
          message: '请填写运行状态'
        }],
        'status': [{
          required: true,
          message: '请填写任务状态'
        }]
      },
      tableData: [],
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
            prop: 'tenant',
            conditionshow: true,
            filedShow: true,
            label: '租户',
            placeholder: '租户',
            optList: []
          },
          {
            type: 'input',
            prop: 'computer',
            conditionshow: true,
            filedShow: true,
            label: '前置机',
            placeholder: '前置机',
            optList: []
          },
          {
            type: 'input',
            prop: 'taskName',
            conditionshow: true,
            filedShow: true,
            label: '任务名称',
            placeholder: '名称',
            optList: []
          },
          {
            type: 'input',
            prop: 'code',
            conditionshow: true,
            filedShow: true,
            label: '任务编码',
            placeholder: '编码',
            optList: []
          },
          {
            type: 'input',
            prop: 'plan',
            conditionshow: false,
            filedShow: true,
            label: '运行计划',
            placeholder: '运行计划',
            optList: []
          },
          {
            type: 'input',
            prop: 'execService',
            conditionshow: false,
            filedShow: true,
            label: '绑定service',
            placeholder: '绑定service',
            optList: []
          },
          {
            type: 'input',
            prop: 'userCase',
            conditionshow: false,
            filedShow: true,
            label: '绑定用户场景',
            placeholder: '用户场景',
            optList: []
          },
          {
            type: 'input',
            prop: 'sendStatusName',
            conditionshow: false,
            filedShow: true,
            label: '下发状态',
            placeholder: '下发状态',
            optList: []
          },
          {
            type: 'input',
            prop: 'resultName',
            conditionshow: false,
            filedShow: true,
            label: '运行状态',
            placeholder: '运行状态',
            optList: []
          },
          {
            type: 'input',
            prop: 'statusName',
            conditionshow: false,
            filedShow: true,
            label: '任务状态',
            placeholder: '任务状态',
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
    this.getPlanOptions()
    this.getTenants()
    this.getSendStatusOptions()
    this.getResultOptions()
  },
  mounted() {
  },
  methods: {
    inputByMenu() {
      this.subFormData.cron = null
    },
    inputByCustom() {
      this.subFormData.plan = null
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
    // 下发
    send(row) {
      let ids = []
      if (!row) {
        if (!this.datas.multipleSelection.length) {
          this.$message.info('请选择相关数据')
          return
        }
        ids = this.datas.multipleSelection.map((value) => {
          return value['id']
        })
      } else {
        ids.push(row.id)
      }
      api.batchSendTask(ids).then(res => {
        if (res.code === 200) {
          this.$message.success(res.model)
        } else {
          this.$message.error(res.model)
        }
        this.getData(this.datas)
      }).catch(e => {
        return false
      })
    },
    subForm(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          console.log(this[formData])
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
          'tenant': null,
          'tenantId': null,
          'computer': null,
          'computerId': null,
          'taskName': null,
          'taskId': null,
          'code': null,
          'planName': null,
          'plan': null,
          'cron': null,
          'execService': null,
          'userCase': null,
          'userCaseId': null,
          'sendStatus': null,
          'sendStatusName': null,
          'result': null,
          'resultName': null,
          'status': null
        })
        this.$nextTick(() => {
          this.$refs['subFormData'].resetFields()
        })
        return
      }
      this.$set(this.subFormData, 'id', row.id)
      this.$set(this.subFormData, 'tenant', row.tenant)
      this.$set(this.subFormData, 'tenantId', row.tenantId)
      this.$set(this.subFormData, 'computer', row.computer)
      this.getComputers()
      this.$set(this.subFormData, 'computerId', row.computerId)
      this.$set(this.subFormData, 'taskName', row.taskName)
      this.$set(this.subFormData, 'taskId', row.taskId)
      this.$set(this.subFormData, 'code', row.code)
      this.$set(this.subFormData, 'plan', row.plan)
      this.$set(this.subFormData, 'cron', row.cron)
      this.$set(this.subFormData, 'execService', row.execService)
      this.$set(this.subFormData, 'userCase', row.userCase)
      this.$set(this.subFormData, 'userCaseId', row.userCaseId)
      this.$set(this.subFormData, 'sendStatus', row.sendStatus)
      this.$set(this.subFormData, 'sendStatusName', row.sendStatusName)
      this.$set(this.subFormData, 'result', row.result)
      this.$set(this.subFormData, 'resultName', row.resultName)
      this.$set(this.subFormData, 'status', row.status)
      this.$set(this.subFormData, 'id', row.id)
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
    getPlanOptions() {
      api.getPlanOptions('fw.task.plan').then(res => {
        this.planOptions = res.model
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
      this.subFormData.computerId = null
      const tenantId = this.subFormData.tenantId
      api.getComputers(tenantId).then(res => {
        this.computers = res.model
      }).catch(e => {
        return false
      })
    },
    getSendStatusOptions() {
      api.getSourceTypeOptions('fw.computerTask.sendStatus').then(res => {
        this.sendStatusOptions = res.model
      }).catch(e => {
        return false
      })
    },
    getResultOptions() {
      api.getSourceTypeOptions('fw.computerTask.result').then(res => {
        this.resultOptions = res.model
      }).catch(e => {
        return false
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
