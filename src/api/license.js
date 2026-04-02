import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/kitLicense', { menuArr: false })

export const getId = crud.getById
export const getLicenseList = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete
export const singleDelete = crud.singleDelete

// 心跳检查
export function heatbeat(params) {
  return request({
    url: '/services/fwcore/kitLicense/heatbeat',
    method: 'POST',
    data: params
  })
}
