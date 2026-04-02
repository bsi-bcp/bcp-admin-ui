import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/IntegratedConfigura')

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete
export const singleDelete = crud.singleDelete

// 根据用户id查询所拥有的角色
export function getRolesByUserId(params) {
  return request({
    url: '/services/fwcore/IntegratedConfigura/user/' + params,
    method: 'GET'
  })
}

// 获取页面表格信息的名称
export function getName(params) {
  return request({
    url: '/services/fwcore/IntegratedConfigura',
    method: 'get',
    params
  })
}
