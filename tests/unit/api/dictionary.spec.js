import { getPage, submitForm, batchDelete, getPropListByPropId, submitPropListForm, batchDeletePropList, getPropListByPropCode } from '@/api/dictionary'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: dictionary.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  describe('getPage', () => {
    it('sends GET to /services/fwcore/props', () => {
      const params = { currentPage: 1 }
      getPage(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/props',
        method: 'get',
        params
      })
    })
  })

  describe('submitForm', () => {
    it('sends POST for new record', () => {
      submitForm({ code: 'dict1' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/props',
        method: 'POST'
      }))
    })

    it('sends PUT for existing record', () => {
      submitForm({ id: '1', code: 'dict1' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/props/1',
        method: 'PUT'
      }))
    })
  })

  describe('batchDelete', () => {
    it('sends DELETE with qs-serialized params', () => {
      batchDelete({ items: ['1'] })
      const url = request.mock.calls[0][0].url
      expect(url).toContain('/services/fwcore/props?')
      expect(request.mock.calls[0][0].method).toBe('DELETE')
    })
  })

  describe('getPropListByPropId', () => {
    it('sends GET to /services/fwcore/props/getPropListByPropId/:id', () => {
      getPropListByPropId('p1')
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/props/getPropListByPropId/p1',
        method: 'GET'
      })
    })
  })

  describe('submitPropListForm', () => {
    it('sends POST for new propList', () => {
      submitPropListForm({ value: 'v' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/props/propLists',
        method: 'POST'
      }))
    })

    it('sends PUT for existing propList', () => {
      submitPropListForm({ id: '1', value: 'v' })
      expect(request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/services/fwcore/props/propLists/1',
        method: 'PUT'
      }))
    })
  })

  describe('batchDeletePropList', () => {
    it('sends DELETE to /services/fwcore/props/proplists', () => {
      batchDeletePropList({ items: ['1'] })
      const url = request.mock.calls[0][0].url
      expect(url).toContain('/services/fwcore/props/proplists?')
      expect(request.mock.calls[0][0].method).toBe('DELETE')
    })
  })

  describe('getPropListByPropCode', () => {
    it('sends GET with params', () => {
      const params = { code: 'STATUS' }
      getPropListByPropCode(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/props/getPropListByPropCode',
        method: 'GET',
        params
      })
    })
  })
})
