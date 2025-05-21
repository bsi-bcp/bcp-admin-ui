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
