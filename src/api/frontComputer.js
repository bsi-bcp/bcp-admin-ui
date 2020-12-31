import request from '@/utils/request'
import * as common from '@/api/common.js'

const URL = {
  frontcomputer: '/services/fwcore/frontcomputer'
}

// 1、前置机列表
export function getPage(params) {
  return request({
    url: URL.frontcomputer,
    method: 'get',
    params
  })
}

// 2、新增/保存前置机
export function submitForm(params) {
  return request({
    url: params.id ? URL.frontcomputer + '/' + params.id + '' : URL.frontcomputer,
    method: params.id ? 'put' : 'post',
    data: params
  })
}

// 3、批量删除
export function batchDelete(params) {
  var ids = common.splitArr(params.items, ',')
  return request({
    url: URL.frontcomputer + '?items=' + ids,
    method: 'DELETE'
    // params
  })
}

// 5、查询租户列表
export function getTenants() {
  return request({
    url: '/services/fwcore/orgClasses',
    method: 'get'
  })
}
