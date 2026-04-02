import createCrudApi from './_crud'
import request from '@/utils/request'
import * as common from '@/api/common.js'

const crud = createCrudApi('/services/fwcore/frontcomputer', { menuArr: false })

export const getPage = crud.getPage
export const submitForm = crud.submitForm

// 批量删除 — 使用 splitArr 模式（后端依赖 items=1,2,3 格式）
export function batchDelete(params) {
  var ids = common.splitArr(params.items, ',')
  return request({
    url: '/services/fwcore/frontcomputer?items=' + ids,
    method: 'DELETE'
  })
}

// 查询租户列表
export function getTenants() {
  return request({
    url: '/services/fwcore/orgClasses',
    method: 'get'
  })
}
