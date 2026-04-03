import Vue from 'vue'

// 阻止按钮重复提交
const preventRepeatClick = Vue.directive('preventRepeatClick', {
  inserted(el, binding) {
    el.addEventListener('click', () => {
      if (!el.disabled) {
        el.disabled = true
        setTimeout(() => {
          el.disabled = false
        }, binding.value || 5000)
      }
    })
  }
})

export { preventRepeatClick }
