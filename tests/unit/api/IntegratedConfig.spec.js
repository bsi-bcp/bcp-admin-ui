import { getPage, submitForm, batchDelete, singleDelete, getIdRow, getRolesByUserId, getName, exportExcel, expForIot, runTask, getTaskLog, issueType, getTemplateContent, upload } from '@/api/IntegratedConfig'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: IntegratedConfig.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getPage sends GET to /services/fwcore/config', () => {
    getPage({ currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config',
      method: 'get',
      params: { currentPage: 1 }
    })
  })

  describe('submitForm', () => {
    it('POST for new, PUT for existing', () => {
      submitForm({ name: 'cfg' })
      expect(request.mock.calls[0][0].method).toBe('POST')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/config')

      request.mockClear()
      submitForm({ id: '1' })
      expect(request.mock.calls[0][0].method).toBe('PUT')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/config/1')
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
    expect(request.mock.calls[0][0].url).toContain('/services/fwcore/config?')
    expect(request.mock.calls[0][0].method).toBe('DELETE')
  })

  it('singleDelete sends DELETE to /:id', () => {
    singleDelete('c1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config/c1',
      method: 'DELETE'
    })
  })

  it('getIdRow sends GET to /:id', () => {
    getIdRow('c1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config/c1',
      method: 'GET'
    })
  })

  it('getRolesByUserId sends GET to /user/:id', () => {
    getRolesByUserId('u1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config/user/u1',
      method: 'GET'
    })
  })

  it('getName sends GET with params', () => {
    getName({ code: 'x' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config',
      method: 'get',
      params: { code: 'x' }
    })
  })

  it('exportExcel sends GET to /down/:param with blob responseType', () => {
    exportExcel('excel1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config/down/excel1',
      method: 'get',
      data: 'excel1',
      responseType: 'blob'
    })
  })

  it('expForIot sends GET to /down/:type/:id with blob responseType', () => {
    expForIot({ type: 'iot', id: '1' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config/down/iot/1',
      method: 'get',
      data: { type: 'iot', id: '1' },
      responseType: 'blob'
    })
  })

  it('runTask sends POST to /run-task', () => {
    const param = { configId: '1' }
    runTask(param)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config/run-task',
      method: 'post',
      data: param
    })
  })

  it('getTaskLog sends POST to /task/log', () => {
    const param = { configId: '1' }
    getTaskLog(param)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config/task/log',
      method: 'post',
      data: param
    })
  })

  it('issueType sends GET to /send/:id', () => {
    issueType('c1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/config/send/c1',
      method: 'get'
    })
  })

  it('getTemplateContent sends GET to /services/fwcore/template/down/:id', () => {
    getTemplateContent('t1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/template/down/t1',
      method: 'GET'
    })
  })

  it('upload sends POST to /services/fwcore/upload-plugins/:configId', () => {
    const formData = { file: 'data' }
    upload(formData, 'cfg1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/upload-plugins/cfg1',
      method: 'post',
      data: formData
    })
  })
})
