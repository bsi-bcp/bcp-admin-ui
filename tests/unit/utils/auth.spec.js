import Cookies from 'js-cookie'
import { getToken, setToken, removeToken } from '@/utils/auth'

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn()
}))

describe('Utils: auth.js', () => {
  beforeEach(() => {
    Cookies.get.mockClear()
    Cookies.set.mockClear()
    Cookies.remove.mockClear()
  })

  // ---- getToken ----

  it('getToken reads from cookie with key VSESSIONID', () => {
    Cookies.get.mockReturnValue('test-token-123')
    const token = getToken()
    expect(Cookies.get).toHaveBeenCalledWith('VSESSIONID')
    expect(token).toBe('test-token-123')
  })

  it('getToken returns undefined when cookie is not set', () => {
    Cookies.get.mockReturnValue(undefined)
    const token = getToken()
    expect(Cookies.get).toHaveBeenCalledWith('VSESSIONID')
    expect(token).toBeUndefined()
  })

  // ---- setToken (production) ----

  it('setToken in production sets secure and sameSite flags', () => {
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      setToken('prod-token')
      expect(Cookies.set).toHaveBeenCalledWith('VSESSIONID', 'prod-token', {
        secure: true,
        sameSite: 'Strict'
      })
    } finally {
      process.env.NODE_ENV = origEnv
    }
  })

  it('setToken in production passes the token value correctly', () => {
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      setToken('another-token')
      expect(Cookies.set.mock.calls[0][1]).toBe('another-token')
    } finally {
      process.env.NODE_ENV = origEnv
    }
  })

  // ---- setToken (development) ----

  it('setToken in development does not set secure flag', () => {
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    try {
      setToken('dev-token')
      expect(Cookies.set).toHaveBeenCalledWith('VSESSIONID', 'dev-token')
    } finally {
      process.env.NODE_ENV = origEnv
    }
  })

  it('setToken in test env does not set secure flag', () => {
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'test'
    try {
      setToken('test-token')
      expect(Cookies.set).toHaveBeenCalledWith('VSESSIONID', 'test-token')
    } finally {
      process.env.NODE_ENV = origEnv
    }
  })

  // ---- removeToken ----

  it('removeToken removes the VSESSIONID cookie', () => {
    removeToken()
    expect(Cookies.remove).toHaveBeenCalledWith('VSESSIONID')
  })

  it('removeToken is called exactly once', () => {
    removeToken()
    expect(Cookies.remove).toHaveBeenCalledTimes(1)
  })
})
