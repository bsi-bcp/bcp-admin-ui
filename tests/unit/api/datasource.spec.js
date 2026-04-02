import { getId, getPage, submitForm, batchDelete, singleDelete, getRolesByUserId, getName } from '@/api/datasource'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: datasource.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  describe('getId', () => {
    it('sends GET to /services/fwcore/datasource/:id', () => {
      getId('ds1')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/datasource/ds1',
        method: 'get'
      })
    })
  })

  describe('getPage', () => {
    it('sends GET to /services/fwcore/datasource with params', () => {
      const params = { currentPage: 1 }
      getPage(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/datasource',
        method: 'get',
        params
      })
    })
  })

  describe('submitForm', () => {
    it('sends POST for new record', () => {
      submitForm({ name: 'ds' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/datasource',
        method: 'POST'
      }))
    })

    it('sends PUT for existing record', () => {
      submitForm({ id: '1' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/datasource/1',
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
      batchDelete({ items: ['1', '2'] })
      const url = request.mock.calls[0][0].url
      expect(url).toContain('/services/fwcore/datasource?')
      expect(request.mock.calls[0][0].method).toBe('DELETE')
    })
  })

  describe('singleDelete', () => {
    it('sends DELETE to /services/fwcore/datasource/:id', () => {
      singleDelete('ds1')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/datasource/ds1',
        method: 'DELETE'
      })
    })
  })

  describe('getRolesByUserId', () => {
    it('sends GET to /services/fwcore/datasource/user/:id', () => {
      getRolesByUserId('u1')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/datasource/user/u1',
        method: 'GET'
      })
    })
  })

  describe('getName', () => {
    it('sends GET to /services/fwcore/datasource with params', () => {
      const params = { code: 'x' }
      getName(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/datasource',
        method: 'get',
        params
      })
    })
  })
})
