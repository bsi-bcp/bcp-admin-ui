import request from '@/utils/request'

// 获取统计数据
export function getFlowInfo(param) {
  return request({
    url: `/services/fwcore/dashboard/flow-info`,
    method: 'post',
    data: param
  })
}

// 获取资源使用率
export function getSystemInfo() {
  return request({
    url: `/services/fwcore/dashboard/system-info`,
    method: 'post'
  })
}

// 计划任务运行统计
export function getTaskStats() {
  return request({
    url: `/services/fwcore/dashboard/task-stats`,
    method: 'post'
  })
}
// 前5条错误数据
export function getTaskErrors(param) {
  return request({
    url: `/services/fwcore/dashboard/task-errors`,
    method: 'post',
    data: param
  })
}

