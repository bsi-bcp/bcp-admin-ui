<template>
  <div>
    <!-- //table 表格 -->
    <el-table
      ref="multipleTable"
      :data="tableData"
      class="mt10" :cell-style="{padding:'5px 0px'}" :header-cell-style="{background:'#fafafa',color:'#606266',padding:'0px 0px'}" fit highlight-current-row style="width: 100%"
      @select="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
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
        @current-change="handleCurrentChange"
        :current-page="setData.currentPage"
        :page-sizes="[10, 20, 30]"
        :page-size="setData.pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import * as api from "@/api/addministrative";
export default {
  data() {
    return {
      tableData: [],
      modelData: null,
      total: null,
      setData: {
        currentPage: 1,
        pageSize: 10,
      }
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      api.getPage({ ...this.setData }).then((res) => {
        this.tableData = res.model
        this.total = res.totalPage
      });
    },
    handleSelectionChange(selection) {
      if (selection.length == 1) {
        this.modelData = selection[0]
        //发送出去的
        this.$emit("templateData", this.modelData)
      }
      if (selection.length > 1) {
        let arr = selection
        let del_row = arr.shift()
        this.modelData = arr[0]
        this.$emit("templateData", this.modelData)
        this.$refs.multipleTable.toggleRowSelection(del_row, false)
      }
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
</style>
