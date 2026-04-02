import { getPage, submitForm, submitAllocationForm, batchDelete, getSourceTypeOptions, getTenants, getComputers, getTypes } from '@/api/task'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })
jest.mock('@/api/common.js', () => ({
  splitArr: (arr, sep) => arr.join(sep)
}))

describe('API: task.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getPage sends GET to /services/fwcore/task', () => {
    getPage({ currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/task',
      method: 'get',
      params: { currentPage: 1 }
    })
  })

  describe('submitForm', () => {
    it('post for new, put for existing', () => {
      submitForm({ name: 'task' })
      expect(request.mock.calls[0][0].method).toBe('POST')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/task')

      request.mockClear()
      submitForm({ id: '1' })
      expect(request.mock.calls[0][0].method).toBe('PUT')
      expect(request.mock.calls[0][0].url).toBe('/services/fwcore/task/1')
    })
  })

  it('submitAllocationForm sends POST array to /services/fwcore//allocationTask', () => {
    submitAllocationForm({ items: ['t1', 't2'], tenantId: 'tn1', computerId: 'c1' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore//allocationTask',
      method: 'post',
      data: [
        { taskId: 't1', tenantId: 'tn1', computerId: 'c1' },
        { taskId: 't2', tenantId: 'tn1', computerId: 'c1' }
      ]
    })
  })

  it('batchDelete uses splitArr and sends DELETE with items= param', () => {
    batchDelete({ items: ['1', '2'] })
    const url = request.mock.calls[0][0].url
    expect(url).toBe('/services/fwcore/task?items=1,2')
    expect(request.mock.calls[0][0].method).toBe('DELETE')
  })

  it('getSourceTypeOptions sends GET with code query', () => {
    getSourceTypeOptions('STATUS')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/props/getPropListByPropCode?code=STATUS',
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

  it('getComputers sends GET to /services/fwcore/getFrontComputerByTenantId/:id', () => {
    getComputers('tn1')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/getFrontComputerByTenantId/tn1',
      method: 'get'
    })
  })

  it('getTypes sends GET to /services/fwcore/taskTypes', () => {
    getTypes()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/taskTypes',
      method: 'get'
    })
  })
})
