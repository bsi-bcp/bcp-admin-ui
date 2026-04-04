import { getPage } from '@/api/taskRunInfo'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: taskRunInfo.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getPage sends GET to /services/fwcore/taskruninfo with params', () => {
    getPage({ currentPage: 1, pageSize: 10 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/taskruninfo',
      method: 'get',
      params: { currentPage: 1, pageSize: 10 }
    })
  })

  it('getPage sends GET to /services/fwcore/taskruninfo without params', () => {
    getPage()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/taskruninfo',
      method: 'get',
      params: undefined
    })
  })
})
