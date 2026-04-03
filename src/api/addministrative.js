import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/template')

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete
export const singleDelete = crud.singleDelete

export function getName(params) {
  return request({
    url: '/services/fwcore/template',
    method: 'get',
    params
  })
}

export function getPageAuth(params) {
  return request({
    url: '/services/fwcore/template-auth',
    method: 'get',
    params
  })
}
