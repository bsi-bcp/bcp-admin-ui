// Mock dependencies before importing the module under test
jest.mock('@/utils/auth', () => ({
  getToken: jest.fn(() => 'initial-token'),
  setToken: jest.fn(),
  removeToken: jest.fn()
}))

jest.mock('@/api/user', () => ({
  login: jest.fn(),
  getUserInfo: jest.fn(),
  logout: jest.fn()
}))

jest.mock('@/router', () => ({
  resetRouter: jest.fn()
}))

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn()
}))

import userModule from '@/store/modules/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, getUserInfo, logout } from '@/api/user'
import { resetRouter } from '@/router'

const { state: stateFactory, mutations, actions } = userModule

// Helper: create a fresh state clone for each test
function freshState() {
  return {
    token: getToken(),
    name: '',
    orgName: '',
    avatar: '',
    roles: [],
    cur_user: {}
  }
}

describe('Store: user module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getToken.mockReturnValue('initial-token')
  })

  // ---- Default state ----

  describe('state defaults', () => {
    it('token is initialised from getToken()', () => {
      expect(stateFactory.token).toBe('initial-token')
    })

    it('name defaults to empty string', () => {
      expect(stateFactory.name).toBe('')
    })

    it('roles defaults to empty array', () => {
      expect(stateFactory.roles).toEqual([])
    })

    it('cur_user defaults to empty object', () => {
      expect(stateFactory.cur_user).toEqual({})
    })
  })

  // ---- Mutations ----

  describe('mutations', () => {
    it('SET_TOKEN updates state.token', () => {
      const s = freshState()
      mutations.SET_TOKEN(s, 'new-token')
      expect(s.token).toBe('new-token')
    })

    it('SET_NAME updates state.name', () => {
      const s = freshState()
      mutations.SET_NAME(s, 'Alice')
      expect(s.name).toBe('Alice')
    })

    it('SET_ORGNAME updates state.orgName', () => {
      const s = freshState()
      mutations.SET_ORGNAME(s, 'Acme Corp')
      expect(s.orgName).toBe('Acme Corp')
    })

    it('SET_AVATAR updates state.avatar', () => {
      const s = freshState()
      mutations.SET_AVATAR(s, 'https://img/avatar.png')
      expect(s.avatar).toBe('https://img/avatar.png')
    })

    it('SET_ROLES updates state.roles', () => {
      const s = freshState()
      mutations.SET_ROLES(s, 'admin')
      expect(s.roles).toBe('admin')
    })

    it('SET_CURUSER updates state.cur_user', () => {
      const s = freshState()
      const user = { id: 1, name: 'Bob' }
      mutations.SET_CURUSER(s, user)
      expect(s.cur_user).toBe(user)
    })
  })

  // ---- Actions ----

  describe('actions', () => {
    let commit

    beforeEach(() => {
      commit = jest.fn()
    })

    // -- login --

    it('login action commits SET_TOKEN and calls setToken on success', async () => {
      login.mockResolvedValue({ msg: 'session-abc' })
      const result = await actions.login({ commit }, { uname: 'admin', password: 'md5hash' })
      expect(login).toHaveBeenCalledWith({ uname: 'admin', password: 'md5hash' })
      expect(commit).toHaveBeenCalledWith('SET_TOKEN', 'session-abc')
      expect(setToken).toHaveBeenCalledWith('session-abc')
      expect(result).toEqual({ msg: 'session-abc' })
    })

    it('login action trims the uname', async () => {
      login.mockResolvedValue({ msg: 'tok' })
      await actions.login({ commit }, { uname: '  admin  ', password: 'pw' })
      expect(login).toHaveBeenCalledWith({ uname: 'admin', password: 'pw' })
    })

    it('login action rejects when API fails', async () => {
      const err = new Error('network error')
      login.mockRejectedValue(err)
      await expect(
        actions.login({ commit }, { uname: 'admin', password: 'pw' })
      ).rejects.toThrow('network error')
    })

    // -- getInfo --

    it('getInfo action commits user data on success', async () => {
      const model = { userType: 'admin', name: 'Alice', orgName: 'Acme' }
      getUserInfo.mockResolvedValue({ model })
      const state = freshState()
      state.token = 'tok-123'
      const result = await actions.getInfo({ commit, state })
      expect(commit).toHaveBeenCalledWith('SET_ROLES', 'admin')
      expect(commit).toHaveBeenCalledWith('SET_NAME', 'Alice')
      expect(commit).toHaveBeenCalledWith('SET_ORGNAME', 'Acme')
      expect(commit).toHaveBeenCalledWith('SET_CURUSER', model)
      expect(result).toBe(model)
    })

    it('getInfo action rejects when model is null', async () => {
      getUserInfo.mockResolvedValue({ model: null })
      const state = freshState()
      await expect(
        actions.getInfo({ commit, state })
      ).rejects.toBe('验证失败, 请重新登录.')
    })

    it('getInfo action rejects when userType is empty', async () => {
      getUserInfo.mockResolvedValue({ model: { userType: '', name: 'X', orgName: 'Y' } })
      const state = freshState()
      await expect(
        actions.getInfo({ commit, state })
      ).rejects.toBe('getInfo: user type must be a non-null string!')
    })

    // -- logout --

    it('logout action clears token and roles, removes cookie, resets router', async () => {
      logout.mockResolvedValue()
      const state = freshState()
      state.token = 'tok'
      await actions.logout({ commit, state })
      expect(commit).toHaveBeenCalledWith('SET_TOKEN', '')
      expect(commit).toHaveBeenCalledWith('SET_ROLES', [])
      expect(removeToken).toHaveBeenCalled()
      expect(resetRouter).toHaveBeenCalled()
    })

    it('logout action rejects when API fails', async () => {
      const err = new Error('logout failed')
      logout.mockRejectedValue(err)
      const state = freshState()
      await expect(
        actions.logout({ commit, state })
      ).rejects.toThrow('logout failed')
    })

    // -- resetToken --

    it('resetToken action clears token/roles and removes cookie', async () => {
      await actions.resetToken({ commit })
      expect(commit).toHaveBeenCalledWith('SET_TOKEN', '')
      expect(commit).toHaveBeenCalledWith('SET_ROLES', [])
      expect(removeToken).toHaveBeenCalled()
    })
  })

  // ---- Module config ----

  it('module is namespaced', () => {
    expect(userModule.namespaced).toBe(true)
  })
})
