const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

import { getFlowInfo, getSystemInfo, getTaskStats, getTaskErrors } from '@/api/dashboard'

describe('API: dashboard.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getFlowInfo sends POST to dashboard/flow-info with param', () => {
    const param = { startDate: '2026-01-01' }
    getFlowInfo(param)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/dashboard/flow-info',
      method: 'post',
      data: { startDate: '2026-01-01' }
    })
  })

  it('getSystemInfo sends POST to dashboard/system-info', () => {
    getSystemInfo()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/dashboard/system-info',
      method: 'post'
    })
  })

  it('getTaskStats sends POST to dashboard/task-stats', () => {
    getTaskStats()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/dashboard/task-stats',
      method: 'post'
    })
  })

  it('getTaskErrors sends POST to dashboard/task-errors with param', () => {
    const param = { limit: 5 }
    getTaskErrors(param)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/dashboard/task-errors',
      method: 'post',
      data: { limit: 5 }
    })
  })
})
