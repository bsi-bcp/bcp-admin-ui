<template lang="html">
  <div class="app-container">
    
    <el-table
      :data="tableData"
      style="width: 100%"
      :header-cell-style="{background:'rgb(250 250 250)'}"
      header-align="center">
      <el-table-column align="center">
        <template slot="header">
          <a @click="seeDetail" >查看详情</a>
        </template>
      <el-table-column
        prop="code"
        label="序号"
        width="100px"
        align="center">
      </el-table-column>
      <el-table-column
        prop="name"
        label="名称"
        width="500px">
        <template slot-scope="scope">
          <a :href="scope.row.url" target="_blank" class="buttonText" >{{scope.row.name}}</a>
        </template>
      </el-table-column>
      <el-table-column
        prop="operation"
        label="操作"
        width="500px"
        align="center">
        <template slot-scope="scope"
        align="center">
          <el-button @click="handleClick(scope.row)" type="text" size="small">查看详情</el-button>
        </template>
      </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        {
          code: "1",
          name: "部门-基础资料-主数据",
          url:"https://docs.qq.com/sheet/DVXRqaVZhSHJpclJJ?tab=BB08J3"
        },
        {
          code: "2",
          name: "人员-基础资料-主数据",
          url:"https://docs.qq.com/sheet/DVXRqaVZhSHJpclJJ?tab=BB08J4"
        },
        {
          code: "3",
          name: "物料-基础资料-主数据",
          url:"https://docs.qq.com/sheet/DVXRqaVZhSHJpclJJ?tab=BB08J5"
        },
        {
          code: "4",
          name: "工单(生产计划)-生产管理-主数据",
          url:"https://docs.qq.com/sheet/DVXRqaVZhSHJpclJJ?tab=BB08J6"
        },
        {
          code: "5",
          name: "销售订单-生产管理-主数据",
          url:"https://docs.qq.com/sheet/DVXRqaVZhSHJpclJJ?tab=BB08J7"
        },
      ],
    };
  },
  mounted() {},
  methods: {
    handleClick(row) {
      var el = document.createElement("a");
      document.body.appendChild(el);
      el.href = row.url; //url 
      el.target = '_new'; //指定在新窗口打开
      el.click();
      document.body.removeChild(el);
    },
    seeDetail(){
      var el = document.createElement("a");
      document.body.appendChild(el);
      el.href = "https://docs.qq.com/sheet/DVXRqaVZhSHJpclJJ?tab=BB08J2"; //url 是你得到的连接
      el.target = '_blank'; //指定在新窗口打开
      el.click();
      document.body.removeChild(el);
    }
  },
};
</script>

<style lang="scss" scoped>
</style>

