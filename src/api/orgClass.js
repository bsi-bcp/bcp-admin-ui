import request from '@/utils/request'
import * as common from '@/api/common.js'

const URL = {
  orgClass: '/services/fwcore/orgClasses'
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
  debugger
  return request({
    url: params.id != null ? URL.orgClass + '/' + params.id + '' : URL.orgClass,
    method: params.id == null ? 'post' : 'put',
    data: params
  })
}

// 3、批量删除
export function batchDelete(params) {
  var ids = common.splitArr(params.items, ',')
  return request({
    url: URL.orgClass + '?items=' + ids,
    method: 'DELETE'
    // params
  })
}
