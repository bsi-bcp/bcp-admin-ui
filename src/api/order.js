import request from '@/utils/request'
import qs from 'qs'

const URL = {
  role: '/services/fwcore/kitOrder'
}
export async function getId(id) {
  return request({
    url: URL.role + '/' + id,
    method: 'get'
  })
}

// 1、角色列表
export function getPage(params) {
  return request({
    url: URL.role,
    method: 'get',
    params
  })
}

// 2、新增/编辑
export function submitForm(params) {
  let ids = ''
  if (params.menuArr && params.menuArr.length) {
    params.menuArr.forEach(function(item, index) {
      if (index === params.menuArr.length - 1) {
        ids = ids + item
      } else {
        ids = ids + item + ','
      }
    })
  }
  params.menuIds = ids
  delete params.menuArr
  console.log('params', params)
  return request({
    url: params.id ? URL.role + '/' + params.id + '' : URL.role,
    method: params.id ? 'PUT' : 'POST',
    data: params
  })
}

// 3、批量删除
export function batchDelete(params) {
  console.log(params)
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

// 5、根据用户id查询所拥有的角色
export function getRolesByUserId(params) {
  return request({
    url: URL.role + '/user/' + params,
    method: 'GET'
    // params
  })
}

// 6、获取页面表格信息的名称
export function getName(params) {
  return request({
    url: URL.role,
    method: 'get',
    params
  })
}
