// ---------------------------------------------------------------------------
// Tests for src/permission.js — Vue Router navigation guards
// ---------------------------------------------------------------------------
// Strategy: We mock the router, store, auth, and NProgress modules, then
// import permission.js to capture the beforeEach/afterEach callbacks.
// We invoke those callbacks manually with controlled (to, from, next) args.
// ---------------------------------------------------------------------------

const mockNext = jest.fn()
const mockNProgressStart = jest.fn()
const mockNProgressDone = jest.fn()
const mockNProgressConfigure = jest.fn()
const mockMessageError = jest.fn()
const mockGetToken = jest.fn()
const mockDispatch = jest.fn()
const mockAddRoutes = jest.fn()

let beforeEachGuard
let afterEachGuard

jest.mock('@/router', () => {
  const router = {
    beforeEach: jest.fn(fn => { beforeEachGuard = fn }),
    afterEach: jest.fn(fn => { afterEachGuard = fn }),
    addRoutes: (...args) => mockAddRoutes(...args)
  }
  return { default: router, __esModule: true, ...router }
})

jest.mock('@/store', () => ({
  getters: {},
  dispatch: (...args) => mockDispatch(...args)
}))

jest.mock('element-ui', () => ({
  Message: { error: (...args) => mockMessageError(...args) }
}))

jest.mock('@/utils/auth', () => ({
  getToken: () => mockGetToken()
}))

jest.mock('@/utils/get-page-title', () => jest.fn(title => title ? `${title} - BCP` : 'BCP'))

jest.mock('nprogress', () => ({
  configure: (...args) => mockNProgressConfigure(...args),
  start: (...args) => mockNProgressStart(...args),
  done: (...args) => mockNProgressDone(...args)
}))

jest.mock('nprogress/nprogress.css', () => {})

const store = require('@/store')

// Import permission.js to register the guards
require('@/permission')

// Capture module-init calls before any beforeEach can clearAllMocks
const mockNProgressConfigureCallArgs = mockNProgressConfigure.mock.calls.slice()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createTo(path, meta) {
  return { path, meta: meta || {} }
}
const fromRoute = { path: '/some-page' }

