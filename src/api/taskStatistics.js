import request from '@/utils/request'

// 获取统计数据
export function getTaskStatistics(param) {
  return request({
    url: `/services/fwcore/task/statistics`,
    method: 'post',
    data: param
  })
}
