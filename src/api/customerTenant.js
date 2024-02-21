import request from '@/utils/request'
import qs from 'qs'

const URL = {
  role: '/services/fwcore/kitTenant',
  del: '/services/fwcore/kitTenants/batch',
  tenant: '/services/fwcore/kitTenant/sys-tenant'
}

// 1、客户租户列表
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
    url: URL.del + '?' + queryParams,
    method: 'DELETE'
    // params
  })
}

// 组织下拉框数据
export function getTenantList() {
  return request({
    url: URL.tenant,
    method: 'GET'
  })
}
