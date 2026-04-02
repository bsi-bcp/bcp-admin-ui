<template lang="html">
  <div>
    <el-select v-model="svalue" clearable size="mini" filterable>
      <el-option v-for="(optItem,optindex) in options" :key="optindex" :label="optItem.label" :value="optItem.value" />
    </el-select>
  </div>
</template>

<script>
/**
 * 通用下拉选择器 — 统一 PropList 和 Freelist 的底层实现
 *
 * Props:
 *   apiMethod {Function} — 数据加载方法，返回 Promise({ model: { key: label } })
 *   apiParams {Object}   — 传给 apiMethod 的参数
 *   value {String}       — v-model 绑定值
 */
export default {
  name: 'SelectLoader',
  props: {
    apiMethod: {
      type: Function,
      required: true
    },
    apiParams: {
      type: Object,
      default: () => ({})
    },
    value: String
  },
  data() {
    return {
      options: [],
      svalue: this.value
    }
  },
  watch: {
    svalue(val, oldVal) {
      if (val !== oldVal) {
        this.$emit('input', val)
      }
    }
  },
  mounted() {
    this.apiMethod(this.apiParams).then(res => {
      for (const item in res.model) {
        this.options.push({ label: res.model[item], value: item })
      }
    })
  }
}
</script>
