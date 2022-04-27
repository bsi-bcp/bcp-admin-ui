<template lang="html">
  <div class="app-container">
      <el-table
      :data="tableData"
      style="width: 100%"
      max-height="1024px"
      :header-cell-style="{background:'rgb(250 250 250)'}"
      :span-method="objectSpanMethod"
      header-align="center">
      <el-table-column align="left">
        <template slot="header">
          <span class="digitalFactory">集成ERP接口模块</span>
        </template>
      <el-table-column
        prop="type"
        label="系统分类"
        width="200px"
        align="center">
      </el-table-column>
      <el-table-column
        prop="business"
        label="系统厂商"
        width="300px"
        align="center">
        
      </el-table-column>

      <el-table-column
        prop="product"
        label="系统厂商产品"
        width="500px"
        align="center">
      </el-table-column>

      <el-table-column
        label="集成接口模块(含二开接口)"
        width="500px"
        align="center">
        <template slot-scope="scope"
        align="center">
          <el-button @click="handleClick(scope.row.link)" type="text" size="small">查看详情</el-button>
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
          type: "ERP",
          business: "金蝶",
          product: "K3",
          link: "https://kdocs.cn/l/cpCweQbqiUL0",
        },
        {
          type: "ERP",
          business: "金蝶",
          product: "K3C",
          link: "https://kdocs.cn/l/cu8kHGAozJcY",
        },
        {
          type: "ERP",
          business: "用友",
          product: "U8",
          link: "https://kdocs.cn/l/ckhaRj1miDoU",
        },
        {
          type: "ERP",
          business: "用友",
          product: "U9",
          link: "https://kdocs.cn/l/cd6q7T2XxUuU",
        },
        {
          type: "ERP",
          business: "用友",
          product: "NC",
          link: "https://kdocs.cn/l/cdDvnRDnRpq7",
        },
        {
          type: "ERP",
          business: "用友",
          product: "NCC",
          link: "https://kdocs.cn/l/cufht1H5VaBT",
        },
        {
          type: "ERP",
          business: "用友",
          product: "T+",
          link: "https://kdocs.cn/l/cmBaHIUgmUVj",
        },
        {
          type: "ERP",
          business: "SAP",
          product: "ECC",
          link: "https://kdocs.cn/l/cls2GgyUHDCG",
        },
        {
          type: "ERP",
          business: "SAP",
          product: "HANA S4/C",
          link: "https://kdocs.cn/l/ciONgxVVwFbi",
        },
        {
          type: "ERP",
          business: "SAP",
          product: "B1 on MSSQL",
          link: "https://kdocs.cn/l/ch90kxWx0N99",
        },
        {
          type: "ERP",
          business: "SAP",
          product: "B1 on HANA",
          link: "https://kdocs.cn/l/crFmVfKSitfa",
        },
        {
          type: "ERP",
          business: "鼎捷",
          product: "易成",
          link: "https://kdocs.cn/l/ciwYrvero5A2",
        },
        {
          type: "ERP",
          business: "鼎捷",
          product: "易飞",
          link: "https://kdocs.cn/l/cmU6UqNq9PNM",
        },
        {
          type: "ERP",
          business: "鼎捷",
          product: "E10",
          link: "https://kdocs.cn/l/ctpVXVRjMsE1",
        },
        {
          type: "ERP",
          business: "鼎捷",
          product: "TOP GP",
          link: "https://kdocs.cn/l/ccwEOIejhwh0",
        },
        {
          type: "ERP",
          business: "鼎捷",
          product: "T100",
          link: "https://kdocs.cn/l/ceVmIWKI5088",
        },
        {
          type: "ERP",
          business: "Oracle",
          product: "11i",
          link: "https://kdocs.cn/l/cdHU19v2PjiG",
        },
        {
          type: "ERP",
          business: "Oracle",
          product: "R12",
          link: "https://kdocs.cn/l/cfNFNnG8FiCI",
        },
        {
          type: "ERP",
          business: "其他ERP",
          product: "",
          link: "https://kdocs.cn/l/cikqECYgVz3s",
        },
      ],
      arr1: [],
      arr2: [],
    };
  },
  created() {
    this.getOrderNumber();
  },
  methods: {
    handleClick(row) {
      var el = document.createElement("a");
      document.body.appendChild(el);
      el.href = row; //url
      el.target = "_new"; //指定在新窗口打开
      el.click();
      document.body.removeChild(el);
    },
    // 获取编号相同的数组
    getOrderNumber() {
      const obj = {};
      const obj1 = {};
      this.tableData.forEach((item, idx) => {
        
        item.rowIndex = idx;
        let key = item.type + "|" + item.business;
        obj[key] = obj[key] || []
        obj[key].push(idx);
        
        obj1[item.type] = obj1[item.type] || [];
        obj1[item.type].push(idx);
      });
      // 找到需要合并的项
      Object.keys(obj).forEach((key) => {
        if (obj[key].length > 1) {
          this.arr1.push(obj[key]);
        }
      });
      // 找到需要合并的项
      Object.keys(obj1).forEach((key) => {
        if (obj1[key].length > 1) {
          this.arr2.push(obj1[key]);
        }
      });
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1) {
        for (let i = 0; i < this.arr1.length; i += 1) {
          let element = this.arr1[i];
          for (let j = 0; j < element.length; j += 1) {
            if (rowIndex === element[j]) {
              return j === 0
                ? { rowspan: element.length, colspan: 1 }
                : { rowspan: 0, colspan: 0 };
            }
          }
        }
      }
      if (columnIndex === 0) {
        for (let i = 0; i < this.arr2.length; i += 1) {
          let element = this.arr2[i];
          for (let j = 0; j < element.length; j += 1) {
            if (rowIndex === element[j]) {
              return j === 0
                ? { rowspan: element.length, colspan: 1 }
                : { rowspan: 0, colspan: 0 };
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

