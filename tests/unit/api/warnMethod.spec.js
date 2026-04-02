import { getId, getPage, submitForm, batchDelete, singleDelete, getRolesByUserId, getName } from '@/api/warnMethod'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: warnMethod.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getId sends GET to /services/fwcore/warnMethod/:id', () => {
    getId('w1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnMethod/w1',
      method: 'get'
    })
  })

  it('getPage sends GET with params', () => {
    getPage({ currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnMethod',
      method: 'get',
      params: { currentPage: 1 }
    })
  })

  describe('submitForm', () => {
    it('POST for new, PUT for existing', () => {
      submitForm({ name: 'w' })
      expect(request.mock.calls[0][0].method).toBe('POST')

      request.mockClear()
      submitForm({ id: '1' })
      expect(request.mock.calls[0][0].method).toBe('PUT')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/warnMethod/1')
    })

    it('converts menuArr to menuIds', () => {
      submitForm({ menuArr: ['x', 'y'] })
      const callData = request.mock.calls[0][0].data
      expect(callData.menuIds).toBe('x,y')
      expect(callData.menuArr).toBeUndefined()
    })
  })

  it('batchDelete sends DELETE with qs params', () => {
    batchDelete({ items: ['1'] })
    expect(request.mock.calls[0][0].url).toContain('/services/fwcore/warnMethod?')
    expect(request.mock.calls[0][0].method).toBe('DELETE')
  })

  it('singleDelete sends DELETE to /:id', () => {
    singleDelete('w1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnMethod/w1',
      method: 'DELETE'
    })
  })

  it('getRolesByUserId sends GET to /user/:id', () => {
    getRolesByUserId('u1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnMethod/user/u1',
      method: 'GET'
    })
  })

  it('getName sends GET with params', () => {
    getName({ code: 'x' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnMethod',
      method: 'get',
      params: { code: 'x' }
    })
  })
})
