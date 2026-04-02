import createCrudApi from './_crud'
import request from '@/utils/request'

const crud = createCrudApi('/services/fwcore/Administrative')

export const getPage = crud.getPage
export const submitForm = crud.submitForm
export const batchDelete = crud.batchDelete
export const singleDelete = crud.singleDelete

export function getRolesByUserId(params) {
  return request({
    url: '/services/fwcore/Administrative/user/' + params,
    method: 'GET'
  })
}

export function getName(params) {
  return request({
    url: '/services/fwcore/Administrative',
    method: 'get',
    params
  })
}

// 文件上传
export function upData(params) {
  return request({
    url: '/services/fwcore/upload-any',
    method: 'post',
    data: params
  })
}

// 新增/编辑模板
export function AddTemplate(params) {
  return request({
    url: params.showType ? '/services/fwcore/template/' + params.id : '/services/fwcore/template',
    method: params.showType ? 'put' : 'POST',
    data: params
  })
}

// 模板列表
export function GetTemplate(params) {
  return request({
    url: '/services/fwcore/template',
    method: 'get',
    data: params
  })
}

// 禁用或启用
export function disableType(data) {
  return request({
    url: '/services/fwcore/template/' + data.id + '?enable=' + !data.enable,
    method: 'post',
    data: data
  })
}

// 删除模板
export function delType(data) {
  var id = JSON.parse(data)
  return request({
    url: '/services/fwcore/template/' + id,
    method: 'DELETE'
  })
}
