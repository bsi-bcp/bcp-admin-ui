import { getPage, submitForm, submitConfigForm, getTemplate, saveTemplate, batchDelete, getConfigData } from '@/api/orgClass'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })
jest.mock('@/api/common.js', () => ({
  splitArr: (arr, sep) => arr.join(sep)
}))

describe('API: orgClass.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getPage sends GET to /services/fwcore/orgClasses', () => {
    getPage({ currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/orgClasses',
      method: 'get',
      params: { currentPage: 1 }
    })
  })

  describe('submitForm', () => {
    it('post for new (id is null)', () => {
      submitForm({ name: 'org' })
      expect(request.mock.calls[0][0].method).toBe('post')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/orgClasses')
    })

    it('put for existing (id is not null)', () => {
      submitForm({ id: '1' })
      expect(request.mock.calls[0][0].method).toBe('put')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/orgClasses/1')
    })
  })

  describe('submitConfigForm', () => {
    it('post for new config', () => {
      submitConfigForm({ name: 'cfg' })
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/tenantconfig')
      expect(request.mock.calls[0][0].method).toBe('post')
    })

    it('put for existing config', () => {
      submitConfigForm({ id: '1' })
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/tenantconfig/1')
      expect(request.mock.calls[0][0].method).toBe('put')
    })
  })

  it('getTemplate sends GET to /services/fwcore/orgClasses/templates', () => {
    getTemplate({ code: 'x' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/orgClasses/templates',
      method: 'get',
      params: { code: 'x' }
    })
  })

  it('saveTemplate sends POST to /services/fwcore/orgClasses/:tenantId/template', () => {
    const data = [{ id: '1' }]
    saveTemplate('t1', data)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/orgClasses/t1/template',
      method: 'post',
      data
    })
  })

  it('batchDelete uses common.splitArr and sends DELETE with items= param', () => {
    batchDelete({ items: ['1', '2'] })
    const url = request.mock.calls[0][0].url
    expect(url).toBe('/services/fwcore/orgClasses?items=1,2')
    expect(request.mock.calls[0][0].method).toBe('DELETE')
  })

  it('getConfigData sends GET to /services/fwcore/tenantconfig/:id', () => {
    getConfigData('c1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/tenantconfig/c1',
      method: 'GET'
    })
  })
})
