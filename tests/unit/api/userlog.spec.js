import { getPage, URL } from '@/api/userlog'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: userlog.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getPage sends GET to /services/fwcore/userlogs with params', () => {
    getPage({ currentPage: 1, pageSize: 20 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/userlogs',
      method: 'get',
      params: { currentPage: 1, pageSize: 20 }
    })
  })

  it('URL.userlog equals /services/fwcore/userlogs', () => {
    expect(URL.userlog).toBe('/services/fwcore/userlogs')
  })
})
