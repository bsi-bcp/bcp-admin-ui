import { getPage, submitForm, batchDelete, singleDelete, getRolesByUserId, getName } from '@/api/IntegratedConfigura'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: IntegratedConfigura.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  describe('getPage', () => {
    it('sends GET to /services/fwcore/IntegratedConfigura', () => {
      const params = { currentPage: 1 }
      getPage(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/IntegratedConfigura',
        method: 'get',
        params
      })
    })
  })

  describe('submitForm', () => {
    it('sends POST for new record', () => {
      submitForm({ name: 'cfg' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/IntegratedConfigura',
        method: 'POST'
      }))
    })

    it('sends PUT for existing record', () => {
      submitForm({ id: '1', name: 'cfg' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/IntegratedConfigura/1',
        method: 'PUT'
      }))
    })

    it('converts menuArr to menuIds', () => {
      submitForm({ menuArr: ['a', 'b'] })
      const callData = request.mock.calls[0][0].data
      expect(callData.menuIds).toBe('a,b')
      expect(callData.menuArr).toBeUndefined()
    })
  })

  describe('batchDelete', () => {
    it('sends DELETE with qs-serialized params', () => {
      batchDelete({ items: ['1'] })
      const url = request.mock.calls[0][0].url
      expect(url).toContain('/services/fwcore/IntegratedConfigura?')
      expect(request.mock.calls[0][0].method).toBe('DELETE')
    })
  })

  describe('singleDelete', () => {
    it('sends DELETE to /services/fwcore/IntegratedConfigura/:id', () => {
      singleDelete('c1')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/IntegratedConfigura/c1',
        method: 'DELETE'
      })
    })
  })

  describe('getRolesByUserId', () => {
    it('sends GET to /services/fwcore/IntegratedConfigura/user/:id', () => {
      getRolesByUserId('u1')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/IntegratedConfigura/user/u1',
        method: 'GET'
      })
    })
  })

  describe('getName', () => {
    it('sends GET to /services/fwcore/IntegratedConfigura with params', () => {
      const params = { code: 'x' }
      getName(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/IntegratedConfigura',
        method: 'get',
        params
      })
    })
  })
})
