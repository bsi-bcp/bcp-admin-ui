import request from '@/utils/request'
import * as common from '@/api/common.js'

const URL = {
  orgClass: '/services/fwcore/orgClasses',
  listTempates: '/services/fwcore/orgClasses/templates'
}

const ConfigURL = {
  tenantconfig: '/services/fwcore/tenantconfig'
}

// 1、租户列表
export function getPage(params) {
  return request({
    url: URL.orgClass,
    method: 'get',
    params
  })
}

// 2、新增/保存租户
export function submitForm(params) {
  return request({
    url: params.id != null ? URL.orgClass + '/' + params.id + '' : URL.orgClass,
    method: params.id == null ? 'post' : 'put',
    data: params
  })
}

// 3、配置租户
export function submitConfigForm(params) {
  return request({
    url: params.id != null ? ConfigURL.tenantconfig + '/' + params.id + '' : ConfigURL.tenantconfig,
    method: params.id == null ? 'post' : 'put',
    data: params
  })
}
//获取模列表
export function getTemplate(params) {
  return request({
    url: URL.listTempates,
    method: 'get',
    params
  })
}

// 保存租户模板授权数据
export function saveTemplate(tenantId,params) {
  return request({
    url: `/services/fwcore/orgClasses/${tenantId}/template`,
    method: 'post',
    data:params
  })
}

// 4、批量删除
export function batchDelete(params) {
  var ids = common.splitArr(params.items, ',')
  return request({
    url: URL.orgClass + '?items=' + ids,
    method: 'DELETE'
    // params
  })
}

// 5、获取当前租户的配置信息
export function getConfigData(id) {
  return request({
    url: '/services/fwcore/tenantconfig/' + id,
    method: 'GET'
  })
}
