import request from '@/utils/request'

const URL = {
  taskRunInfo: '/services/fwcore/taskruninfo'
}

// 1、列表
export function getPage(params) {
  return request({
    url: URL.taskRunInfo,
    method: 'get',
    params
  })
}
