import { getPage, submitForm, batchDelete } from '@/api/freelist'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: freelist.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  describe('getPage', () => {
    it('sends GET to /services/fwcore/freelists', () => {
      const params = { currentPage: 1 }
      getPage(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/freelists',
        method: 'get',
        params
      })
    })
  })

  describe('submitForm', () => {
    it('sends post for new record', () => {
      submitForm({ name: 'test' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/freelists',
        method: 'POST'
      }))
    })

    it('sends put for existing record', () => {
      submitForm({ id: '1', name: 'test' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/freelists/1',
        method: 'PUT'
      }))
    })
  })

  describe('batchDelete', () => {
    it('sends DELETE to /services/fwcore/freelists/batch (different URL)', () => {
      batchDelete({ items: ['1', '2'] })
      const url = request.mock.calls[0][0].url
      expect(url).toContain('/services/fwcore/freelists/batch?')
      expect(url).toContain('items=1')
      expect(request.mock.calls[0][0].method).toBe('DELETE')
    })
  })
})
