import { getPage, submitForm, batchDelete, getRolesByUserId } from '@/api/role'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: role.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  describe('getPage', () => {
    it('sends GET to /services/fwcore/roles with params', () => {
      const params = { currentPage: 1, pageSize: 10 }
      getPage(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/roles',
        method: 'get',
        params
      })
    })
  })

  describe('submitForm', () => {
    it('sends POST for new record (no id)', () => {
      const params = { name: 'admin' }
      submitForm(params)
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/services/fwcore/roles',
          method: 'POST',
          data: expect.objectContaining({ name: 'admin' })
        })
      )
    })

    it('sends PUT for existing record (with id)', () => {
      const params = { id: '1', name: 'admin' }
      submitForm(params)
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/services/fwcore/roles/1',
          method: 'PUT',
          data: expect.objectContaining({ id: '1', name: 'admin' })
        })
      )
    })

    it('converts menuArr to menuIds comma-separated string', () => {
      const params = { menuArr: ['a', 'b', 'c'] }
      submitForm(params)
      const callData = request.mock.calls[0][0].data
      expect(callData.menuIds).toBe('a,b,c')
      expect(callData.menuArr).toBeUndefined()
    })

    it('sets menuIds to empty string when menuArr is empty', () => {
      const params = { menuArr: [] }
      submitForm(params)
      const callData = request.mock.calls[0][0].data
      expect(callData.menuIds).toBe('')
    })

    it('sets menuIds to empty string when menuArr is undefined', () => {
      const params = { name: 'test' }
      submitForm(params)
      const callData = request.mock.calls[0][0].data
      expect(callData.menuIds).toBe('')
    })

    it('handles single-element menuArr', () => {
      const params = { menuArr: ['x'] }
      submitForm(params)
      const callData = request.mock.calls[0][0].data
      expect(callData.menuIds).toBe('x')
    })
  })

  describe('batchDelete', () => {
    it('sends DELETE with qs-serialized params', () => {
      const params = { items: ['1', '2'] }
      batchDelete(params)
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/services/fwcore/roles?'),
          method: 'DELETE'
        })
      )
      // qs.stringify with indices:false produces items=1&items=2
      const url = request.mock.calls[0][0].url
      expect(url).toContain('items=1')
      expect(url).toContain('items=2')
    })
  })

  describe('getRolesByUserId', () => {
    it('sends GET to /services/fwcore/roles/user/:userId', () => {
      getRolesByUserId('u123')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/roles/user/u123',
        method: 'GET'
      })
    })
  })
})
