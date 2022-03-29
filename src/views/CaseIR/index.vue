<template lang="html">
  <div class="app-container">
      <el-table
      :data="tableData"
      style="width: 100%"
      :header-cell-style="{background:'rgb(250 250 250)'}"
      :span-method="objectSpanMethod"
      header-align="center">
      <el-table-column align="left">
        <template slot="header">
          <a @click="seeDetail" class="digitalFactory">集成场景需求</a>
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
          type: "SRM",
          business: "甄云",
          system: "K3",
          link: "https://www.kdocs.cn/l/cfE8hRgT2gWC"
        },
          {
          type: "SRM",
          business: "甄云",
          system: "K3C",
          link: "https://www.kdocs.cn/l/cblSU13JgYaE"
        },
         {
          type: "SRM",
          business: "甄云",
          system: "NCC",
          link: "https://www.kdocs.cn/l/cfWGO5Jrjvje"
        },
        {
          type: "SRM",
          business: "甄云",
          system: "U8",
          link: "https://docs.qq.com/sheet/DT1lhTmNReHplbVZq?tab=BB08J3"
        },
        
        {
          type: "MES",
          business: "黑湖",
          system: "K3C",
          link: "https://www.kdocs.cn/l/ceY9QScUrUc5"
        },
        {
          type: "MES",
          business: "语桢",
          system: "优时",
          link: "https://kdocs.cn/l/cl5aF6JjF0LS"
        },
        {
          type: "MES",
          business: "语桢",
          system: "易飞",
          link: "https://kdocs.cn/l/ceofBYQioRLZ"
        },
        {
          type: "MES",
          business: "鼎捷",
          system: "NC",
          link: "https://kdocs.cn/l/cdmVewGi27d0"
        },
        {
          type: "MES",
          business: "甄一",
          system: "SAP",
          link: "https://kdocs.cn/l/caCpgmILVRsW"
        },
         {
          type: "MES",
          business: "智引",
          system: "U9",
          link: "https://kdocs.cn/l/cqtYZyIz7dPw"
        },
        {
          type: "MES",
          business: "中科晟达",
          system: "U8",
          link: "https://kdocs.cn/l/cbvMhiPrDJEU"
        },


        {
          type: "OA",
          business: "泛微",
          system: "SAP",
          link: "https://www.kdocs.cn/l/coFuhJcQdrvD"
        },

        {
          type: "CRM",
          business: "纷享销客",
          system: "K3C",
          link: "https://www.kdocs.cn/l/cu052Bc7ZzLh"
        },

        {
          type: "IoT",
          business: "盛源成",
          system: "SAP",
          link: "https://kdocs.cn/l/clzJwEyaHOMd"
        },

        {
          type: "数字工厂",
          business: "华为",
          system: "优时",
          link: "https://kdocs.cn/l/cl5aF6JjF0LS"
        },

        {
          type: "BI",
          business: "永洪",
          system: "SAP",
          link: "https://docs.qq.com/sheet/DVWNrVnpnRGxBcEdS?tab=BB08J2"
        },

        {
          type: "AppCube",
          business: "华为",
          system: "SAP",
          link: "https://kdocs.cn/l/cqjvAcCgRAhG"
        },
        
      ],
      arr1:[],
      arr2:[]
    };
  },
  created() {
    this.getOrderNumber()
  },
  methods: {
    handleClick(row) {
      var el = document.createElement("a");
      document.body.appendChild(el);
      el.href = row.link; //url 
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
    },
     // 获取编号相同的数组
    getOrderNumber(){
      const obj = {}
      const obj1 = {}
      this.tableData.forEach((item,idx)=>{
        item.rowIndex = idx;
        let key = item.type+"|"+item.business
        if(obj[key]){
          obj[key].push(idx); 
        }
        else{
          obj[key] = []
          obj[key].push(idx);
        }
        
        if(obj1[item.type]){
          obj1[item.type].push(idx)
        }else{
          obj1[item.type] = []
          obj1[item.type].push(idx);
        }
      })
      // 找到需要合并的项
      Object.keys(obj).forEach((key)=>{
        if(obj[key].length>1){
          this.arr1.push(obj[key])
        }
      })
       // 找到需要合并的项
      Object.keys(obj1).forEach((key)=>{
        if(obj1[key].length>1){
          this.arr2.push(obj1[key])
        }
      })
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
       if (columnIndex === 1) {
         for (let i = 0; i < this.arr1.length; i += 1) {
           let element = this.arr1[i];
           for (let j = 0; j < element.length; j += 1) {
             let item = element[j];
             if (rowIndex === item) {
               if (j === 0) {
                 return {
                   rowspan: element.length,
                   colspan: 1,
                 };
               }
               if (j !== 0) {
                 return {
                   rowspan: 0,
                   colspan: 0,
                 };
               }
             }
           }
         }
       }
       if (columnIndex === 0) {
         for (let i = 0; i < this.arr2.length; i += 1) {
           let element = this.arr2[i];
           for (let j = 0; j < element.length; j += 1) {
             let item = element[j];
             if (rowIndex === item) {
               if (j === 0) {
                 return {
                   rowspan: element.length,
                   colspan: 1,
                 };
               }
               if (j !== 0) {
                 return {
                   rowspan: 0,
                   colspan: 0,
                 };
               }
             }
           }
         }
       }
       
     },   
   
  },
};
</script>

<style lang="scss" scoped>
  .digitalFactory{
    font: 2em sans-serif;
  }
</style>

