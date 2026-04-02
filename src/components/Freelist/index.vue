<template>
  <select-loader :api-method="apiMethod" :api-params="{ code, params }" :value="value" @input="$emit('input', $event)" />
</template>

<script>
import SelectLoader from '@/components/SelectLoader/index.vue'
import { getFreelist } from '@/api/select'

export default {
  name: 'SXFSqllist',
  components: { SelectLoader },
  props: {
    code: String,
    value: String,
    params: String
  },
  data() {
    return {
      apiMethod: getFreelist
    }
  }
}
</script>
