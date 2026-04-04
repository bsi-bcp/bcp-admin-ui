import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/config')

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete
export const singleDelete = crud.singleDelete

export function getIdRow(id) {
  return request({
    url: '/services/fwcore/config/' + id,
    method: 'GET'
  })
}

export function getRolesByUserId(params) {
  return request({
    url: '/services/fwcore/config/user/' + params,
    method: 'GET'
  })
}

export function getName(params) {
  return request({
    url: '/services/fwcore/config',
    method: 'get',
    params
  })
}

export function exportExcel(param) {
  return request({
    url: '/services/fwcore/config/down/' + param,
    method: 'get',
    data: param,
    responseType: 'blob'
  })
}

export function expForIot(param) {
  return request({
    url: '/services/fwcore/config/down/' + param.type + '/' + param.id,
    method: 'get',
    data: param,
    responseType: 'blob'
  })
}

export function runTask(param) {
  return request({
    url: '/services/fwcore/config/run-task',
    method: 'post',
    data: param,
    timeout: 120000
  })
}

export function getTaskLog(param) {
  return request({
    url: '/services/fwcore/config/task/log',
    method: 'post',
    data: param,
    timeout: 30000
  })
}

// 异步下发集成配置（立即返回，通过 getSendStatus 轮询结果）
export function issueType(param) {
  return request({
    url: '/services/fwcore/config/send/' + param,
    method: 'post'
  })
}

// 查询下发状态（轮询端点）
export function getSendStatus(id) {
  return request({
    url: '/services/fwcore/config/send-status/' + id,
    method: 'get'
  })
}

export function getTemplateContent(id) {
  return request({
    url: '/services/fwcore/template/down/' + id,
    method: 'GET'
  })
}

export function upload(params, configId) {
  return request({
    url: '/services/fwcore/upload-plugins/' + configId,
    method: 'post',
    data: params
  })
}

// 获取数据源的字段列表（用于 Monaco 编辑器自动补全）
export function getDatasourceFields(datasourceId) {
  return request({
    url: '/services/fwcore/datasource/fields/' + datasourceId,
    method: 'GET'
  })
}
