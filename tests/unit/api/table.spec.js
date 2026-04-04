import { getList } from '@/api/table'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: table.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getList sends GET to /table/list with params', () => {
    getList({ page: 1, limit: 20 })
    expect(request).toHaveBeenCalledWith({
      url: '/table/list',
      method: 'get',
      params: { page: 1, limit: 20 }
    })
  })

  it('getList sends GET to /table/list without params', () => {
    getList()
    expect(request).toHaveBeenCalledWith({
      url: '/table/list',
      method: 'get',
      params: undefined
    })
  })
})
