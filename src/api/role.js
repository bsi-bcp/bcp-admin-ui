import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/roles')

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete

// 根据用户id查询所拥有的角色
export function getRolesByUserId(params) {
  return request({
    url: '/services/fwcore/roles/user/' + params,
    method: 'GET'
  })
}
