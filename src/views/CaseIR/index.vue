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
          <span class="digitalFactory">集成场景模板</span>
        </template>
      <el-table-column
        prop="type"
        label="业务系统分类"
        width="200px"
        align="center">
      </el-table-column>
      <el-table-column
        prop="business"
        label="业务系统厂商"
        width="300px"
        align="center">
        
      </el-table-column>

      <el-table-column
        prop="system"
        label="集成系统"
        width="500px"
        align="center">
      </el-table-column>

      <el-table-column
        label="文档链接"
        width="500px"
        align="center">
        <template slot-scope="scope"
        align="center">
          <el-button @click="handleClick(scope.row.link)" type="text" size="small">场景模板</el-button>
          <el-button @click="handleClick(scope.row.guide)" type="text" size="small">联调指引</el-button>
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
          type: "SRM",
          business: "甄云",
          system: "K3",
          link: "https://www.kdocs.cn/l/cfE8hRgT2gWC",
          guide: "https://kdocs.cn/l/cfuCzBANMPG2",
        },
        {
          type: "SRM",
          business: "甄云",
          system: "K3C",
          link: "https://www.kdocs.cn/l/cblSU13JgYaE",
          guide: "https://kdocs.cn/l/cg8BSZ4W89gB",
        },
        {
          type: "SRM",
          business: "甄云",
          system: "NCC",
          link: "https://www.kdocs.cn/l/cfWGO5Jrjvje",
          guide: "https://kdocs.cn/l/cltK4nt9jt7b",
        },
        {
          type: "SRM",
          business: "甄云",
          system: "U8",
          link: "https://docs.qq.com/sheet/DT1lhTmNReHplbVZq?tab=BB08J3",
          guide: "https://kdocs.cn/l/ci6aKuveXdaA",
        },
        {
          type: "SRM",
          business: "甄云",
          system: "SAP ECC",
          link: "https://kdocs.cn/l/clBWdud4uP4c",
          guide: "https://kdocs.cn/l/cvjtTcCsJFV5",
        },
        {
          type: "SRM",
          business: "甄云",
          system: "SAP HANA S4/C",
          link: "https://kdocs.cn/l/cpH7MPIa8pz4",
          guide: "https://kdocs.cn/l/curIUb2PCvc2",
        },
        {
          type: "SRM",
          business: "甄云",
          system: "SAP B1",
          link: "https://kdocs.cn/l/ccOVZj0M6ft6",
          guide: "https://kdocs.cn/l/cnxqQghpoGBj",
        },
        {
          type: "MES",
          business: "黑湖",
          system: "K3C",
          link: "https://www.kdocs.cn/l/ceY9QScUrUc5",
          guide: "https://kdocs.cn/l/ctWTm7Y6gL6X",
        },
        {
          type: "MES",
          business: "语祯",
          system: "优时",
          link: "https://kdocs.cn/l/cl5aF6JjF0LS",
          guide: "https://kdocs.cn/l/cf8nzjwzVspo",
        },
        {
          type: "MES",
          business: "语祯",
          system: "易飞",
          link: "https://kdocs.cn/l/ceofBYQioRLZ",
          guide: "https://kdocs.cn/l/cv1FBCJzXAeN",
        },
        {
          type: "MES",
          business: "鼎捷",
          system: "NC",
          link: "https://kdocs.cn/l/cdmVewGi27d0",
          guide: "https://kdocs.cn/l/cqmLcetxU9uu",
        },
         {
          type: "MES",
          business: "鼎捷",
          system: "K3C",
          link: "https://kdocs.cn/l/cdisF3opU7TZ",
          guide: "https://kdocs.cn/l/ciCKCt0LerK0",
        },
         {
          type: "MES",
          business: "鼎捷",
          system: "K3Wise",
          link: "https://kdocs.cn/l/ct0Td4RFj3kL",
          guide: "https://kdocs.cn/l/crBz7ncHWGTB",
        },
        {
          type: "MES",
          business: "甄一",
          system: "SAP",
          link: "https://kdocs.cn/l/caCpgmILVRsW",
          guide: "https://kdocs.cn/l/cdehWkm6W4Eq",
        },
        {
          type: "MES",
          business: "智引",
          system: "U9",
          link: "https://kdocs.cn/l/cqtYZyIz7dPw",
          guide: "https://kdocs.cn/l/cpFSvlpSORKP",
        },
        {
          type: "MES",
          business: "中科",
          system: "U8",
          link: "https://kdocs.cn/l/cbvMhiPrDJEU",
          guide: "https://kdocs.cn/l/clmvWL9q4Dww",
        },
        {
          type: "MES",
          business: "树根互联",
          system: "SAP B1 on MSSQL",
          link: "https://kdocs.cn/l/co728nkzzvRB",
          guide: "https://kdocs.cn/l/cdQc8NtpbVJd",
        },
        {
          type: "MES",
          business: "万腾MES",
          system: "U8",
          link: "https://kdocs.cn/l/cnYZbuda6QFa",
          guide: "https://kdocs.cn/l/cpPJAroyUMoW",
        },
        {
          type: "MES",
          business: "赛瀚德",
          system: "T+",
          link: "https://kdocs.cn/l/cqa2yBVVAiNb",
          guide: "https://kdocs.cn/l/cokSbbFGDHZ8",
        },
        {
          type: "OA",
          business: "泛微",
          system: "SAP",
          link: "https://www.kdocs.cn/l/coFuhJcQdrvD",
          guide: "https://kdocs.cn/l/cj1gfJEx8as7",
        },
        {
          type: "OA",
          business: "泛微",
          system: "K3C",
          link: "https://kdocs.cn/l/cqCPBTmgwWmp",
          guide: "https://kdocs.cn/l/cbLV5y5uhSlE",
        },
        {
          type: "CRM",
          business: "纷享销客",
          system: "K3C",
          link: "https://www.kdocs.cn/l/cu052Bc7ZzLh",
          guide: "https://kdocs.cn/l/ckPIFe8EuLgg",
        },
        {
          type: "PLM",
          business: "数码大方",
          system: "U8",
          link: "https://kdocs.cn/l/cvW2V4maqjhj",
          guide: "https://kdocs.cn/l/cqDNTmtaOUV8",
        },
        {
          type: "PLM",
          business: "数码大方",
          system: "K3C",
          link: "https://kdocs.cn/l/ca1atCwRPcHw",
          guide: "https://kdocs.cn/l/cdbpzmC5gFjw",
        },
        {
          type: "PLM",
          business: "山东华天",
          system: "SAP ECC",
          link: "https://kdocs.cn/l/cp9TZObuYe5E",
          guide: "https://kdocs.cn/l/cdyY2czu5P6x",
        },
        {
          type: "跨境电商",
          business: "赛盒",
          system: "T+",
          link: "https://kdocs.cn/l/csfwIZzDqser",
          guide: "https://kdocs.cn/l/cdkpCReL6JbK",
        },
        {
          type: "IoT",
          business: "盛源成",
          system: "SAP",
          link: "https://kdocs.cn/l/clzJwEyaHOMd",
          guide: "https://kdocs.cn/l/ciKnRp3wqT7C",
        },
        {
          type: "数字工厂",
          business: "华为",
          system: "优时",
          link: "https://kdocs.cn/l/cl5aF6JjF0LS",
          guide: "https://kdocs.cn/l/ccn03HQve8Em",
        },
        {
          type: "BI",
          business: "帆软",
          system: "SAP",
          link: "https://docs.qq.com/sheet/DVWNrVnpnRGxBcEdS?tab=BB08J2",
          guide: "https://kdocs.cn/l/cqjKGQFGvNxE",
        },
        {
          type: "APPCube",
          business: "华为",
          system: "SAP",
          link: "https://kdocs.cn/l/cqjvAcCgRAhG",
          guide: "https://kdocs.cn/l/ciiZhpfLo9iC",
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