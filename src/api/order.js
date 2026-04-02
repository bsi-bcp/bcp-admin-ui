import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/kitOrder')

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete
export const singleDelete = crud.singleDelete

export function getId(id) {
  return request({
    url: '/services/fwcore/kitOrder/' + id,
    method: 'get'
  })
}

export function getRolesByUserId(params) {
  return request({
    url: '/services/fwcore/kitOrder/user/' + params,
    method: 'GET'
  })
}

export function getName(params) {
  return request({
    url: '/services/fwcore/kitOrder',
    method: 'get',
    params
  })
}
