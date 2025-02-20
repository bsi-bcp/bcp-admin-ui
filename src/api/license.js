import request from '@/utils/request'
import qs from 'qs'

const URL = {
  role: '/services/fwcore/kitLicense'
}
export async function getId(id) {
  return request({
    url: URL.role + '/' + id,
    method: 'get'
  })
}

// 1、授权码列表
export function getLicenseList(params) {
  return request({
    url: URL.role,
    method: 'get',
    params
  })
}

// 1、授权码列表
export function heatbeat(params) {
  return request({
    url: URL.role + '/heatbeat',
    method: 'POST',
    data: params
  })
}

// 2、新增/编辑
export function submitForm(params) {
  return request({
    url: params.id ? URL.role + '/' + params.id + '' : URL.role,
    method: params.id ? 'PUT' : 'POST',
    data: params
  })
}

// 3、批量删除
export function batchDelete(params) {
  const queryParams = qs.stringify(params, { indices: false })
  return request({
    url: URL.role + '?' + queryParams,
    method: 'DELETE'
    // params
  })
}

// 4.单个删除
export function singleDelete(id) {
  return request({
    url: URL.role + '/' + id,
    method: 'DELETE'
    // params
  })
}
