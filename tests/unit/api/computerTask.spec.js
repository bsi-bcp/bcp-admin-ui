const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })
jest.mock('@/api/common.js', () => ({
  splitArr: (arr, sep) => arr.join(sep)
}))

import {
  getPage, submitForm, submitAllocationForm, batchDelete,
  getPlanOptions, getTenants, getComputers, getSourceTypeOptions, batchSendTask
} from '@/api/computerTask'

describe('API: computerTask.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getPage sends GET to /services/fwcore/frontcomputertask', () => {
    getPage({ currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/frontcomputertask',
      method: 'get',
      params: { currentPage: 1 }
    })
  })

  describe('submitForm (from CRUD factory, menuArr disabled)', () => {
    it('POST for new record', () => {
      submitForm({ name: 'task1' })
      expect(request.mock.calls[0][0].method).toBe('POST')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/frontcomputertask')
    })

    it('PUT for existing record', () => {
      submitForm({ id: '10', name: 'task1' })
      expect(request.mock.calls[0][0].method).toBe('PUT')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/frontcomputertask/10')
    })
  })

  it('submitAllocationForm posts array of allocation items', () => {
    submitAllocationForm({ items: ['t1', 't2'], tenantId: 'tn1', computerId: 'c1' })
    const call = request.mock.calls[0][0]
    expect(call.method).toBe('post')
    expect(call.url).toBe('/services/fwcore//allocationTask')
    expect(call.data).toEqual([
      { taskId: 't1', tenantId: 'tn1', computerId: 'c1' },
      { taskId: 't2', tenantId: 'tn1', computerId: 'c1' }
    ])
  })

  it('batchDelete uses splitArr and sends DELETE', () => {
    batchDelete({ items: ['1', '2'] })
    const call = request.mock.calls[0][0]
    expect(call.url).toBe('/services/fwcore/frontcomputertask?items=1,2')
    expect(call.method).toBe('DELETE')
  })

  it('getPlanOptions sends GET with code param', () => {
    getPlanOptions('PLAN_TYPE')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/props/getPropListByPropCode?code=PLAN_TYPE',
      method: 'get'
    })
  })

  it('getTenants sends GET to /services/fwcore/orgClasses', () => {
    getTenants()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/orgClasses',
      method: 'get'
    })
  })

  it('getComputers sends GET with tenantId', () => {
    getComputers('tn99')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/getFrontComputerByTenantId/tn99',
      method: 'get'
    })
  })

  it('batchSendTask sends POST with ids', () => {
    batchSendTask('1,2,3')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/batchSendTask?ids=1,2,3',
      method: 'post'
    })
  })
})
