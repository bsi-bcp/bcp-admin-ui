jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn()
}))

import Cookies from 'js-cookie'
import appModule from '@/store/modules/app'

const { mutations, actions } = appModule

function freshState() {
  return {
    sidebar: {
      opened: true,
      withoutAnimation: false
    },
    device: 'desktop'
  }
}

describe('Store: app module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ---- State defaults ----

  describe('state defaults', () => {
    it('sidebar.opened defaults to true when no cookie', () => {
      Cookies.get.mockReturnValue(undefined)
      jest.resetModules()
      jest.mock('js-cookie', () => ({
        get: jest.fn(() => undefined),
        set: jest.fn(),
        remove: jest.fn()
      }))
      const mod = require('@/store/modules/app').default
      expect(mod.state.sidebar.opened).toBe(true)
    })

    it('device defaults to desktop', () => {
      expect(appModule.state.device).toBe('desktop')
    })
  })

  // ---- Mutations ----

  describe('TOGGLE_SIDEBAR', () => {
    it('toggles opened from true to false and sets cookie to 0', () => {
      const state = freshState()
      mutations.TOGGLE_SIDEBAR(state)
      expect(state.sidebar.opened).toBe(false)
      expect(state.sidebar.withoutAnimation).toBe(false)
      expect(Cookies.set).toHaveBeenCalledWith('sidebarStatus', 0)
    })

    it('toggles opened from false to true and sets cookie to 1', () => {
      const state = freshState()
      state.sidebar.opened = false
      mutations.TOGGLE_SIDEBAR(state)
      expect(state.sidebar.opened).toBe(true)
      expect(Cookies.set).toHaveBeenCalledWith('sidebarStatus', 1)
    })
  })

  describe('CLOSE_SIDEBAR', () => {
    it('closes sidebar and respects withoutAnimation flag', () => {
      const state = freshState()
      mutations.CLOSE_SIDEBAR(state, true)
      expect(state.sidebar.opened).toBe(false)
      expect(state.sidebar.withoutAnimation).toBe(true)
      expect(Cookies.set).toHaveBeenCalledWith('sidebarStatus', 0)
    })
  })

  describe('TOGGLE_DEVICE', () => {
    it('sets device to the given value', () => {
      const state = freshState()
      mutations.TOGGLE_DEVICE(state, 'mobile')
      expect(state.device).toBe('mobile')
    })
  })

  // ---- Actions ----

  describe('actions', () => {
    let commit

    beforeEach(() => {
      commit = jest.fn()
    })

    it('toggleSideBar commits TOGGLE_SIDEBAR', () => {
      actions.toggleSideBar({ commit })
      expect(commit).toHaveBeenCalledWith('TOGGLE_SIDEBAR')
    })

    it('closeSideBar commits CLOSE_SIDEBAR with withoutAnimation', () => {
      actions.closeSideBar({ commit }, { withoutAnimation: true })
      expect(commit).toHaveBeenCalledWith('CLOSE_SIDEBAR', true)
    })

    it('toggleDevice commits TOGGLE_DEVICE with device value', () => {
      actions.toggleDevice({ commit }, 'mobile')
      expect(commit).toHaveBeenCalledWith('TOGGLE_DEVICE', 'mobile')
    })
  })

  // ---- Module config ----

  it('module is namespaced', () => {
    expect(appModule.namespaced).toBe(true)
  })
})
