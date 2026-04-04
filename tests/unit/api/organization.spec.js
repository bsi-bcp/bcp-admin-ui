const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

import { orgTree, updateOrganization, delOrganization } from '@/api/organization'

describe('API: organization.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('orgTree sends GET to /services/fwcore/organizations/tree', () => {
    orgTree()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/organizations/tree',
      method: 'get'
    })
  })

  it('updateOrganization sends POST for new record (no id)', () => {
    updateOrganization({ name: 'Dept A' })
    const call = request.mock.calls[0][0]
    expect(call.method).toBe('POST')
    expect(call.url).toBe('/services/fwcore/organizations')
    expect(call.data).toEqual({ name: 'Dept A' })
  })

  it('updateOrganization sends PUT for existing record (has id)', () => {
    updateOrganization({ id: '5', name: 'Dept B' })
    const call = request.mock.calls[0][0]
    expect(call.method).toBe('PUT')
    expect(call.url).toBe('/services/fwcore/organizations/5')
    expect(call.data).toEqual({ id: '5', name: 'Dept B' })
  })

  it('delOrganization sends DELETE with id in URL', () => {
    delOrganization('7')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/organizations/7',
      method: 'DELETE'
    })
  })
})
