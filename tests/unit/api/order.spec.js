import { getId, getPage, submitForm, batchDelete, singleDelete, getRolesByUserId, getName } from '@/api/order'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: order.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getId sends GET to /services/fwcore/kitOrder/:id', () => {
    getId('o1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/kitOrder/o1',
      method: 'get'
    })
  })

  it('getPage sends GET to /services/fwcore/kitOrder', () => {
    getPage({ currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/kitOrder',
      method: 'get',
      params: { currentPage: 1 }
    })
  })

  describe('submitForm', () => {
    it('POST for new, PUT for existing', () => {
      submitForm({ name: 'o' })
      expect(request.mock.calls[0][0].method).toBe('POST')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/kitOrder')

      request.mockClear()
      submitForm({ id: '1', name: 'o' })
      expect(request.mock.calls[0][0].method).toBe('PUT')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/kitOrder/1')
    })

    it('converts menuArr to menuIds', () => {
      submitForm({ menuArr: ['a', 'b'] })
      const callData = request.mock.calls[0][0].data
      expect(callData.menuIds).toBe('a,b')
      expect(callData.menuArr).toBeUndefined()
    })
  })

  it('batchDelete sends DELETE with qs params', () => {
    batchDelete({ items: ['1'] })
    const url = request.mock.calls[0][0].url
    expect(url).toContain('/services/fwcore/kitOrder?')
    expect(request.mock.calls[0][0].method).toBe('DELETE')
  })

  it('singleDelete sends DELETE to /services/fwcore/kitOrder/:id', () => {
    singleDelete('o1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/kitOrder/o1',
      method: 'DELETE'
    })
  })

  it('getRolesByUserId sends GET to /services/fwcore/kitOrder/user/:id', () => {
    getRolesByUserId('u1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/kitOrder/user/u1',
      method: 'GET'
    })
  })

  it('getName sends GET to /services/fwcore/kitOrder with params', () => {
    getName({ code: 'x' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/kitOrder',
      method: 'get',
      params: { code: 'x' }
    })
  })
})
