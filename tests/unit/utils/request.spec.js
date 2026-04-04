// ---------------------------------------------------------------------------
// Tests for src/utils/request.js — Axios instance with interceptors
// ---------------------------------------------------------------------------
// Strategy: We mock axios.create to return a fake instance whose interceptors
// we can capture and invoke manually. This lets us test request/response
// interceptor logic in isolation without real HTTP calls.
//
// Jest 23 compatibility: no jest.isolateModules, so we capture interceptors
// from the initial module evaluation and test them directly.
// ---------------------------------------------------------------------------

const mockMessage = jest.fn()
const mockRouterPush = jest.fn()
const mockDispatch = jest.fn(() => Promise.resolve())

// Holders for captured interceptor callbacks (prefixed with mock for jest-hoist)
let mockReqFulfill, mockReqReject
let mockResFulfill, mockResReject

const mockReqUse = jest.fn((ful, rej) => { mockReqFulfill = ful; mockReqReject = rej })
const mockResUse = jest.fn((ful, rej) => { mockResFulfill = ful; mockResReject = rej })

const mockInstance = {
  interceptors: {
    request: { use: mockReqUse },
    response: { use: mockResUse }
  }
}

const mockCreate = jest.fn(() => mockInstance)

jest.mock('axios', () => ({
  create: mockCreate
}))

jest.mock('element-ui', () => ({
  Message: mockMessage
}))

jest.mock('@/store', () => ({
  getters: {},
  dispatch: (...args) => mockDispatch(...args)
}))

jest.mock('@/router', () => ({
  push: (...args) => mockRouterPush(...args)
}))

// Import after mocks — this triggers module-level code that calls
// axios.create() and registers interceptors
require('@/utils/request')

const store = require('@/store')

describe('Utils:request', () => {
  beforeEach(() => {
    mockMessage.mockClear()
    mockRouterPush.mockClear()
    mockDispatch.mockClear().mockImplementation(() => Promise.resolve())
  })

  // ---------- axios.create configuration ----------

  describe('axios instance creation', () => {
    it('creates instance with correct baseURL from env', () => {
      const opts = mockCreate.mock.calls[0][0]
      expect(opts).toHaveProperty('baseURL', process.env.VUE_APP_BASE_API)
    })

    it('sets timeout to 15000ms', () => {
      const opts = mockCreate.mock.calls[0][0]
      expect(opts.timeout).toBe(15000)
    })

    it('enables withCredentials', () => {
      const opts = mockCreate.mock.calls[0][0]
      expect(opts.withCredentials).toBe(true)
    })

    it('registers exactly one request interceptor', () => {
      expect(mockReqUse).toHaveBeenCalledTimes(1)
    })

    it('registers exactly one response interceptor', () => {
      expect(mockResUse).toHaveBeenCalledTimes(1)
    })
  })

  // ---------- Request interceptor ----------

  describe('request interceptor', () => {
    it('injects b-token header when token exists', () => {
      store.getters.token = 'test-token-123'
      const config = { headers: {} }
      const result = mockReqFulfill(config)
      expect(result.headers['b-token']).toBe(encodeURIComponent('test-token-123'))
    })

    it('URL-encodes the token value', () => {
      store.getters.token = 'abc def+ghi'
      const config = { headers: {} }
      mockReqFulfill(config)
      expect(config.headers['b-token']).toBe('abc%20def%2Bghi')
    })

    it('does not inject b-token header when token is empty', () => {
      store.getters.token = ''
      const config = { headers: {} }
      const result = mockReqFulfill(config)
      expect(result.headers['b-token']).toBeUndefined()
    })

    it('does not inject b-token header when token is undefined', () => {
      store.getters.token = undefined
      const config = { headers: {} }
      const result = mockReqFulfill(config)
      expect(result.headers['b-token']).toBeUndefined()
    })

    it('returns config object for chaining', () => {
      store.getters.token = ''
      const config = { headers: {} }
      expect(mockReqFulfill(config)).toBe(config)
    })

    it('rejects with error on request error', async() => {
      const err = new Error('request setup failed')
      await expect(mockReqReject(err)).rejects.toThrow('request setup failed')
    })
  })

  // ---------- Response interceptor — success path ----------

  describe('response interceptor (fulfilled)', () => {
    it('returns response.data for normal (non-error-code) responses', async() => {
      const response = { data: { code: 200, data: [1, 2, 3] } }
      const result = await mockResFulfill(response)
      expect(result).toEqual({ code: 200, data: [1, 2, 3] })
    })

    it('handles code 403 — resets token and redirects to /login', async() => {
      const response = { data: { code: 403 } }
      await expect(mockResFulfill(response)).rejects.toThrow('unauthorized')
      expect(mockDispatch).toHaveBeenCalledWith('user/resetToken')
      expect(mockRouterPush).toHaveBeenCalledWith('/login')
    })

    it('handles code 552 — shows password expired warning', async() => {
      const response = { data: { code: 552 } }
      await expect(mockResFulfill(response)).rejects.toThrow('password expired')
      expect(mockMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '密码已过期，请修改密码后重新登录',
          type: 'warning',
          duration: 5000
        })
      )
    })

    it('handles code 552 — resets token and redirects', async() => {
      const response = { data: { code: 552 } }
      await expect(mockResFulfill(response)).rejects.toThrow('password expired')
      expect(mockDispatch).toHaveBeenCalledWith('user/resetToken')
      expect(mockRouterPush).toHaveBeenCalledWith('/login')
    })

    it('handles code 550 — shows error message from res.message', async() => {
      const response = { data: { code: 550, message: 'biz error' } }
      await expect(mockResFulfill(response)).rejects.toThrow('biz error')
      expect(mockMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'biz error',
          type: 'error',
          duration: 5000
        })
      )
    })

    it('handles code 550 — falls back to res.msg when message is absent', async() => {
      const response = { data: { code: 550, msg: 'fallback msg' } }
      await expect(mockResFulfill(response)).rejects.toThrow('fallback msg')
      expect(mockMessage).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'fallback msg' })
      )
    })
  })

  // ---------- Response interceptor — error path ----------

  describe('response interceptor (rejected)', () => {
    it('handles Network Error — resets token and redirects', async() => {
      const err = new Error('Network Error')
      await expect(mockResReject(err)).rejects.toThrow('Network Error')
      expect(mockDispatch).toHaveBeenCalledWith('user/resetToken')
      expect(mockRouterPush).toHaveBeenCalledWith('/login')
    })

    it('handles HTTP 403 status — resets token and redirects', async() => {
      const err = new Error('Request failed')
      err.response = { status: 403 }
      await expect(mockResReject(err)).rejects.toBe(err)
      expect(mockDispatch).toHaveBeenCalledWith('user/resetToken')
      expect(mockRouterPush).toHaveBeenCalledWith('/login')
    })

    it('shows generic error Message for other errors', async() => {
      const err = new Error('timeout of 15000ms exceeded')
      await expect(mockResReject(err)).rejects.toBe(err)
      expect(mockMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'timeout of 15000ms exceeded',
          type: 'error',
          duration: 3000
        })
      )
    })

    it('does not show Message for Network Error (redirects instead)', async() => {
      const err = new Error('Network Error')
      try { await mockResReject(err) } catch (e) { /* expected */ }
      // Message should NOT be called for network errors — only redirect
      expect(mockMessage).not.toHaveBeenCalled()
    })
  })
})
