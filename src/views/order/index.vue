<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData" @data-loaded="handleDataLoaded">
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
    <el-dialog width="50%" :title="subFormData.id?'编辑':'新增'" :visible.sync="dialogFormVisible"
               :close-on-click-modal="false" :close-on-press-escape="false"
    >
      <el-form ref="subFormData" :model="subFormData" :rules="subFormDataRule" class="subFormData" label-width="120px"
               size="mini"
      >

        <el-form-item label="订单来源" prop="source">
          <el-select v-model="subFormData.source" placeholder="请选择">
            <el-option v-for="(optItem,optindex) in sourceOptions" :key="optindex" :label="optItem.propvalue"
                       :value="optItem.propkey"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="云商店订单ID" prop="orderId">
          <!--maxlength 属性规定输入字段的最大长度-->
          <el-input v-model="subFormData.orderId" placeholder="单行输入" maxlength="20" size="mini"
                    auto-complete="off"
          />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="规格数量" prop="orderId">
              <!--maxlength 属性规定输入字段的最大长度-->
              <el-input v-model="subFormData.periodNumber" placeholder="单行输入" maxlength="20" size="mini"
                        auto-complete="off"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品规格" prop="periodType">
              <el-radio-group v-model="subFormData.periodType">
                <el-radio :label="'year'">年</el-radio>
                <el-radio :label="'month'">月</el-radio>
                <el-radio :label="'day'">日</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-picker v-model="subFormData.startTime" placeholder="选择时间" format="yyyy-MM-dd HH:mm:ss"
                              value-format="yyyy-MM-dd HH:mm:ss"
              ></el-time-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间" prop="expireTime">
              <el-time-picker v-model="subFormData.expireTime" placeholder="选择时间" format="yyyy-MM-dd HH:mm:ss"
                              value-format="yyyy-MM-dd HH:mm:ss"
              ></el-time-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="计费模式" prop="chargingMode">
          <el-radio-group v-model="subFormData.chargingMode">
            <el-radio :label="'0'">按需购买</el-radio>
            <el-radio :label="'1'">包周期购买</el-radio>
            <el-radio :label="'3'">按次购买</el-radio>
            <el-radio :label="'5'">按需套餐包购买</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="用户验收时间" prop="acceptanceTime">
          <el-time-picker v-model="subFormData.acceptanceTime" placeholder="选择时间" format="yyyy-MM-dd HH:mm:ss"
                          value-format="yyyy-MM-dd HH:mm:ss"
          ></el-time-picker>
          <el-button @click="clearTime">清空时间</el-button>
        </el-form-item>
        <el-form-item label="订单金额" prop="orderAmount">
          <!--maxlength 属性规定输入字段的最大长度-->
          <el-input v-model="subFormData.orderAmount" placeholder="单行输入" maxlength="20" size="mini"
                    auto-complete="off"
          />
        </el-form-item>
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="subFormData.customerId" placeholder="请选择">
            <el-option v-for="(optItem,optindex) in customerOptions" :key="optindex" :label="optItem"
                       :value="optindex"
            />
          </el-select>
        </el-form-item>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-prevent-repeat-click size="mini" type="primary" @click="subForm('subFormData')">确 定</el-button>
        <el-button size="mini" @click="dialogFormVisible = false;showCronBox=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '@/api/order'
import * as menuApi from '@/api/menu'
import * as sel from '@/api/select'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      planOptions: [],
      userCaseOptions: [],
      sourceOptions: [],
      customerOptions: [],
      convs: [],
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
        source: null,
        orderId: null,
        periodNumber: null,
        periodType: null,
        startTime: null,
        expireTime: null,
        chargingMode: null,
        acceptanceTime: null,
        orderAmount: null,
        customerId: null
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
            prop: 'source',
            // 控制设置内部 复选框勾选的默认值
            conditionshow: true,
            // 控制该字段是否出现在表格里
            filedShow: true,
            label: '订单来源',
            placeholder: '订单来源',
            optList: []
          },
          {
            type: 'input',
            prop: 'orderId',
            conditionshow: false,
            filedShow: true,
            label: '云商店订单ID',
            placeholder: '云商店订单ID',
            optList: []
          },
          {
            type: 'input',
            prop: 'periodNumber',
            conditionshow: false,
            filedShow: true,
            label: '规格数量',
            placeholder: '规格数量',
            optList: []
          },
          {
            type: 'select',
            prop: 'periodType',
            conditionshow: true,
            filedShow: true,
            label: '产品规格',
            placeholder: '产品规格',
            optList: [
              {
                label: '年',
                value: 'year'
              },
              {
                label: '月',
                value: 'month'
              },
              {
                label: '天',
                value: 'day'
              }
            ],
            conv: {
              'year': '年',
              'month': '月',
              'day': '日'
            }
          },
          {
            type: 'input',
            prop: 'startTime',
            conditionshow: false,
            filedShow: true,
            label: '开始时间',
            placeholder: '开始时间',
            optList: []
          },
          {
            type: 'input',
            prop: 'expireTime',
            conditionshow: false,
            filedShow: true,
            label: '过期时间',
            placeholder: '过期时间',
            optList: []
          },
          {
            type: 'select',
            prop: 'chargingMode',
            conditionshow: false,
            filedShow: true,
            label: '计费模式',
            placeholder: '计费模式',
            optList: [],
            conv: {
              0: '按需购买',
              1: '包周期购买',
              3: '按次购买',
              5: '按需套餐包购买'
            }
          },
          {
            type: 'input',
            prop:
              'acceptanceTime',
            conditionshow:
              false,
            filedShow:
              true,
            label:
              '用户验收时间',
            placeholder:
              '用户验收时间',
            optList:
              []
          }
          ,
          {
            type: 'input',
            prop:
              'orderAmount',
            conditionshow:
              false,
            filedShow:
              true,
            label:
              '订单金额',
            placeholder:
              '订单金额',
            optList:
              []
          }
          ,
          {
            type: 'input',
            prop:
              'createTime',
            conditionshow:
              false,
            filedShow:
              false,
            label:
              '创建时间',
            placeholder:
              '创建时间',
            optList:
              []
          }
          ,
          {
            type: 'input',
            prop:
              'lastUpdateTime',
            conditionshow:
              false,
            filedShow:
              true,
            label:
              '最后更新时间',
            placeholder:
              '最后更新时间',
            optList:
              []
          }
          ,
          {
            type: 'input',
            prop:
              'customerId',
            conditionshow:
              false,
            filedShow:
              true,
            label:
              '客户',
            placeholder:
              '客户',
            optList:
              []
            //conv: this.convs["customerId"]
          }
          ,
          {
            type: 'input',
            prop:
              'oper',
            conditionshow:
              false,
            filedShow:
              true,
            isSearchHide:
              true,
            slot:
              true,
            label:
              '操作',
            placeholder:
              '操作',
            optList:
              []
          }
        ]
      },
      showCronBox: false
    }
  },
  created() {
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
    clearTime() {
      this.subFormData.acceptanceTime = ''
    },
    handleDataLoaded() {
      // 数据加载完成后执行的操作
      console.log('数据加载完成')
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
      menuApi.getSourceTypeOptions('md.bcp.order.source').then(res => {
        this.sourceOptions = res.model
      }).catch(e => {
        return false
      })
      sel.getFreelist({ code: 'bcp.tenant.name', params: '' }).then(res => {
        this.customerOptions = res.model
        const index = this.datas.filterList.findIndex(a => {
          return a.prop == 'customerId'
        }).valueOf()
        this.$set(this.datas.filterList[index], 'conv', this.customerOptions)

      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
