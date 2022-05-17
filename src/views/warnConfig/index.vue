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
                <el-button size="mini" type="text" @click="changeEnable(scope.value)">
                    {{ scope.value.enable ? '禁用' : '启用' }}
                </el-button>
                <el-button size="mini" type="text" @click="sendConfig(scope.value)">
                    下发
                </el-button>
            </template>
        </mod-filter>
        <!--新增/编辑界面-->
        <!-- todo1 -->
        <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible"
                   :close-on-click-modal="false" :close-on-press-escape="false">
            <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData"
                     label-width="120px" size="mini">
                <el-form-item label="集成配置" prop="tenantId">
                    <template>
                        <el-select id="config_id" v-model="subFormData.configId" placeholder="请选择">
                            <el-option v-for="item in integrationConfigs" :label="item.name" :value="item.id"/>
                        </el-select>
                    </template>
                </el-form-item>

                <el-form-item label="任务" prop="tenantId">
                    <template>
                        <el-select id="task_id" value-key="id" v-model="subFormData.taskId" placeholder="请选择">
                            <el-option v-for="item in getConfigTask" :label="item.taskName" :value="item.taskId"/>
                        </el-select>
                    </template>
                </el-form-item>

                <el-form-item label="告警方式" prop="warnMethod">
                    <el-select v-model="subFormData.warnMethodId" placeholder="请选择">
                        <el-option v-for="item in warnMethods" :label="item.name" :value="item.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="节点id" prop="nodeId">
                    <el-input v-model="subFormData.nodeId" placeholder="请填写" maxlength="100" size="mini"
                              auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="enable">
                    <el-select v-model="subFormData.enable" placeholder="请选择">
                        <el-option :label="'启用'" :value="true "></el-option>
                        <el-option :label="'禁用'" :value="false"></el-option>
                    </el-select>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="mini" type="primary" @click="subForm('subFormData')" v-prevent-repeat-click>确 定
                </el-button>
                <el-button size="mini" @click="dialogFormVisible = false;showCronBox=false">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import * as commonApi from '@/api/common'
import { mapGetters } from 'vuex'
import * as api from '@/api/warnConfig'

