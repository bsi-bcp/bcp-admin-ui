import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 15000,
  withCredentials: true
})

// 请求拦截器：注入 b-token
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['b-token'] = encodeURIComponent(store.getters.token)
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理业务错误码
service.interceptors.response.use(
  async response => {
    const res = response.data
    if (res.code === 403) {
      await store.dispatch('user/resetToken')
      router.push('/login')
      return Promise.reject(new Error('unauthorized'))
    }
    if (res.code === 552) {
      Message({
        message: '密码已过期，请修改密码后重新登录',
        type: 'warning',
        duration: 5 * 1000
      })
      await store.dispatch('user/resetToken')
      router.push('/login')
      return Promise.reject(new Error('password expired'))
    }
    if (res.code === 550) {
      Message({
        message: res.message || res.msg,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || res.msg || 'error'))
    }
    return response.data
  },
  error => {
    if (error.message === 'Network Error') {
      store.dispatch('user/resetToken')
      router.push('/login')
      return Promise.reject(error)
    }
    if (error.response && error.response.status === 403) {
      store.dispatch('user/resetToken')
      router.push('/login')
      return Promise.reject(error)
    }
    Message({
      message: error.message,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
