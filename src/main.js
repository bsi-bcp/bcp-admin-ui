import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import SXFProplist from '@/components/PropList/index.vue'
import MODFilter from '@/components/ModFilter/index.vue'
import EXPORTExcel from '@/components/ExportExcel/index.vue'
import SXFFreelist from '@/components/Freelist/index.vue'
import { preventRepeatClick } from '@/utils/directive.js'

Vue.component('sxf-proplist', SXFProplist)
Vue.component('mod-filter', MODFilter)
Vue.component('sxf-export-excel', EXPORTExcel)
Vue.component('sxf-freelist', SXFFreelist)

// MockJs: disabled for local backend development
// if (process.env.NODE_ENV === 'development') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
