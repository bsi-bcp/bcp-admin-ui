import createCrudApi from '@/api/_crud'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('createCrudApi', () => {
  let api

  beforeEach(() => {
    request.mockClear()
    api = createCrudApi('/services/fwcore/test')
  })

  describe('getPage', () => {
    it('sends GET to resourceUrl with params', () => {
      api.getPage({ currentPage: 1, pageSize: 10 })
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/test',
        method: 'get',
        params: { currentPage: 1, pageSize: 10 }
      })
    })
  })

  describe('getById', () => {
    it('sends GET to resourceUrl/:id', () => {
      api.getById('123')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/test/123',
        method: 'get'
      })
    })
  })

  describe('submitForm', () => {
    it('sends POST for new record (no id)', () => {
      api.submitForm({ name: 'test' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/test',
        method: 'POST'
      }))
    })

    it('sends PUT for existing record (with id)', () => {
      api.submitForm({ id: '1', name: 'test' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/test/1',
        method: 'PUT'
      }))
    })

    it('converts menuArr to menuIds comma-separated', () => {
      api.submitForm({ menuArr: ['a', 'b', 'c'] })
      const data = request.mock.calls[0][0].data
      expect(data.menuIds).toBe('a,b,c')
      expect(data.menuArr).toBeUndefined()
    })

    it('sets menuIds to empty string when menuArr is empty', () => {
      api.submitForm({ menuArr: [] })
      expect(request.mock.calls[0][0].data.menuIds).toBe('')
    })

    it('sets menuIds to empty string when menuArr is undefined', () => {
      api.submitForm({ name: 'x' })
      expect(request.mock.calls[0][0].data.menuIds).toBe('')
    })

    it('handles single-element menuArr', () => {
      api.submitForm({ menuArr: ['x'] })
      expect(request.mock.calls[0][0].data.menuIds).toBe('x')
    })

    it('skips menuArr handling when options.menuArr is false', () => {
      const noMenuApi = createCrudApi('/services/fwcore/test', { menuArr: false })
      noMenuApi.submitForm({ menuArr: ['a'], name: 'x' })
      const data = request.mock.calls[0][0].data
      expect(data.menuArr).toEqual(['a'])
      expect(data.menuIds).toBeUndefined()
    })
  })

  describe('batchDelete', () => {
    it('sends DELETE with qs-serialized params to resourceUrl', () => {
      api.batchDelete({ items: ['1', '2'] })
      const call = request.mock.calls[0][0]
      expect(call.method).toBe('DELETE')
      expect(call.url).toContain('/services/fwcore/test?')
      expect(call.url).toContain('items=1')
      expect(call.url).toContain('items=2')
    })

    it('uses custom batchDeleteUrl when provided', () => {
      const customApi = createCrudApi('/services/fwcore/test', {
        batchDeleteUrl: '/services/fwcore/test/batch'
      })
      customApi.batchDelete({ items: ['1'] })
      expect(request.mock.calls[0][0].url).toContain('/services/fwcore/test/batch?')
    })
  })

  describe('singleDelete', () => {
    it('sends DELETE to resourceUrl/:id', () => {
      api.singleDelete('123')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/test/123',
        method: 'DELETE'
      })
    })
  })
})