describe('permission.js — router guards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store getters to defaults
    store.getters.roles = undefined
    store.getters.token = undefined
    // Ensure document.title exists
    document.title = ''
  })

  // ---------- Guard registration ----------

  it('registers beforeEach guard on the router', () => {
    expect(typeof beforeEachGuard).toBe('function')
  })

  it('registers afterEach guard on the router', () => {
    expect(typeof afterEachGuard).toBe('function')
  })

  it('configures NProgress with showSpinner false', () => {
    // NProgress.configure is called at module load time, captured before clearAllMocks
    expect(mockNProgressConfigureCallArgs).toEqual([[{ showSpinner: false }]])
  })

  // ---------- Has token, non-whitelist path ----------

  describe('with token (non-whitelist path)', () => {
    beforeEach(() => {
      mockGetToken.mockReturnValue('valid-token')
    })

    it('proceeds directly if roles are already loaded', async() => {
      store.getters.roles = ['admin']
      await beforeEachGuard(createTo('/dashboard'), fromRoute, mockNext)
      expect(mockNext).toHaveBeenCalledWith()
      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('fetches user info and generates routes when roles are not loaded', async() => {
      store.getters.roles = undefined
      const fakeMenus = [{ path: '/foo' }]
      const fakeRoutes = [{ path: '/foo', component: {} }]
      mockDispatch
        .mockResolvedValueOnce({ menus: fakeMenus }) // user/getInfo
        .mockResolvedValueOnce(fakeRoutes)            // permission/generateRoutes

      await beforeEachGuard(createTo('/dashboard'), fromRoute, mockNext)

      expect(mockDispatch).toHaveBeenCalledWith('user/getInfo')
      expect(mockDispatch).toHaveBeenCalledWith('permission/generateRoutes', fakeMenus)
      expect(mockAddRoutes).toHaveBeenCalledWith(fakeRoutes)
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        path: '/dashboard',
        replace: true
      }))
    })

    it('resets token and redirects to /login when getInfo fails', async() => {
      store.getters.roles = undefined
      mockDispatch
        .mockRejectedValueOnce('session expired') // user/getInfo fails
        .mockResolvedValueOnce()                   // user/resetToken

      await beforeEachGuard(createTo('/dashboard'), fromRoute, mockNext)

      expect(mockDispatch).toHaveBeenCalledWith('user/resetToken')
      expect(mockNext).toHaveBeenCalledWith('/login?redirect=/dashboard')
      expect(mockNProgressDone).toHaveBeenCalled()
    })

    it('shows error message when getInfo fails', async() => {
      store.getters.roles = undefined
      mockDispatch
        .mockRejectedValueOnce('some error')
        .mockResolvedValueOnce()

      await beforeEachGuard(createTo('/settings'), fromRoute, mockNext)

      expect(mockMessageError).toHaveBeenCalledWith('some error')
    })

    it('fetches routes when roles is empty array', async() => {
      store.getters.roles = []
      const fakeMenus = []
      const fakeRoutes = []
      mockDispatch
        .mockResolvedValueOnce({ menus: fakeMenus })
        .mockResolvedValueOnce(fakeRoutes)

      await beforeEachGuard(createTo('/dashboard'), fromRoute, mockNext)

      expect(mockDispatch).toHaveBeenCalledWith('user/getInfo')
    })
  })

  // ---------- Has token, whitelist path (login) ----------

  describe('with token and whitelist path', () => {
    beforeEach(() => {
      mockGetToken.mockReturnValue('valid-token')
    })

    it('calls next() when accessing /login (token + whitelist path)', async() => {
      // The code checks: hasToken && whiteList.indexOf(to.path) < 0
      // If to.path is in whitelist, the outer condition is false, so we go to else branch
      // Actually re-reading: if hasToken && whiteList.indexOf(to.path) < 0 → NOT in whitelist
      // If in whitelist: goes to else branch (no token path)
      // But whitelist items with token: whitelist check passes, next() is called
      await beforeEachGuard(createTo('/login'), fromRoute, mockNext)

      // Since /login IS in whitelist, whiteList.indexOf('/login') is NOT < 0,
      // so the outer if is false → goes to else branch → whitelist check → next()
      expect(mockNext).toHaveBeenCalledWith()
    })
  })

  // ---------- No token ----------

  describe('without token', () => {
    beforeEach(() => {
      mockGetToken.mockReturnValue(null)
    })

    it('allows navigation to /login (whitelist)', async() => {
      await beforeEachGuard(createTo('/login'), fromRoute, mockNext)
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('allows navigation to /404 (whitelist)', async() => {
      await beforeEachGuard(createTo('/404'), fromRoute, mockNext)
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('allows navigation to /authLogin (whitelist)', async() => {
      await beforeEachGuard(createTo('/authLogin'), fromRoute, mockNext)
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('allows navigation to /bcp-api/ paths (backend proxy)', async() => {
      await beforeEachGuard(createTo('/bcp-api/services/test'), fromRoute, mockNext)
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('redirects to /login for non-whitelist routes', async() => {
      await beforeEachGuard(createTo('/dashboard'), fromRoute, mockNext)
      expect(mockNext).toHaveBeenCalledWith('/login?redirect=/dashboard')
      expect(mockNProgressDone).toHaveBeenCalled()
    })

    it('redirects to /login for /settings', async() => {
      await beforeEachGuard(createTo('/settings'), fromRoute, mockNext)
      expect(mockNext).toHaveBeenCalledWith('/login?redirect=/settings')
    })
  })

  // ---------- NProgress ----------

  describe('NProgress lifecycle', () => {
    it('starts NProgress on every navigation', async() => {
      mockGetToken.mockReturnValue(null)
      await beforeEachGuard(createTo('/login'), fromRoute, mockNext)
      expect(mockNProgressStart).toHaveBeenCalled()
    })

    it('afterEach calls NProgress.done', () => {
      afterEachGuard()
      expect(mockNProgressDone).toHaveBeenCalled()
    })
  })

  // ---------- Page title ----------

  describe('page title', () => {
    it('sets document.title from route meta.title', async() => {
      mockGetToken.mockReturnValue(null)
      await beforeEachGuard(createTo('/login', { title: 'Login' }), fromRoute, mockNext)
      expect(document.title).toBe('Login - BCP')
    })

    it('uses default title when meta.title is absent', async() => {
      mockGetToken.mockReturnValue(null)
      await beforeEachGuard(createTo('/login', {}), fromRoute, mockNext)
      expect(document.title).toBe('BCP')
    })
  })
})
