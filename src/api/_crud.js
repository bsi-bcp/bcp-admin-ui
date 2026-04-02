import request from '@/utils/request'
import qs from 'qs'

/**
 * CRUD API 工厂函数
 * @param {string} resourceUrl - 资源基础 URL (如 '/services/fwcore/roles')
 * @param {object} [options] - 可选配置
 * @param {string} [options.batchDeleteUrl] - 批量删除的自定义 URL（默认用 resourceUrl）
 * @param {boolean} [options.menuArr] - submitForm 是否处理 menuArr → menuIds 转换（默认 true）
 */
export default function createCrudApi(resourceUrl, options = {}) {
  const handleMenuArr = options.menuArr !== false

  return {
    getPage(params) {
      return request({
        url: resourceUrl,
        method: 'get',
        params
      })
    },

    getById(id) {
      return request({
        url: resourceUrl + '/' + id,
        method: 'get'
      })
    },

    submitForm(params) {
      if (handleMenuArr) {
        if (params.menuArr && params.menuArr.length) {
          params.menuIds = params.menuArr.join(',')
        } else {
          params.menuIds = ''
        }
        delete params.menuArr
      }
      return request({
        url: params.id ? resourceUrl + '/' + params.id : resourceUrl,
        method: params.id ? 'PUT' : 'POST',
        data: params
      })
    },

    batchDelete(params) {
      const deleteUrl = options.batchDeleteUrl || resourceUrl
      const queryParams = qs.stringify(params, { indices: false })
      return request({
        url: deleteUrl + '?' + queryParams,
        method: 'DELETE'
      })
    },

    singleDelete(id) {
      return request({
        url: resourceUrl + '/' + id,
        method: 'DELETE'
      })
    }
  }
}
