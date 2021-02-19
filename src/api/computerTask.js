import request from '@/utils/request'
import * as common from '@/api/common.js'

const URL = {
  frontcomputertask: '/services/fwcore/frontcomputertask'
}

// 1、计划任务列表
export function getPage(params) {
  return request({
    url: URL.frontcomputertask,
    method: 'get',
    params
  })
}

// 2、新增/保存计划任务
export function submitForm(params) {
  return request({
    url: params.id ? URL.frontcomputertask + '/' + params.id + '' : URL.frontcomputertask,
    method: params.id ? 'put' : 'post',
    data: params
  })
}

// 2、分配租户计划任务
export function submitAllocationForm(params) {
  const items = params.items
  const array = []
  for (let i = 0; i < items.length; i++) {
    array[i] = {
      taskId: items[i],
      tenantId: params.tenantId,
      computerId: params.computerId
    }
  }
  return request({
    url: '/services/fwcore//allocationTask',
    method: 'post',
    data: array
  })
}

// 3、批量删除
export function batchDelete(params) {
  var ids = common.splitArr(params.items, ',')
  return request({
    url: URL.frontcomputertask + '?items=' + ids,
    method: 'DELETE'
    // params
  })
}

// 5、查询字典
export function getPlanOptions(code) {
  return request({
    url: '/services/fwcore/props/getPropListByPropCode?code=' + code,
    method: 'get'
  })
}

// 6、查询租户列表
export function getTenants() {
  return request({
    url: '/services/fwcore/orgClasses',
    method: 'get'
  })
}

// 7、查询所选租户下所有的前置机
export function getComputers(tenantId) {
  return request({
    url: '/services/fwcore/getFrontComputerByTenantId/' + tenantId,
    method: 'get'
  })
}

// 8、查询字典
export function getSourceTypeOptions(code) {
  return request({
    // url: '/services/fwcore/prop/' + code + '/proplists',
    url: '/services/fwcore/props/getPropListByPropCode?code=' + code,
    method: 'get'
  })
}

// 3、批量下发任务到前置机
export function batchSendTask(ids) {
  return request({
    url: '/services/fwcore/batchSendTask?ids=' + ids,
    method: 'post'
    // params
  })
}
