<template lang="html">
  <div class="app-container">
    <mod-filter :datas="datas" @query="getData">
      <template slot="enable" slot-scope="scope">
        <span>{{ scope.value.enable ? '启用' : '禁用' }}</span>
      </template>
      <template slot="oper" slot-scope="scope">
        <el-button size="mini" type="text" @click="detail(scope.value)">详情</el-button>
      </template>
    </mod-filter>
  </div>
</template>

<script>
import * as api from '@/api/taskRunInfo'

export default {
  data() {
    return {
      tenants: [],
      dialogRowTitle: null,
      rowData: {
        id: null,
        code: null,
        frontComputerTaskId: null,
        resultInfo: null,
        error: null,
        runTime: null,
        result: null
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
            prop: 'code',
            conditionshow: true,
            filedShow: true,
            label: '任务编码',
            placeholder: '编码',
            optList: []
          },
          {
            type: 'input',
            prop: 'runTime',
            conditionshow: false,
            filedShow: true,
            label: '运行时间',
            placeholder: '运行时间',
            optList: []
          },
          {
            type: 'daterange',
            dateProp: 'runTimeRange',
            props: ['runTimeBegin', 'runTimeEnd'],
            conditionshow: true,
            isSearchHide: false,
            just: true,
            createTimeRange: [],
            label: '操作时间',
            startTitle: '开始日期',
            endTitle: '结束日期'
          },
          {
            type: 'select',
            prop: 'result',
            conditionshow: true,
            filedShow: true,
            label: '运行结果',
            placeholder: '运行结果',
            optList: [{ label: '成功', value: 'success' }, { label: '失败', value: 'failure' }]
          },
          {
            type: 'input',
            prop: 'resultInfo',
            conditionshow: false,
            filedShow: true,
            label: '结果信息',
            placeholder: '结果信息',
            optList: []
          },
          {
            type: 'input',
            prop: 'error',
            conditionshow: false,
            filedShow: true,
            label: '错误信息',
            placeholder: '错误信息',
            optList: []
          }
        ]
      }
    }
  },
  async created() {
    this.getCodeQuery()
  },
  mounted() {
  },
  methods: {
    getCodeQuery() {
      var query = this.$route.query
      const code = query.code
      if (code) {
        this.$router.push({ query: {} })
        this.$set(this.datas.filterList[0], 'code', code)
      }
    },
    detail(row) {
      console.log(row)
    },
    getData(datas = this.datas) {
      if (datas.filterList[0].code === '') {
        this.$set(this.datas.params, 'code', null)
      }
      this.$set(this, 'datas', datas)
      this.$set(this, 'params', datas.params)
      this.$set(this.datas.table, 'loading', true)
      api.getPage(this.params).then(res => {
        this.$set(this.datas.resData, 'rows', res.model)
        this.$set(this.datas.params, 'currentPage', res.currentPage)
        this.$set(this.datas.params, 'pageSize', res.pageSize)
        this.$set(this.datas.resData, 'totalCount', res.totalCount)
        this.$set(this.datas.table, 'loading', false)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
