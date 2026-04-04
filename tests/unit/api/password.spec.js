const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

import { getDetail, getLicDetail, submitFormEdit } from '@/api/password'

describe('API: password.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getDetail sends GET to /services/fwcore/PasswordStrategy/info', () => {
    getDetail()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/PasswordStrategy/info',
      method: 'GET'
    })
  })

  it('getLicDetail sends GET to /services/fwcore/PasswordStrategy/license', () => {
    getLicDetail()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/PasswordStrategy/license',
      method: 'GET'
    })
  })

  it('submitFormEdit sends PUT with data', () => {
    const data = { minLength: 8, maxLength: 20 }
    submitFormEdit(data)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/PasswordStrategy',
      method: 'PUT',
      data: { minLength: 8, maxLength: 20 }
    })
  })

  it('submitFormEdit sends PUT without extra params', () => {
    submitFormEdit({})
    const call = request.mock.calls[0][0]
    expect(call.method).toBe('PUT')
    expect(call.url).toBe('/services/fwcore/PasswordStrategy')
    expect(call.data).toEqual({})
  })
})
