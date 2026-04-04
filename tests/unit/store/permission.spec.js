import { filterAsyncRoutes } from '@/store/modules/permission'

// Mock @/router — constantRoutes used by SET_ROUTES mutation
const mockConstantRoutes = [
  { path: '/login', hidden: true },
  { path: '/404', hidden: true }
]
jest.mock('@/router', () => ({
  constantRoutes: [
    { path: '/login', hidden: true },
    { path: '/404', hidden: true }
  ]
}))

// Mock @/layout — used as component for menu routes
jest.mock('@/layout', () => ({ name: 'MockLayout' }))

// Obtain the store module (after mocks are in place)
const permissionModule = require('@/store/modules/permission').default

describe('store/modules/permission.js', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  describe('state defaults', () => {
    it('routes is an empty array', () => {
      expect(permissionModule.state.routes).toEqual([])
    })

    it('addRoutes is an empty array', () => {
      expect(permissionModule.state.addRoutes).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------
  describe('SET_ROUTES mutation', () => {
    it('sets addRoutes to the given routes', () => {
      const state = { routes: [], addRoutes: [] }
      const newRoutes = [{ path: '/foo' }]
      permissionModule.mutations.SET_ROUTES(state, newRoutes)
      expect(state.addRoutes).toEqual(newRoutes)
    })

    it('merges constantRoutes with given routes', () => {
      const state = { routes: [], addRoutes: [] }
      const newRoutes = [{ path: '/bar' }]
      permissionModule.mutations.SET_ROUTES(state, newRoutes)
      expect(state.routes).toEqual([...mockConstantRoutes, ...newRoutes])
    })

    it('handles empty routes array', () => {
      const state = { routes: [], addRoutes: [] }
      permissionModule.mutations.SET_ROUTES(state, [])
      expect(state.routes).toEqual(mockConstantRoutes)
      expect(state.addRoutes).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // filterAsyncRoutes
  // ---------------------------------------------------------------------------
  describe('filterAsyncRoutes', () => {
    it('returns all routes when no meta.roles defined', () => {
      const routes = [
        { path: '/a' },
        { path: '/b', meta: { title: 'B' } }
      ]
      const result = filterAsyncRoutes(routes, ['admin'])
      expect(result).toHaveLength(2)
    })

    it('filters out routes whose roles do not match', () => {
      const routes = [
        { path: '/admin', meta: { roles: ['admin'] } },
        { path: '/editor', meta: { roles: ['editor'] } }
      ]
      const result = filterAsyncRoutes(routes, ['admin'])
      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('/admin')
    })

    it('recursively filters children', () => {
      const routes = [
        {
          path: '/parent',
          meta: { roles: ['admin'] },
          children: [
            { path: 'child1', meta: { roles: ['admin'] } },
            { path: 'child2', meta: { roles: ['editor'] } }
          ]
        }
      ]
      const result = filterAsyncRoutes(routes, ['admin'])
      expect(result).toHaveLength(1)
      expect(result[0].children).toHaveLength(1)
      expect(result[0].children[0].path).toBe('child1')
    })

    it('returns empty array when no routes match', () => {
      const routes = [
        { path: '/x', meta: { roles: ['superadmin'] } }
      ]
      const result = filterAsyncRoutes(routes, ['guest'])
      expect(result).toHaveLength(0)
    })
  })

  // ---------------------------------------------------------------------------
  // generateRoutes action
  // ---------------------------------------------------------------------------
  describe('generateRoutes action', () => {
    let commit
    let committed

    beforeEach(() => {
      committed = []
      commit = jest.fn((type, payload) => { committed.push({ type, payload }) })
    })

    it('returns empty routes for null menus', async() => {
      const routes = await permissionModule.actions.generateRoutes({ commit }, null)
      expect(routes).toEqual([])
      expect(commit).toHaveBeenCalledWith('SET_ROUTES', [])
    })

    it('returns empty routes for empty menus array', async() => {
      const routes = await permissionModule.actions.generateRoutes({ commit }, [])
      expect(routes).toEqual([])
      expect(commit).toHaveBeenCalledWith('SET_ROUTES', [])
    })

    it('generates routes for menus without children', async() => {
      const menus = [
        { code: 'dashboard', name: 'Dashboard', url: 'dashboard/index' }
      ]
      const routes = await permissionModule.actions.generateRoutes({ commit }, menus)
      expect(routes).toHaveLength(1)
      expect(routes[0].path).toBe('/dashboard')
      expect(routes[0].meta.title).toBe('Dashboard')
      // Should have a single child with empty path
      expect(routes[0].children).toHaveLength(1)
      expect(routes[0].children[0].path).toBe('')
    })

    it('generates routes for menus with children', async() => {
      const menus = [
        {
          code: 'system',
          name: 'System',
          url: 'system/index',
          children: [
            { code: 'user', name: 'User', url: 'system/user/index' },
            { code: 'role', name: 'Role', url: 'system/role/index' }
          ]
        }
      ]
      const routes = await permissionModule.actions.generateRoutes({ commit }, menus)
      expect(routes).toHaveLength(1)
      expect(routes[0].path).toBe('/system')
      expect(routes[0].children).toHaveLength(2)
      expect(routes[0].children[0].path).toBe('user')
      expect(routes[0].children[0].meta.title).toBe('User')
      expect(routes[0].children[1].path).toBe('role')
    })

    it('commits SET_ROUTES with generated routes', async() => {
      const menus = [
        { code: 'test', name: 'Test', url: 'test/index' }
      ]
      const routes = await permissionModule.actions.generateRoutes({ commit }, menus)
      expect(commit).toHaveBeenCalledWith('SET_ROUTES', routes)
    })
  })

  // ---------------------------------------------------------------------------
  // Module meta
  // ---------------------------------------------------------------------------
  describe('module definition', () => {
    it('is namespaced', () => {
      expect(permissionModule.namespaced).toBe(true)
    })
  })
})
