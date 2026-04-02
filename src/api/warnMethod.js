import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/warnMethod')

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete
export const singleDelete = crud.singleDelete

export function getId(id) {
  return request({
    url: '/services/fwcore/warnMethod/' + id,
    method: 'get'
  })
}

export function getRolesByUserId(params) {
  return request({
    url: '/services/fwcore/warnMethod/user/' + params,
    method: 'GET'
  })
}

export function getName(params) {
  return request({
    url: '/services/fwcore/warnMethod',
    method: 'get',
    params
  })
}
