import { getId, getLicenseList, heatbeat, submitForm, batchDelete, singleDelete } from '@/api/license'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: license.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  describe('getId', () => {
    it('sends GET to /services/fwcore/kitLicense/:id', () => {
      getId('lic1')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/kitLicense/lic1',
        method: 'get'
      })
    })
  })

  describe('getLicenseList', () => {
    it('sends GET to /services/fwcore/kitLicense with params', () => {
      const params = { currentPage: 1 }
      getLicenseList(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/kitLicense',
        method: 'get',
        params
      })
    })
  })

  describe('heatbeat', () => {
    it('sends POST to /services/fwcore/kitLicense/heatbeat', () => {
      const params = { key: 'val' }
      heatbeat(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/kitLicense/heatbeat',
        method: 'POST',
        data: params
      })
    })
  })

  describe('submitForm', () => {
    it('sends POST for new record', () => {
      submitForm({ name: 'lic' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/kitLicense',
        method: 'POST'
      }))
    })

    it('sends PUT for existing record', () => {
      submitForm({ id: '1', name: 'lic' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/kitLicense/1',
        method: 'PUT'
      }))
    })
  })

  describe('batchDelete', () => {
    it('sends DELETE with qs-serialized params', () => {
      batchDelete({ items: ['1', '2'] })
      const url = request.mock.calls[0][0].url
      expect(url).toContain('/services/fwcore/kitLicense?')
      expect(url).toContain('items=1')
      expect(request.mock.calls[0][0].method).toBe('DELETE')
    })
  })

  describe('singleDelete', () => {
    it('sends DELETE to /services/fwcore/kitLicense/:id', () => {
      singleDelete('lic1')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/kitLicense/lic1',
        method: 'DELETE'
      })
    })
  })
})
