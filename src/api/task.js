import createCrudApi from './_crud'
import request from '@/utils/request'
import * as common from '@/api/common.js'

const crud = createCrudApi('/services/fwcore/task', { menuArr: false })

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

// 批量删除 — 使用 splitArr 模式（后端依赖 items=1,2,3 格式）
export function batchDelete(params) {
  var ids = common.splitArr(params.items, ',')
  return request({
    url: '/services/fwcore/task?items=' + ids,
    method: 'DELETE'
  })
}

// 查询字典
export function getSourceTypeOptions(code) {
  return request({
    url: '/services/fwcore/props/getPropListByPropCode?code=' + code,
    method: 'get'
  })
}

// 查询租户列表
export function getTenants() {
  return request({
    url: '/services/fwcore/orgClasses',
    method: 'get'
  })
}

// 查询所选租户下所有的前置机
export function getComputers(tenantId) {
  return request({
    url: '/services/fwcore/getFrontComputerByTenantId/' + tenantId,
    method: 'get'
  })
}

// 查询类型
export function getTypes() {
  return request({
    url: '/services/fwcore/taskTypes',
    method: 'get'
  })
}
