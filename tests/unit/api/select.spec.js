const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

import { getProplist, getFreelist } from '@/api/select'

describe('API: select.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('getProplist sends GET with code in URL and group in params', () => {
    getProplist({ code: 'STATUS', group: 'sys' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/prop/STATUS/proplists',
      method: 'get',
      params: { group: 'sys' }
    })
  })

  it('getFreelist sends GET with code in URL and params in query', () => {
    getFreelist({ code: 'CITY', params: 'province=GD' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/freelists/CITY/freelist',
      method: 'get',
      params: { params: 'province=GD' }
    })
  })

  it('getProplist handles undefined group gracefully', () => {
    getProplist({ code: 'TYPE' })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/prop/TYPE/proplists',
      method: 'get',
      params: { group: undefined }
    })
  })
})
