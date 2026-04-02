import { getId, getPage, getBaseConfig, submitForm, batchDelete, singleDelete, getWarnMethodsByTenantId, sendConf } from '@/api/warnConfig'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: warnConfig.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getId is an empty stub (returns undefined)', () => {
    const result = getId('1')
    expect(result).toBeUndefined()
    expect(request).not.toHaveBeenCalled()
  })

  it('getPage sends GET to /services/fwcore/warnConfig', () => {
    getPage({ currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnConfig',
      method: 'get',
      params: { currentPage: 1 }
    })
  })

  it('getBaseConfig sends GET to /services/fwcore/warnBaseConfig', () => {
    getBaseConfig({ key: 'val' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnBaseConfig',
      method: 'get',
      params: { key: 'val' }
    })
  })

  describe('submitForm', () => {
    it('POST for new, PUT for existing', () => {
      submitForm({ name: 'cfg' })
      expect(request.mock.calls[0][0].method).toBe('POST')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/warnConfig')

      request.mockClear()
      submitForm({ id: '1' })
      expect(request.mock.calls[0][0].method).toBe('PUT')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/warnConfig/1')
    })
  })

  it('batchDelete is an empty stub (returns undefined)', () => {
    const result = batchDelete({ items: ['1'] })
    expect(result).toBeUndefined()
    expect(request).not.toHaveBeenCalled()
  })

  it('singleDelete sends DELETE to /:id with data:null', () => {
    singleDelete('c1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnConfig/c1',
      method: 'DELETE',
      data: null
    })
  })

  it('getWarnMethodsByTenantId sends GET', () => {
    getWarnMethodsByTenantId('t1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnMethod/getByTenant/t1',
      method: 'GET'
    })
  })

  it('sendConf sends GET to /send/:id', () => {
    sendConf('c1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/warnConfig/send/c1',
      method: 'GET'
    })
  })
})
