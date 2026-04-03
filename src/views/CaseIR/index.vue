<template lang="html">
  <div class="app-container">
    <el-table
      :data="tableData"
      style="width: 100%"
      max-height="1024px"
      :header-cell-style="{background:'rgb(250 250 250)'}"
      :span-method="objectSpanMethod"
      header-align="center"
    >
      <el-table-column align="left">
        <template slot="header">
          <span class="digitalFactory">集成场景模板</span>
        </template>
        <el-table-column
          prop="type"
          label="业务系统分类"
          width="200px"
          align="center"
        />
        <el-table-column
          prop="business"
          label="业务系统厂商"
          width="300px"
          align="center"
        />

        <el-table-column
          prop="system"
          label="集成系统"
          width="500px"
          align="center"
        />

        <el-table-column
          label="文档链接"
          width="500px"
          align="center"
        >
          <template slot-scope="scope"
                    align="center"
          >
            <el-button type="text" size="small" @click="handleClick(scope.row.link)">场景模板</el-button>
          <!--<el-button @click="handleClick(scope.row.guide)" type="text" size="small">联调指引</el-button>-->
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
          'type': 'SRM',
          'business': '甄云',
          'system': '金蝶K3',
          'link': 'https://www.kdocs.cn/l/cfE8hRgT2gWC'
        },
        {
          'type': 'SRM',
          'business': '甄云',
          'system': '金蝶K3C',
          'link': 'https://docs.qq.com/sheet/DY09HbXJObkh5eWNP?tab=e4ymbr'
        },
        {
          'type': 'SRM',
          'business': '甄云',
          'system': '鼎捷E10',
          'link': 'https://docs.qq.com/sheet/DRWpIa0VXalpQRFFF?tab=fysejp'
        },
        {
          'type': 'SRM',
          'business': '甄云',
          'system': '用友NCC',
          'link': 'https://www.kdocs.cn/l/cfWGO5Jrjvje'
        },
        {
          'type': 'SRM',
          'business': '甄云',
          'system': '用友U8',
          'link': 'https://docs.qq.com/sheet/DT1lhTmNReHplbVZq?tab=BB08J3'
        },
        {
          'type': 'SRM',
          'business': '甄云',
          'system': 'SAP ECC',
          'link': 'https://kdocs.cn/l/clBWdud4uP4c'
        },
        {
          'type': 'SRM',
          'business': '甄云',
          'system': 'SAP HANA S4/C',
          'link': 'https://kdocs.cn/l/cpH7MPIa8pz4'
        },
        {
          'type': 'SRM',
          'business': '甄云',
          'system': 'SAP B1',
          'link': 'https://kdocs.cn/l/ccOVZj0M6ft6'
        },
        {
          'type': 'MES',
          'business': '黑湖',
          'system': '金蝶K3C',
          'link': 'https://www.kdocs.cn/l/ceY9QScUrUc5'
        },
        {
          'type': 'MES',
          'business': '黑湖',
          'system': '用友U8',
          'link': 'https://www.kdocs.cn/l/csUEgxhocTnr'
        },
        {
          'type': 'MES',
          'business': '黑湖',
          'system': '鼎捷E10',
          'link': 'https://www.kdocs.cn/l/ccl9N3TPnyOk'
        },
        {
          'type': 'MES',
          'business': '语祯',
          'system': '优时',
          'link': 'https://kdocs.cn/l/cl5aF6JjF0LS'
        },
        {
          'type': 'MES',
          'business': '语祯',
          'system': '金蝶K3',
          'link': 'https://kdocs.cn/l/chn5qOhPu2by'
        },
        {
          'type': 'MES',
          'business': '语祯',
          'system': '鼎捷易飞',
          'link': 'https://kdocs.cn/l/caR8Vyw9pBmp'
        },
        {
          'type': 'MES',
          'business': '鼎捷',
          'system': '用友NC',
          'link': 'https://kdocs.cn/l/cdmVewGi27d0'
        },
        {
          'type': 'MES',
          'business': '鼎捷',
          'system': '金蝶K3C',
          'link': 'https://kdocs.cn/l/cdisF3opU7TZ'
        },
        {
          'type': 'MES',
          'business': '鼎捷',
          'system': '金蝶K3Wise',
          'link': 'https://kdocs.cn/l/ct0Td4RFj3kL'
        },
        {
          'type': 'MES',
          'business': '甄一',
          'system': 'SAP',
          'link': 'https://www.kdocs.cn/l/cuAaTszz1Aib'
        },
        {
          'type': 'MES',
          'business': '智引',
          'system': '用友U9',
          'link': 'https://kdocs.cn/l/cqtYZyIz7dPw'
        },
        {
          'type': 'MES',
          'business': '中科',
          'system': '用友U8',
          'link': 'https://kdocs.cn/l/cbvMhiPrDJEU'
        },
        {
          'type': 'MES',
          'business': '树根互联',
          'system': 'SAP B1 on MSSQL',
          'link': 'https://kdocs.cn/l/co728nkzzvRB'
        },
        {
          'type': 'MES',
          'business': '万腾',
          'system': '用友U8',
          'link': 'https://kdocs.cn/l/cnYZbuda6QFa'
        },
        {
          'type': 'MES',
          'business': '博伊特',
          'system': '浪潮',
          'link': 'https://www.kdocs.cn/l/ckvxqCsU1SCM'
        },
        {
          'type': 'MES',
          'business': '益模',
          'system': '用友U8',
          'link': 'https://www.kdocs.cn/l/ct9VFij4J5uL'
        },
        {
          'type': 'MES',
          'business': '赛瀚德',
          'system': '用友畅捷通T+',
          'link': 'https://kdocs.cn/l/cqa2yBVVAiNb'
        },
        {
          'type': 'MES',
          'business': '赛瀚德',
          'system': '天心',
          'link': 'https://www.kdocs.cn/l/cdc3VyHTIy21'
        },
        {
          'type': 'MES',
          'business': '赛瀚德',
          'system': '东信达',
          'link': 'https://www.kdocs.cn/l/corBnHEBmLeJ'
        },
        {
          'type': 'MES',
          'business': '赛瀚德',
          'system': '金蝶K3Wise',
          'link': 'https://kdocs.cn/l/csFnunTDTXAM'
        },
        {
          'type': 'MES',
          'business': '赛瀚德',
          'system': '用友U9',
          'link': 'https://kdocs.cn/l/cq8pWVZWtI3d'
        },
        {
          'type': 'OA',
          'business': '泛微',
          'system': 'SAP',
          'link': 'https://www.kdocs.cn/l/coFuhJcQdrvD'
        },
        {
          'type': 'OA',
          'business': '泛微',
          'system': 'SAP B1',
          'link': 'https://www.kdocs.cn/l/ccOVZj0M6ft6'
        },
        {
          'type': 'OA',
          'business': '泛微',
          'system': '用友NC',
          'link': 'https://docs.qq.com/sheet/DYkhLbmFESUFLR1pX?tab=pprqj1&_t=1673832900470'
        },
        {
          'type': 'OA',
          'business': '泛微',
          'system': '金蝶K3C',
          'link': 'https://kdocs.cn/l/cqCPBTmgwWmp'
        },
        {
          'type': 'OA',
          'business': '泛微',
          'system': '金蝶K3C',
          'link': 'https://www.kdocs.cn/l/cpGauqNkq6Ct'
        },
        {
          'type': 'OA',
          'business': '泛微',
          'system': '鼎捷E10',
          'link': 'https://docs.qq.com/sheet/DRWpIa0VXalpQRFFF?tab=fysejp'
        },
        {
          'type': 'OA',
          'business': '泛微',
          'system': '甄云SRM',
          'link': 'https://www.kdocs.cn/l/cgbchnUzU3b6'
        },
        {
          'type': 'OA',
          'business': '致远',
          'system': '用友NC',
          'link': 'https://kdocs.cn/l/clQpFwe7L8u2'
        },
        {
          'type': 'OA',
          'business': '致远',
          'system': '用友U9',
          'link': 'https://www.kdocs.cn/l/cc74nOKpTrR0'
        },
        {
          'type': 'OA',
          'business': '蓝凌',
          'system': '鼎捷E10',
          'link': 'https://www.kdocs.cn/l/csDva11xxDeM'
        },
        {
          'type': '慧通差旅',
          'business': '华为',
          'system': '企业微信',
          'link': 'https://www.kdocs.cn/l/cvWDAZ2CRsw7'
        },
        {
          'type': '慧通差旅',
          'business': '华为',
          'system': '飞书',
          'link': 'https://www.kdocs.cn/l/cbhk21aql3QJ'
        },
        {
          'type': '慧通差旅',
          'business': '华为',
          'system': '红帆',
          'link': 'https://www.kdocs.cn/l/camArbtLfomz'
        },
        {
          'type': '慧通差旅',
          'business': '华为',
          'system': '鼎捷E10',
          'link': 'https://kdocs.cn/l/cs0Eh4pD18Qu'
        },
        {
          'type': 'APPCube',
          'business': '华为',
          'system': 'SAP',
          'link': 'https://kdocs.cn/l/cqjvAcCgRAhG'
        },
        {
          'type': '工单宝',
          'business': '华为',
          'system': '金蝶K3C',
          'link': 'https://www.kdocs.cn/l/csN5ACl1JYK9'
        },
        {
          'type': 'CRM',
          'business': '纷享销客',
          'system': '金蝶K3C',
          'link': 'https://www.kdocs.cn/l/csN5ACl1JYK9'
        },
        {
          'type': 'CRM',
          'business': '纷享销客',
          'system': '用友NC',
          'link': 'https://docs.qq.com/sheet/DYklleWJqTWVUeVdw?tab=pc4kov'
        },
        {
          'type': 'PLM',
          'business': '数码大方',
          'system': '用友U8',
          'link': 'https://kdocs.cn/l/cvW2V4maqjhj'
        },
        {
          'type': 'PLM',
          'business': '数码大方',
          'system': '金蝶K3C',
          'link': 'https://kdocs.cn/l/ca1atCwRPcHw'
        },
        {
          'type': 'PLM',
          'business': '山东华天',
          'system': 'SAP ECC',
          'link': 'https://kdocs.cn/l/cp9TZObuYe5E'
        },
        {
          'type': '跨境电商',
          'business': '赛盒',
          'system': '用友畅捷通T+',
          'link': 'https://kdocs.cn/l/csfwIZzDqser'
        },
        {
          'type': 'IoT',
          'business': '盛源成',
          'system': 'SAP',
          'link': 'https://kdocs.cn/l/clzJwEyaHOMd'
        },
        {
          'type': 'IoT',
          'business': '工业物联',
          'system': 'Kafka',
          'link': 'https://www.kdocs.cn/l/cqN2LF94WwuJ'
        },
        {
          'type': '数字工厂',
          'business': '华为',
          'system': '优时',
          'link': 'https://kdocs.cn/l/cl5aF6JjF0LS'
        },
        {
          'type': 'BI',
          'business': '帆软',
          'system': 'SAP',
          'link': 'https://docs.qq.com/sheet/DVWNrVnpnRGxBcEdS?tab=BB08J2'
        },
        {
          'type': '财税',
          'business': '标普云',
          'system': '鼎捷E10',
          'link': 'https://www.kdocs.cn/l/cs17y0UKsBBb'
        }
      ],
      arr1: [],
      arr2: []
    }
  },
  created() {
    this.getOrderNumber()
  },
  methods: {
    handleClick(row) {
      var el = document.createElement('a')
      document.body.appendChild(el)
      el.href = row // url
      el.target = '_new' // 指定在新窗口打开
      el.click()
      document.body.removeChild(el)
    },
    // 获取编号相同的数组
    getOrderNumber() {
      const obj = {}
      const obj1 = {}
      this.tableData.forEach((item, idx) => {
        item.rowIndex = idx
        const key = item.type + '|' + item.business
        obj[key] = obj[key] || []
        obj[key].push(idx)

        obj1[item.type] = obj1[item.type] || []
        obj1[item.type].push(idx)
      })
      // 找到需要合并的项
      Object.keys(obj).forEach((key) => {
        if (obj[key].length > 1) {
          this.arr1.push(obj[key])
        }
      })
      // 找到需要合并的项
      Object.keys(obj1).forEach((key) => {
        if (obj1[key].length > 1) {
          this.arr2.push(obj1[key])
        }
      })
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1) {
        for (let i = 0; i < this.arr1.length; i += 1) {
          const element = this.arr1[i]
          for (let j = 0; j < element.length; j += 1) {
            if (rowIndex === element[j]) {
              return j === 0
                ? { rowspan: element.length, colspan: 1 }
                : { rowspan: 0, colspan: 0 }
            }
          }
        }
      }
      if (columnIndex === 0) {
        for (let i = 0; i < this.arr2.length; i += 1) {
          const element = this.arr2[i]
          for (let j = 0; j < element.length; j += 1) {
            if (rowIndex === element[j]) {
              return j === 0
                ? { rowspan: element.length, colspan: 1 }
                : { rowspan: 0, colspan: 0 }
            }
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.digitalFactory {
  font: 2em sans-serif;
}
</style>
