// Mock vue-router before importing the module under test
jest.mock('vue-router', () => {
  const RouterMock = jest.fn(function(options) {
    this.options = options
    this.mode = options.mode
    this.matcher = { addRoutes: jest.fn() }
  })
  RouterMock.prototype.push = jest.fn()
  RouterMock.prototype.replace = jest.fn()
  RouterMock.prototype.go = jest.fn()
  RouterMock.prototype.back = jest.fn()
  return RouterMock
})

// Mock Vue.use to avoid side effects
jest.mock('vue', () => ({
  use: jest.fn()
}))

// Mock @/layout
jest.mock('@/layout', () => ({ name: 'MockLayout' }))

const { constantRoutes, asyncRoutes, resetRouter } = require('@/router/index')
const router = require('@/router/index').default

describe('router/index.js', () => {
  // ---------------------------------------------------------------------------
  // constantRoutes
  // ---------------------------------------------------------------------------
  describe('constantRoutes', () => {
    it('is an array', () => {
      expect(Array.isArray(constantRoutes)).toBe(true)
    })

    it('contains /login route', () => {
      const loginRoute = constantRoutes.find(r => r.path === '/login')
      expect(loginRoute).toBeDefined()
      expect(loginRoute.hidden).toBe(true)
    })

    it('contains /404 route', () => {
      const notFoundRoute = constantRoutes.find(r => r.path === '/404')
      expect(notFoundRoute).toBeDefined()
      expect(notFoundRoute.hidden).toBe(true)
    })

    it('contains /authLogin route', () => {
      const authRoute = constantRoutes.find(r => r.path === '/authLogin')
      expect(authRoute).toBeDefined()
      expect(authRoute.hidden).toBe(true)
    })

    it('contains root / route redirecting to /dashboard', () => {
      const rootRoute = constantRoutes.find(r => r.path === '/')
      expect(rootRoute).toBeDefined()
      expect(rootRoute.redirect).toBe('/dashboard')
      expect(rootRoute.children).toBeDefined()
      expect(rootRoute.children[0].path).toBe('dashboard')
    })
  })

  // ---------------------------------------------------------------------------
  // asyncRoutes
  // ---------------------------------------------------------------------------
  describe('asyncRoutes', () => {
    it('is an array', () => {
      expect(Array.isArray(asyncRoutes)).toBe(true)
    })

    it('contains a catch-all * redirect to /404', () => {
      const catchAll = asyncRoutes.find(r => r.path === '*')
      expect(catchAll).toBeDefined()
      expect(catchAll.redirect).toBe('/404')
    })
  })

  // ---------------------------------------------------------------------------
  // router instance
  // ---------------------------------------------------------------------------
  describe('router instance (default export)', () => {
    it('is defined', () => {
      expect(router).toBeDefined()
    })

    it('uses history mode', () => {
      expect(router.mode).toBe('history')
    })
  })

  // ---------------------------------------------------------------------------
  // resetRouter
  // ---------------------------------------------------------------------------
  describe('resetRouter', () => {
    it('replaces router.matcher with a fresh matcher', () => {
      const originalMatcher = router.matcher
      resetRouter()
      // After reset, matcher should be a new object (not the same reference)
      expect(router.matcher).toBeDefined()
      expect(router.matcher).not.toBe(originalMatcher)
    })
  })
})
