import createCrudApi from './_crud'
import request from '@/utils/request'
import * as common from '@/api/common.js'

const crud = createCrudApi('/services/fwcore/frontcomputertask', { menuArr: false })

export const getPage = crud.getPage
export const submitForm = crud.submitForm

// 分配租户计划任务
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

// 批量删除（使用 splitArr 格式，后端依赖此格式）
export function batchDelete(params) {
  const ids = common.splitArr(params.items, ',')
  return request({
    url: '/services/fwcore/frontcomputertask?items=' + ids,
    method: 'DELETE'
  })
}

export function getPlanOptions(code) {
  return request({
    url: '/services/fwcore/props/getPropListByPropCode?code=' + code,
    method: 'get'
  })
}

export function getTenants() {
  return request({
    url: '/services/fwcore/orgClasses',
    method: 'get'
  })
}

export function getComputers(tenantId) {
  return request({
    url: '/services/fwcore/getFrontComputerByTenantId/' + tenantId,
    method: 'get'
  })
}

export function getSourceTypeOptions(code) {
  return request({
    url: '/services/fwcore/props/getPropListByPropCode?code=' + code,
    method: 'get'
  })
}

export function batchSendTask(ids) {
  return request({
    url: '/services/fwcore/batchSendTask?ids=' + ids,
    method: 'post'
  })
}
