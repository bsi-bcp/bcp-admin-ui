<template lang="html">
  <div class="app-container">
    
    <el-table
      :data="tableData"
      style="width: 100%"
      :header-cell-style="{background:'rgb(250 250 250)'}"
      :span-method="objectSpanMethod"
      header-align="center">
      <el-table-column align="center">
        <template slot="header">
          <span class="digitalFactory">文档</span>
        </template>
      <el-table-column
        prop="type"
        label="文档类型"
        width="300px"
        align="center">
      </el-table-column>
      <el-table-column
        prop="explain"
        label="环境说明"
        width="200px"
        align="center">
      </el-table-column>
      <el-table-column
        prop="link"
        label="文档链接"
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
          type: "系统安装",
          explain: "centos安装",
          link: "https://kdocs.cn/l/cbkmxetfZcFI",
        },
        {
          type: "BCP部署",
          explain: "有IoT",
          link: "https://kdocs.cn/l/ckwDzAAWKhYv",
        },
        {
          type: "BCP部署",
          explain: "无IoT",
          link: "https://kdocs.cn/l/cdCC2Dogqrl1",
        },
        {
          type: "日志部署",
          explain: "有IoT",
          link: "https://kdocs.cn/l/cqeF3g795Xxg",
        },
        {
          type: "日志部署",
          explain: "无IoT",
          link: "https://kdocs.cn/l/ckMb7POnjk2h",
        },{
          type: "开发文档",
          explain: "开发指导文档",
          link: "https://kdocs.cn/l/cd4WRME4V9cc",
        },
      ],
      arr: [],
    };
  },
  created() {
    this.getOrderNumber();
  },

  methods: {
    handleClick(row) {
      var el = document.createElement("a");
      document.body.appendChild(el);
      el.href = row.link; //url
      el.target = "_new"; //指定在新窗口打开
      el.click();
      document.body.removeChild(el);
    },

    // 获取编号相同的数组
    getOrderNumber() {
      if (this.tableData < 0) {
        return;
      }
      const obj = {};
      this.tableData.forEach((item, idx) => {
        item.rowIndex = idx;
        let key = item.type;
        obj[key] = obj[key] || [];
        obj[key].push(idx);
      });
      // 找到需要合并的项
      Object.keys(obj).forEach((key) => {
        if (obj[key].length > 1) {
          this.arr.push(obj[key]);
        }
      });
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        for (let i = 0; i < this.arr.length; i += 1) {
          let element = this.arr[i];
          for (let j = 0; j < element.length; j += 1) {
            let item = element[j];
            if (rowIndex === item) {
              return j === 0
                ? {
                    rowspan: element.length,
                    colspan: 1,
                  }
                : {
                    rowspan: 0,
                    colspan: 0,
                  };
            }
          }
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.digitalFactory {
  font: 2em sans-serif;
}
</style>

