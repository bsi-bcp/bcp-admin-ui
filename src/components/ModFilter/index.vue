<template>
  <div style="background: #fff;">
    <div style="padding:20px">
      <div v-if="!datas.noFilter" class="mod-filter">
        <el-form ref="datas" size="mini" :model="datas" style="border:0">
          <slot name="manyBtn" />
          <el-row v-for="(page,index) in filterConditions" :key="index" :gutter="20" type="flex">
            <el-col v-for="(item) of page" :key="item.prop" :span="datas.listRowSize">
              <el-row type="flex">
                <el-form-item :label="item.queryName||item.label" :prop="item.prop" style="white-space:nowrap" />
                <el-col>
                  <el-form-item>
                    <el-input v-if="item.type=='input'" :id="item.prop" v-model="item[item.prop]" :placeholder="item.placeholder" :clearable="true" />
                    <el-select v-if="item.type=='select'" v-model="item[item.prop]" filterable :clearable="true" :placeholder="item.placeholder">
                      <el-option v-for="(optItem,opIndex) in item.optList" :key="opIndex" :label="optItem.label" :value="optItem.value" />
                    <!-- <el-option v-for="(key,value) in item.conv" :key="key" :label="item.conv[value]" :value="value"></el-option> -->
                    </el-select>
                    <sxf-proplist v-if="item.type=='sxf-proplist'" v-model="item[item.prop]" :code="item.placeholder" />
                    <sxf-freelist v-if="item.type=='sxf-freelist'" v-model="item[item.prop]" :code="item.placeholder" :params="item.params" />
                    <el-date-picker v-if="item.type=='date' && !item.conditionSpace" v-model="item[item.prop]" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" />
                    <el-date-picker v-if="item.type=='date' && item.conditionSpace" v-model="item[item.prop1]" value-format="yyyy-MM-dd" type="date" placeholder="开始日期" />
                    <el-date-picker v-if="item.type=='date' && item.conditionSpace" v-model="item[item.prop2]" value-format="yyyy-MM-dd" type="date" placeholder="结束日期" />
                    <el-date-picker v-if="item.type=='daterange'" v-model="item[item.dateProp]" style="width:100%" type="daterange" value-format="yyyy-MM-dd" :picker-options="pickerOptions2" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right" @change="changeDaterange" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <br>
          <div id="query-bar" style="text-align:right;">
            <template v-if="!datas.nosubmit">
              <el-button v-if="searchCon.length>0" size="mini" type="primary" @click="onSubmit()">查询</el-button>
            </template>
            <template v-if="!datas.noresetForm">
              <el-button v-if="searchCon.length>0" size="mini" type="primary" @click="resetForm('datas')">重置</el-button>
            </template>
            <el-dropdown :hide-on-click="false" :show-timeout="100" trigger="click" style="padding-left:10px;" v-show="false">
              <el-button type="primary" size="mini">
                设置
                <i class="el-icon-caret-bottom el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown" class="no-border">
                <div v-if="!datas.noAdvQuery">
                  <span style="font-weight: bold;padding-left:5px;">查询条件：</span>
                  <el-checkbox-group v-model="searchCon" style="padding: 5px 15px;">
                    <el-checkbox v-for="item in searchDisplay" :key="item.key" :checked="item.conditionshow" :label="item.prop" @change="changeSearchCondition">
                      {{ item.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
                <br>
                <div v-if="!datas.noDisplay">
                  <span style="font-weight: bold;padding-left:5px;">列表字段：</span>
                  <el-checkbox-group v-model="showFiled" style="padding: 5px 15px;">
                    <el-checkbox v-for="item in tableDisplay" :key="item.key" :label="item.prop" :checked="item.filedShow" @change="changeTableFiled">
                      {{ item.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-form>
        <slot name="operating" />
      </div>

      <div style="margin-top:15px;width:100%;">
        <slot name="lastBtn" />
      </div>

      <el-table ref="table" v-loading="datas.table.loading" max-height="600px" class="mt10" :cell-style="{padding:'10px 0px'}" :header-cell-style="{background:'#fafafa',color:'#606266',padding:'12px 0px'}" :data="datas.resData.rows" fit highlight-current-row @selection-change="handleSelectionChange" @row-click="rowClick" @cell-click="cellClick">
        <el-table-column v-if="datas.table.selection" type="selection" width="55" />
        <el-table-column v-if="datas.table.orderNo" type="index" width="50" label="序号" align="center" />
        <el-table-column v-for="(rowItem ,rowIdx ) in tableField" :key="rowIdx" :prop="rowItem.prop" :label="rowItem.label" :type="rowItem.type" :align="rowItem.align==null?'center':rowItem.align" :show-overflow-tooltip="true" :min-width="rowItem.minWidth">
          <template slot-scope="scope">
            <slot v-if="rowItem.slot==true" :name="rowItem.prop" :value="scope.row" />
            <span v-else-if="!!rowItem.image"><img :src="scope.row[rowItem.prop]"></span>
            <span v-else-if="!rowItem.filter && !rowItem.conv">{{ scope.row[rowItem.prop] }}</span>
            <span v-else-if="!!rowItem.conv">{{ rowItem.conv[scope.row[rowItem.prop]] }}</span>
            <span v-else>{{ scope.row[rowItem.prop] | rowItem.filter }}</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- <slot name="table" class="mt10"></slot> -->

      <div v-if="!datas.noPage" class="mod-pagination mt10">
        <el-pagination
          background
          prev-text="上一页"
          next-text="下一页"
          :current-page.sync="datas.params.currentPage"
          :page-sizes="[10,20,30,50]"
          :page-size="datas.params.pageSize"
          layout="slot,total, sizes, prev, pager, next, jumper"
          :total="datas.resData.totalCount"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <span style="margin-right:50px;font-family:sans-serif;font-weight:normal">{{ census }}</span>
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
// filterList: 搜索条件
// noPage: 是否分页
// nosubmit:是否显示查询
// noresetForm:是否显示重置
// resData: api返回数据
// other
import {
  getReqModel
} from '@/utils'

export default {
  props: {
    datas: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      census: '',
      pickerOptions2: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      searchCon: [],
      showFiled: []
    }
  },
  computed: {
    filterConditions: function() {
      const pages = []
      const filterConditions = this.datas.filterList.filter(function(cond) {
        return cond.conditionshow
      })
      const rowsize = this.datas.filterList.findIndex((value) => value.type === 'daterange') > 0 ? 3 : 4
      filterConditions.forEach((item, index) => {
        if (item.conditionshow) {
          const page = Math.floor(index / rowsize) // 4代表4条为一行，随意更改
          if (!pages[page]) {
            pages[page] = []
          }
          pages[page].push(item)
        }
      })
      this.datas.listRowSize = (rowsize === 3 ? 8 : 6)
      return pages
    },
    searchDisplay: function() {
      return this.datas.filterList.filter((cond) => !cond.isSearchHide)
    },
    tableDisplay: function() {
      return this.datas.filterList.filter((cond) => !cond.just || cond.just.field)
    },
    tableField: function() {
      return this.datas.filterList.filter((cond) => cond.filedShow && (!cond.just || cond.just.field))
    }
  },
  created() {
    if (!this.datas.noInit) this.onSubmit()
  },
  methods: {
    changeDaterange(date) {
      if (!date) {
        const i = this.datas.filterList.findIndex((value) => value.type === 'daterange')
        this.$set(this.datas.filterList[i], this.datas.filterList[i].props[0], null)
        this.$set(this.datas.filterList[i], this.datas.filterList[i].props[1], null)
      }
    },

    rowClick(row, event, column) {
      // this.$set(this.datas,'rowClickData',row)
      this.$emit('rowClick', row)
      // this.datas['rowClickData']=row
    },
    cellClick(row, column, cell, event) {
      this.$emit('cellClick', row, column)
    },
    handleSelectionChange(val) {
      console.log(val)
      this.datas.multipleSelection = val
    },
    changeSearchCondition(value, event) {
      const filedName = event.target.value
      this.datas.filterList.forEach(row => {
        if (row.prop === filedName) {
          row['conditionshow'] = value
        }
      })
    },
    changeTableFiled(value, event) {
      const filedName = event.target.value
      this.datas.filterList.forEach(row => {
        if (row.prop === filedName) {
          row['filedShow'] = value
        }
      })
    },
    sortHandler(field, event) {
      this.datas.sort = {
        prop: field.column.property,
        order: field.order
      }
      this.$emit('query', this.datas, getReqModel(this.datas))
    },
    headerClick(column, event) {
      const isItme = this.datas.filterList.find((value) => value.prop === column.property)
      if (isItme) isItme.show = !isItme.show
    },
    onSubmit() {
      this.$emit('query', this.datas, getReqModel(this.datas))
    },
    resetForm(formName) {
      this.$refs[formName].model.filterList.forEach((item, index, ary) => {
        // if (item.hasOwnProperty('prop')) item[item.prop] = null
        // if (item[item.dateProp]) item[item.dateProp] = []
        if (item.hasOwnProperty('prop')) this.$set(item, item.prop, null)
        if (item[item.dateProp]) this.$set(item, item.dateProp, [])
      })
    },
    buildArg(v, a) {
      return v
    },
    handleSizeChange(val) {
      // 切换每页显示数量
      this.datas.params.pageSize = val
      this.$emit('query', this.datas, getReqModel(this.datas))
    },
    handleCurrentChange(val) {
      // 切换页码
      this.datas.params.currentPage = val
      this.$emit('query', this.datas, getReqModel(this.datas))
    },
    getLookUpList(type, index) {
      return this.$store.dispatch('GetlookUp', type).then(res => {
        this.filterList[index].optList = res.data
        // _.forEach(res.data, (item, index) => {
        //   this[key].push({
        //     label: item.meaning,
        //     value: item.lookupCode
        //   })
        // })
        // _.find(this.datas.filterList, {
        //   prop: prop
        // }).optList = this[key]
      })
    }
  }
}
</script>
