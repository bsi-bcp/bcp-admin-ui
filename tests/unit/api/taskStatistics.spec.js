import { getTaskStatistics } from '@/api/taskStatistics'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: taskStatistics.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getTaskStatistics sends POST to /services/fwcore/task/statistics with data', () => {
    getTaskStatistics({ dateRange: '2026-01-01' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/task/statistics',
      method: 'post',
      data: { dateRange: '2026-01-01' }
    })
  })

  it('getTaskStatistics sends POST without data', () => {
    getTaskStatistics()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/task/statistics',
      method: 'post',
      data: undefined
    })
  })
})
