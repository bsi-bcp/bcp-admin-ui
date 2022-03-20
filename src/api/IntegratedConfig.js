import request from '@/utils/request'
import qs from 'qs'

const URL = {
  role: '/services/fwcore/config'
}

// 1、角色列表
export function getPage(params) {
  return request({
    url: URL.role,
    method: 'get',
    params
  })
}

// 2、新增/编辑
export function submitForm(params) {
  let ids = ''
  if (params.menuArr && params.menuArr.length) {
    params.menuArr.forEach(function(item, index) {
      if (index === params.menuArr.length - 1) {
        ids = ids + item
      } else {
        ids = ids + item + ','
      }
    })
  }
  params.menuIds = ids
  delete params.menuArr
  return request({
    url: params.id ? URL.role + '/' + params.id + '' : URL.role,
    method: params.id ? 'PUT' : 'POST',
    data: params
  })
}

// 3、批量删除
export function batchDelete(params) {
  console.log(params)
  const queryParams = qs.stringify(params, { indices: false })
  return request({
    url: URL.role + '?' + queryParams,
    method: 'DELETE'
    // params
  })
}

//4.单个删除
export function singleDelete(id) {
  return request({
    url: URL.role + '/' + id,
    method: 'DELETE'
    // params
  })
}

export function getIdRow(id) {
  return request({
    url: URL.role + '/' + id,
    method: 'GET'
    // params
  })
}

// 5、根据用户id查询所拥有的角色
export function getRolesByUserId(params) {
  return request({
    url: URL.role + '/user/' + params,
    method: 'GET'
    // params
  })
}

// 6、获取页面表格信息的名称
export function getName(params) {
  return request({
    url: URL.role,
    method: 'get',
    params
  })
}
export function exportExcel(param) {
  return request({
    url: `${URL.role}/down/${param}`,
    method: 'get',
    data: param,
    responseType:'blob'//必须是blob 否则导出的excel打不开
  })
}

export function expForIot(param) {
  return request({
    url: `${URL.role}/iot/down/${param}`,
    method: 'get',
    data: param,
    responseType:'blob'//必须是blob 否则导出的excel打不开
  })
}
export function runTask(param) {
  return request({
    url: `${URL.role}/run-task`,
    method: 'post',
    data: param
  })
}

export function getTaskLog(param) {
  return request({
    url: `${URL.role}/task/log`,
    method: 'post',
    data: param
  })
}

// 下发集成配置
export function issueType(param) {
  return request({
    url: `${URL.role}/send/${param}`,
    method: 'get',
  })
}
 
export function getTemplateContent(id) {
  return request({
    url:  `/services/fwcore/template/down/${id}`,
    method: 'GET'
  })
}

export function upload(params,configId) {
  return request({
    url: `/services/fwcore/upload-plugins/${configId}`,
    method: 'post',
    data: params
  })
}