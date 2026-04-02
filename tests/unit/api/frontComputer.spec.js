import { getPage, submitForm, batchDelete, getTenants } from '@/api/frontComputer'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })
jest.mock('@/api/common.js', () => ({
  splitArr: (arr, sep) => arr.join(sep)
}))

describe('API: frontComputer.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getPage sends GET to /services/fwcore/frontcomputer', () => {
    getPage({ currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/frontcomputer',
      method: 'get',
      params: { currentPage: 1 }
    })
  })

  describe('submitForm', () => {
    it('post for new, put for existing', () => {
      submitForm({ name: 'fc' })
      expect(request.mock.calls[0][0].method).toBe('POST')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/frontcomputer')

      request.mockClear()
      submitForm({ id: '1' })
      expect(request.mock.calls[0][0].method).toBe('PUT')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/frontcomputer/1')
    })
  })

  it('batchDelete uses splitArr and sends DELETE with items= param', () => {
    batchDelete({ items: ['1', '2'] })
    const url = request.mock.calls[0][0].url
    expect(url).toBe('/services/fwcore/frontcomputer?items=1,2')
    expect(request.mock.calls[0][0].method).toBe('DELETE')
  })

  it('getTenants sends GET to /services/fwcore/orgClasses', () => {
    getTenants()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/orgClasses',
      method: 'get'
    })
  })
})
