import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/kitTenant', {
  batchDeleteUrl: '/services/fwcore/kitTenants/batch'
})

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete

// 组织下拉框数据
export function getTenantList() {
  return request({
    url: '/services/fwcore/kitTenant/sys-tenant',
    method: 'GET'
  })
}
