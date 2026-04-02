import createCrudApi from './_crud'
import request from '@/utils/request'
import * as common from '@/api/common.js'

const crud = createCrudApi('/services/fwcore/orgClasses', { menuArr: false })

export const getPage = crud.getPage

// submitForm 使用 != null 判断（保留原始行为）
export function submitForm(params) {
  return request({
    url: params.id != null ? '/services/fwcore/orgClasses/' + params.id : '/services/fwcore/orgClasses',
    method: params.id == null ? 'post' : 'put',
    data: params
  })
}

// 配置租户
export function submitConfigForm(params) {
  return request({
    url: params.id != null ? '/services/fwcore/tenantconfig/' + params.id : '/services/fwcore/tenantconfig',
    method: params.id == null ? 'post' : 'put',
    data: params
  })
}

// 获取模板列表
export function getTemplate(params) {
  return request({
    url: '/services/fwcore/orgClasses/templates',
    method: 'get',
    params
  })
}

// 保存租户模板授权数据
export function saveTemplate(tenantId, params) {
  return request({
    url: '/services/fwcore/orgClasses/' + tenantId + '/template',
    method: 'post',
    data: params
  })
}

// 批量删除 — 使用 splitArr 模式（后端依赖 items=1,2,3 格式）
export function batchDelete(params) {
  var ids = common.splitArr(params.items, ',')
  return request({
    url: '/services/fwcore/orgClasses?items=' + ids,
    method: 'DELETE'
  })
}

// 获取当前租户的配置信息
export function getConfigData(id) {
  return request({
    url: '/services/fwcore/tenantconfig/' + id,
    method: 'GET'
  })
}
