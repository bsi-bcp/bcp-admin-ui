import { ssoLogin } from '@/api/ssoLogin'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: ssoLogin.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  describe('ssoLogin', () => {
    it('sends GET to /authLogin', () => {
      ssoLogin({ token: 'abc123' })
      expect(request).toHaveBeenCalledWith({
        url: '/authLogin',
        method: 'get',
        params: { token: 'abc123' }
      })
    })

    it('passes params correctly', () => {
      const params = { token: 'xyz', redirect: '/home' }
      ssoLogin(params)
      expect(request).toHaveBeenCalledWith({
        url: '/authLogin',
        method: 'get',
        params
      })
    })

    it('works with empty params', () => {
      ssoLogin({})
      expect(request).toHaveBeenCalledWith({
        url: '/authLogin',
        method: 'get',
        params: {}
      })
    })
  })
})
