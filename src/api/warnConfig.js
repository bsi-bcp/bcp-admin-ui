import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/warnConfig', { menuArr: false })

export const getPage = crud.getPage
export const submitForm = crud.submitForm

// intentionally empty — 未实现
export function getId(id) { }

// intentionally empty — 未实现
export function batchDelete(params) { }

export function singleDelete(id) {
  return request({
    url: '/services/fwcore/warnConfig/' + id,
    method: 'DELETE',
    data: null
  })
}

export function getBaseConfig(params) {
  return request({
    url: '/services/fwcore/warnBaseConfig',
    method: 'get',
    params: params
  })
}

export function getWarnMethodsByTenantId(tenantId) {
  return request({
    url: '/services/fwcore/warnMethod/getByTenant/' + tenantId,
    method: 'GET'
  })
}

export function sendConf(id) {
  return request({
    url: '/services/fwcore/warnConfig/send/' + id,
    method: 'GET'
  })
}
