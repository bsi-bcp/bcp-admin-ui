<template lang="html">
  <div class="app-container">
    <el-form ref="searchForm" :model="searchForm" label-width="100px" size="mini" inline-message label-position="top">
      <el-form-item>
        <el-date-picker
          v-model="searchForm.runTime"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right"
        />
        <el-input v-model="searchForm.taskId" size="mini" placeholder="请输入任务名称" maxlength="50" style="width: 200px;" />
        <el-button size="mini" @click="getData">搜索</el-button>
      </el-form-item>
    </el-form>
    <br>
    <div>
      <el-table :data="tableData" class="mt10" :cell-style="{padding:'10px 0px'}" :header-cell-style="{background:'#fafafa',color:'#606266',padding:'12px 0px','text-align':'center'}" fit
                highlight-current-row style="width: 100%" max-height="660" :default-sort="{ prop: 'validSize_sum', order: 'descending' }"
      >
        <el-table-column prop="index" label="序号" width="50">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="taskName" align="left" label="任务名称" width="400" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.taskName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="execType" align="center" label="运行方式">
          <template slot-scope="scope">
            <span>{{ scope.row.execType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="validSize_sum" align="right" label="总记录数(实例数*执行次数)" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.validSize_sum.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="successSize_sum" align="right" label="成功数(实例数*执行次数)" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.successSize_sum.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="failSize" align="right" label="失败数(实例数*执行次数)" sortable>
          <template slot-scope="scope">
            <span>{{ (Number(scope.row.validSize_sum || 0) - Number(scope.row.successSize_sum || 0)).toLocaleString() }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/taskStatistics'
import { mapGetters } from 'vuex'
import { formatDate } from '@/utils/date'

export default {
  data() {
    return {
      rowData: {
        id: null,
        name: null,
        code: null,
        type: null,
        remark: null
      },
      searchForm: {
        taskId: '', // 任务id
        runTime: [] // 允许时间段
      },
      tableData: []
    }
  },
  computed: {
    ...mapGetters([
      'cur_user'
    ])
  },
  async created() {
    this.initData()
    this.getData()
  },
  mounted() {
  },
  methods: {
    // 按字符串排序（字母顺序）
    sortByTaskName(a, b) {
      return a.taskName.localeCompare(b.taskName)
    },

    // 可选：监听排序变化
    handleSortChange({ column, prop, order }) {
    },
    input(data) {
    },
    inputByMenu() {
      this.subFormData.cron = null
    },
    inputByCustom() {
      this.subFormData.cron = null
    }, // 初始化日期默认值，默认当天
    initData() {
      this.searchForm.runTime = []
      const curDate = new Date()
      const pattern = 'yyyy-MM-dd 00:00:00'
      const startDate = formatDate(curDate, pattern)
      const endDate = formatDate(curDate, 'yyyy-MM-dd 23:59:59')
      this.searchForm.runTime.push(startDate)
      this.searchForm.runTime.push(endDate)
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
    }, getData() {
      if (this.searchForm.runTime == null || this.searchForm.runTime.length < 2) {
        this.$message.error('请选择开始结束日期')
        return
      }
      api.getTaskStatistics(this.searchForm).then((res) => {
        this.tableData = res
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
