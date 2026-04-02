import createCrudApi from './_crud'
import request from '@/utils/request'
import qs from 'qs'

const crud = createCrudApi('/services/fwcore/props', { menuArr: false })

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete

// 根据propId获取propList数据
export function getPropListByPropId(params) {
  return request({
    url: '/services/fwcore/props/getPropListByPropId/' + params,
    method: 'GET'
  })
}

// 新增行表数据
export function submitPropListForm(params) {
  return request({
    url: params.id ? '/services/fwcore/props/propLists/' + params.id : '/services/fwcore/props/propLists',
    method: params.id ? 'PUT' : 'POST',
    data: params
  })
}

// 批量删除propList
export function batchDeletePropList(params) {
  const queryParams = qs.stringify(params, { indices: false })
  return request({
    url: '/services/fwcore/props/proplists?' + queryParams,
    method: 'DELETE'
  })
}

// 根据propCode获取propList数据
export function getPropListByPropCode(params) {
  return request({
    url: '/services/fwcore/props/getPropListByPropCode',
    method: 'GET',
    params
  })
}
