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
          <span class="digitalFactory">集成系统接口模块</span>
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
          type: "MES",
          business: "黑湖",
          product: "黑湖MES",
          link: "https://kdocs.cn/l/cui5yzDXOaul",
        },
        {
          type: "MES",
          business: "语祯",
          product: "语祯MES",
          link: "https://kdocs.cn/l/ccUHt9454wpW",
        },
        {
          type: "MES",
          business: "鼎捷",
          product: "鼎捷MES",
          link: "https://kdocs.cn/l/cflSXs6VubK7",
        },
        {
          type: "MES",
          business: "甄一",
          product: "甄一MES",
          link: "https://kdocs.cn/l/cvO9KeFJsAYl",
        },
        {
          type: "MES",
          business: "智引",
          product: "智引MES",
          link: "https://kdocs.cn/l/clp3BNJSb0Bo",
        },
        {
          type: "MES",
          business: "中科",
          product: "中科MES",
          link: "https://kdocs.cn/l/ct1IpDzmG3XV",
        },
        {
          type: "MES",
          business: "万腾",
          product: "万腾MES",
          link: "https://kdocs.cn/l/cnJszJJv60Z3",
        },
        {
          type: "MES",
          business: "树根互联",
          product: "树根互联MES",
          link: "https://kdocs.cn/l/cbInjfSP6vO0",
        },
        {
          type: "MES",
          business: "赛瀚德",
          product: "赛瀚德MES",
          link: "https://kdocs.cn/l/cppa1eaJCQuw",
        },
        {
          type: "SRM",
          business: "甄云",
          product: "甄云SRM",
          link: "https://kdocs.cn/l/crx9uFfCxP8D",
        },
        {
          type: "OA",
          business: "泛微",
          product: "泛微OA",
          link: "https://kdocs.cn/l/cnjg7xXr4yHA",
        },
        {
          type: "OA",
          business: "致远",
          product: "致远OA",
          link: "https://kdocs.cn/l/cdEwcQLckzNa",
        },
        {
          type: "OA",
          business: "钉钉",
          product: "钉钉OA",
          link: "https://kdocs.cn/l/cb6NlVFJ12Lw",
        },
        {
          type: "CRM",
          business: "纷享销客",
          product: "纷享销客CRM",
          link: "https://kdocs.cn/l/cm57Vr2uBdQL",
        },
        {
          type: "PLM",
          business: "数码大方",
          product: "数码大方PLM",
          link: "https://kdocs.cn/l/ckm8VJe4ybr1",
        },
        {
          type: "PLM",
          business: "华天",
          product: "华天PLM",
          link: "https://kdocs.cn/l/caEgJHaPlM9w",
        },
        {
          type: "PLM",
          business: "思普",
          product: "思普PLM",
          link: "https://kdocs.cn/l/csL8dQFHew5M",
        },
        {
          type: "PLM",
          business: "PTC",
          product: "Windchill",
          link: "https://kdocs.cn/l/ch567CTwTzh2",
        },
        {
          type: "PLM",
          business: "西门子",
          product: "西门子PLM",
          link: "https://kdocs.cn/l/ccwap8LsDECJ",
        },
        {
          type: "IoT",
          business: "盛原成",
          product: "盛原成IoT",
          link: "https://kdocs.cn/l/cjoMLXRRcJBe",
        },
        {
          type: "IoT",
          business: "树根互联",
          product: "树根互联IoT",
          link: "https://kdocs.cn/l/cu88ctZeyagK",
        },
        {
          type: "电商平台",
          business: "赛盒",
          product: "赛盒电商ERP",
          link: "https://kdocs.cn/l/ciaFHEL6L2mP",
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

