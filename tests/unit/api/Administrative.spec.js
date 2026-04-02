import { getPage, submitForm, batchDelete, singleDelete, getRolesByUserId, getName, upData, AddTemplate, GetTemplate, disableType, delType } from '@/api/Administrative'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: Administrative.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getPage sends GET to /services/fwcore/Administrative', () => {
    getPage({ currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/Administrative',
      method: 'get',
      params: { currentPage: 1 }
    })
  })

  describe('submitForm', () => {
    it('POST for new, PUT for existing', () => {
      submitForm({ name: 'adm' })
      expect(request.mock.calls[0][0].method).toBe('POST')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/Administrative')

      request.mockClear()
      submitForm({ id: '1' })
      expect(request.mock.calls[0][0].method).toBe('PUT')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/Administrative/1')
    })

    it('converts menuArr to menuIds', () => {
      submitForm({ menuArr: ['a', 'b'] })
      const callData = request.mock.calls[0][0].data
      expect(callData.menuIds).toBe('a,b')
      expect(callData.menuArr).toBeUndefined()
    })
  })

  it('batchDelete sends DELETE with qs params', () => {
    batchDelete({ items: ['1'] })
    expect(request.mock.calls[0][0].url).toContain('/services/fwcore/Administrative?')
    expect(request.mock.calls[0][0].method).toBe('DELETE')
  })

  it('singleDelete sends DELETE to /:id', () => {
    singleDelete('a1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/Administrative/a1',
      method: 'DELETE'
    })
  })

  it('getRolesByUserId sends GET to /user/:id', () => {
    getRolesByUserId('u1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/Administrative/user/u1',
      method: 'GET'
    })
  })

  it('getName sends GET with params', () => {
    getName({ code: 'x' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/Administrative',
      method: 'get',
      params: { code: 'x' }
    })
  })

  it('upData sends POST to /services/fwcore/upload-any', () => {
    const params = { file: 'data' }
    upData(params)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/upload-any',
      method: 'post',
      data: params
    })
  })

  describe('AddTemplate', () => {
    it('POST for new template', () => {
      AddTemplate({ name: 'tpl' })
      expect(request.mock.calls[0][0].method).toBe('POST')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/template')
    })

    it('PUT for existing template (showType truthy)', () => {
      AddTemplate({ id: '1', showType: true })
      expect(request.mock.calls[0][0].method).toBe('put')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/template/1')
    })
  })

  it('GetTemplate sends GET to /services/fwcore/template', () => {
    const params = { type: 'all' }
    GetTemplate(params)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/template',
      method: 'get',
      data: params
    })
  })

  it('disableType sends POST to toggle enable', () => {
    disableType({ id: '1', enable: true })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/template/1?enable=false',
      method: 'post',
      data: { id: '1', enable: true }
    })
  })

  it('delType sends DELETE to /services/fwcore/template/:id', () => {
    delType('"t1"')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/template/t1',
      method: 'DELETE'
    })
  })
})
