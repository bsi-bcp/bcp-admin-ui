<template>
  <div>
    <!-- //table 表格 -->
    <el-table
      ref="multipleTable"
      :data="tableData"
      max-height="380"
      class="mt10"
      :cell-style="{padding:'5px 0px'}" 
      highlight-current-row
      fit 
      style="width: 100%"
      @row-click = "rowClick"
      @current-change="handleSelectionChange"
      @row-dblclick = "handleSelection"
    >
      <!-- <el-table-column type="selection" width="55"> </el-table-column> -->
      <el-table-column  width="55">
　　　  <template slot-scope="scope">
　　　　　<el-radio :label="scope.row.name" v-model="radioId">&nbsp;</el-radio>
　　　  </template>
　　   </el-table-column>
      <el-table-column type="index" width="55"> </el-table-column>
      <el-table-column prop="name" align="center" label="模板名称">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import * as api from '@/api/addministrative'
export default {
  data() {
    return {
      tableData: [],
      modelData: null,
      FromData:{},
      radioId:'',
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
    modelShow(){

    },
    //表格单选按钮
    rowClick(row){
				this.radioId=row.name;
		},
    // 去除表头全选选项
    // cellClass(row){     
    //   if (row.columnIndex === 0) {           
    //     return 'disabledCheck'     
    //   } 
    // },
    getList() {
      api.getPage({"tenantId":this.$parent.$parent.cur_user.tenantId}).then((res) => {
        this.tableData = res
      })
    },
    handleSelection(val){
    console.log('this.FromData',val)
       this.$emit('templateData', val,2)
    },
    handleSelectionChange(val) {
      // if (selection.length === 1) {
        // this.modelData = selection[0]
        // 发送出去的
        this.$emit('templateData', val,1)
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

// 修改全选框文本内容，目前忽略
// ::v-deep .el-table .disabledCheck .cell::before {
//   content: '';
//   text-align: center;
//   line-height: 37px;
// }
</style>
