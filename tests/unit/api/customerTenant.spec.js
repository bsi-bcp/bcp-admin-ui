import { getPage, submitForm, batchDelete, getTenantList } from '@/api/customerTenant'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: customerTenant.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  describe('getPage', () => {
    it('sends GET to /services/fwcore/kitTenant', () => {
      const params = { currentPage: 1 }
      getPage(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/kitTenant',
        method: 'get',
        params
      })
    })
  })

  describe('submitForm', () => {
    it('sends POST for new record', () => {
      submitForm({ name: 'tenant' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/kitTenant',
        method: 'POST'
      }))
    })

    it('sends PUT for existing record', () => {
      submitForm({ id: '1' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/kitTenant/1',
        method: 'PUT'
      }))
    })

    it('converts menuArr to menuIds', () => {
      submitForm({ menuArr: ['m1', 'm2', 'm3'] })
      const callData = request.mock.calls[0][0].data
      expect(callData.menuIds).toBe('m1,m2,m3')
      expect(callData.menuArr).toBeUndefined()
    })
  })

  describe('batchDelete', () => {
    it('sends DELETE to /services/fwcore/kitTenants/batch (custom URL)', () => {
      batchDelete({ items: ['1', '2'] })
      const url = request.mock.calls[0][0].url
      expect(url).toContain('/services/fwcore/kitTenants/batch?')
      expect(url).toContain('items=1')
      expect(request.mock.calls[0][0].method).toBe('DELETE')
    })
  })

  describe('getTenantList', () => {
    it('sends GET to /services/fwcore/kitTenant/sys-tenant', () => {
      getTenantList()
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/kitTenant/sys-tenant',
        method: 'GET'
      })
    })
  })
})