export default {
    data() {
        return {
            tenantIds: [],
            integrationConfigs: [],
            integrationConfigTasks: [],
            warnMethods: [],

            planOptions: [],
            userCaseOptions: [],
            authOptions: [],
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
                configId: null,
                taskId: null,
                nodeId: null,
                status: null,
                warnMethodId: null,
                tenantId: null,
                enable: true
            },
            subFormDataRule: {
                'configId': [{
                    required: true,
                    message: '请选择集成配置',
                    trigger: 'blur'
                }],
                'taskId': [{
                    required: true,
                    message: '请选择任务'
                }],
                'warnMethodId': [{
                    required: true,
                    message: '请选择告警方式'
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
                        filedShow: false,
                        // 控制搜索框的label显示与否
                        isHiddenSearchLabel: true,
                        label: '关键词',
                        placeholder: '关键词',
                        queryName: '关键词',
                        optList: [],
                        name: '',
                        align: 'left'
                    },
                    {
                        type: 'input',
                        prop: 'taskId',
                        // 控制设置内部 复选框勾选的默认值
                        conditionshow: false,
                        // 控制该字段是否出现在表格里
                        filedShow: false,
                        label: '任务Id',
                        placeholder: '任务Id',
                        queryName: '任务Id',
                        optList: [],
                        name: '',
                        align: 'left'
                    },
                    {
                        type: 'input',
                        prop: 'taskName',
                        // 控制设置内部 复选框勾选的默认值
                        conditionshow: false,
                        // 控制该字段是否出现在表格里
                        filedShow: true,
                        label: '任务名',
                        placeholder: '任务名',
                        queryName: '任务名',
                        optList: [],
                        name: '',
                        align: 'left'
                    },
                    {
                        type: 'input',
                        prop: 'warnMethodId',
                        // 控制设置内部 复选框勾选的默认值
                        conditionshow: false,
                        // 控制该字段是否出现在表格里
                        filedShow: false,
                        // 控制搜索框的label显示与否
                        isHiddenSearchLabel: false,
                        label: '告警方式Id',
                        placeholder: '告警方式Id',
                        queryName: '告警方式Id',
                        optList: [],
                        name: '',
                        align: 'left'
                    },
                    {
                        type: 'input',
                        prop: 'warnMethodName',
                        conditionshow: false,
                        filedShow: true,
                        label: '告警方式',
                        placeholder: '告警方式',
                        optList: []
                    },
                    {
                        type: 'input',
                        prop: 'configId',
                        // 控制设置内部 复选框勾选的默认值
                        conditionshow: false,
                        // 控制该字段是否出现在表格里
                        filedShow: false,
                        label: '配置id',
                        placeholder: '配置id',
                        queryName: '配置id',
                        optList: [],
                        name: '',
                        align: 'left'
                    },
                    {
                        type: 'input',
                        prop: 'configName',
                        // 控制设置内部 复选框勾选的默认值
                        conditionshow: false,
                        // 控制该字段是否出现在表格里
                        filedShow: true,
                        label: '配置名',
                        placeholder: '配置名',
                        queryName: '配置名',
                        optList: [],
                        name: '',
                        align: 'left'
                    },
                    {
                        type: 'input',
                        prop: 'status',
                        conditionshow: false,
                        filedShow: true,
                        label: '下发状态',
                        placeholder: '下发状态',
                        optList: []
                    },
                    {
                        type: 'select',
                        prop: 'enable',
                        conditionshow: true,
                        filedShow: true,
                        isSearchHide: true,
                        slot: true,
                        label: '状态',
                        placeholder: '状态',
                        optList: [{ label: '启用', value: true }, { label: '禁用', value: false }]
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
        ]),
        getConfigTask() {
            let configId = this.subFormData.configId
            return this.integrationConfigTasks.filter(
                function(task) {
                    return task.configId === configId
                }
            )
        }
    },
    methods: {
        input(data) {
            console.log('data===>', data)
        },
        // 删除
        remove(row) {
            api.singleDelete(row.id).catch(
                e => console.log(e.message)
            )
        },
        changeEnable(row) {
            let obj = {
                id: row.id,
                enable: !row.enable
            }
            api.submitForm(obj).then(
                res => {
                  row.enable = !(row.enable)
                  this.getData(this.datas)
                }
            ).catch(
                e => console.log(e.message)
            )
        },
        sendConfig(row) {
            api.sendConf(row.id).then(
                res => {
                    if (res.code === 200) {
                        this.$message({
                            showClose: true,
                            message: '下发成功!',
                            type: 'success'
                        })
                        this.getData(this.datas)
                    } else {
                        this.$message({
                            showClose: true,
                            message: res.model == null ? "下发失败" : res.model,
                            type: 'error'
                        })
                    }
                }
            )
        },
        // 新增或编辑页面
        edit(row) {
            //清空验证信息
            if (!!this.$refs.subFormData) {
                this.$refs.subFormData.clearValidate()
            }
            this.dialogFormVisible = true
            //如果是新增
            if (row === 0) {
                //清空属性值
                Object.keys(this.subFormData).forEach((key) => (this.subFormData[key] = null))
                this.subFormData.enable = true
                //客户默认当前用户所属租户
                this.subFormData.tenantId = this.cur_user.tenantId + ''
                return
            }
            //如果是更新
            Object.keys(this.subFormData).forEach((key) => (this.subFormData[key] = row[key]))
        },
        getData(datas = this.datas) {
            this.$set(this, 'datas', datas)
            this.$set(this, 'params', datas.params)
            this.$set(this.datas.table, 'loading', true)
            this.$set(this.params, 'orgId', this.params.orgName)
            this.params[this.datas.filterList[0].prop] = undefined;
            api.getPage({ ...this.params, key: this.datas.filterList[0].name }).then(res => {
                    this.$set(this.datas.resData, 'rows', res.model)
                    this.$set(this.datas.params, 'currentPage', res.currentPage)
                    this.$set(this.datas.params, 'pageSize', res.pageSize)
                    this.$set(this.datas.resData, 'totalCount', res.totalCount)
                    this.$set(this.datas.table, 'loading', false)
                }
            )
        },
        subForm(subFormData) {
            this.showCronBox = false
            this.$refs.subFormData.validate((valid) => {
                if (valid) {
                    api.submitForm(this.subFormData).then(res => {
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
            let thisObj = this
            api.getBaseConfig({ ...this.params, key: this.datas.filterList[0].name }).then(
                res => {
                    thisObj.integrationConfigTasks = res.model
                    let arr = res.model.map(
                        function(val) {
                            return {
                                id: val.configId,
                                name: val.configName
                            }
                        }
                    )
                    thisObj.integrationConfigs = commonApi.distinct(arr, val => val.id, null)
                }
            ).catch(e => {
                    console.log(e.message())
                    return false
                }
            )
            api.getWarnMethodsByTenantId(this.cur_user.tenantId + '').then(
                res => {
                    thisObj.warnMethods = res.model
                }
            ).catch(e => {
                    console.log(e.message())
                    return false
                }
            )
        }
    }
}
</script>

<style lang="scss" scoped>

</style>
