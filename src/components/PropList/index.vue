<template>
  <select-loader :api-method="apiMethod" :api-params="{ code, group }" :value="value" @input="$emit('input', $event)" />
</template>

<script>
import SelectLoader from '@/components/SelectLoader/index.vue'
import { getProplist } from '@/api/select'

export default {
  name: 'SXFProplist',
  components: { SelectLoader },
  props: {
    code: String,
    group: String,
    value: String
  },
  data() {
    return {
      apiMethod: getProplist
    }
  }
}
</script>
