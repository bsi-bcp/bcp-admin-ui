<template>
  <div>
    <!-- //table 表格 -->
    <el-table
      ref="multipleTable"
      :data="tableData"
      class="mt10"
      :cell-style="{padding:'5px 0px'}" 
      highlight-current-row
      fit 
      style="width: 100%"
      @current-change="handleSelectionChange"
    >
      <!-- <el-table-column type="selection" width="55"> </el-table-column> -->
      <el-table-column type="index" width="55"> </el-table-column>
      <el-table-column prop="name" align="center" label="模板名称">
      </el-table-column>
    </el-table>
    <!-- //slot  name  ==>typeData  具名插槽-->
    <slot name="typeData" />
    <div class="pagination">
      <el-pagination
        background
        @size-change="handleSizeChange"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="handleCurrentChange"
        :current-page="setData.currentPage"
        :page-sizes="[10, 20, 30]"
        :page-size="setData.pageSize"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/addministrative'
export default {
  data() {
    return {
      tableData: [],
      modelData: null,
      total: null,
      setData: {
        currentPage: 1,
        pageSize: 10
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    // 去除表头全选选项
    // cellClass(row){     
    //   if (row.columnIndex === 0) {           
    //     return 'disabledCheck'     
    //   } 
    // },
    getList() {
      api.getPage({ ...this.setData }).then((res) => {
        this.tableData = res.model
        this.total = res.totalPage
      })
    },
    handleSelectionChange(val) {
      // if (selection.length === 1) {
        // this.modelData = selection[0]
        // 发送出去的
        this.$emit('templateData', val)
      // }
    //   if (selection.length > 1) {
    //     const arr = selection
    //     const del_row = arr.shift()
    //     this.modelData = arr[0]
    //     this.$emit('templateData', this.modelData)
    //     this.$refs.multipleTable.toggleRowSelection(del_row, false)
    //   }
    },
    handleSizeChange(val) {
      this.setData.pageSize = val
      this.setData.currentPage = 1
      this.getList()
    },
    handleCurrentChange(val) {
      this.setData.currentPage = val
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.pagination {
  text-align: right;
}
// //去掉全选按钮
// ::v-deep .el-table .disabledCheck .cell .el-checkbox__inner {
//   display: none !important;
// }

// // 修改全选框文本内容，目前忽略
// ::v-deep .el-table .disabledCheck .cell::before {
//   content: '';
//   text-align: center;
//   line-height: 37px;
// }
</style>
