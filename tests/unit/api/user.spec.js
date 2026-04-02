import { login, getUserInfo, logout, getUserList, submitFormAdd, submitFormEdit, getOrgList, batchDelete, batchLocked, batchUnLocked, batchResetPsd, syncUser, getCurUser, modifyPassword } from '@/api/user'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: user.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('login sends POST to /services/fwcore/login', () => {
    const data = { uname: 'admin', password: 'md5hash' }
    login(data)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/login',
      method: 'post',
      data
    })
  })

  it('getUserInfo sends GET to /services/fwcore/users/login-user', () => {
    getUserInfo()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/users/login-user',
      method: 'get'
    })
  })

  it('logout sends DELETE to /services/fwcore/login', () => {
    logout()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/login',
      method: 'delete'
    })
  })

  it('getUserList sends GET to /services/fwcore/users/pages/', () => {
    getUserList({ orgId: '1', currentPage: 1 })
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/users/pages/',
      method: 'GET',
      params: { orgId: '1', currentPage: 1 }
    })
  })

  it('submitFormAdd sends POST to /services/fwcore/users', () => {
    const data = { name: 'user1' }
    submitFormAdd(data)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/users',
      method: 'POST',
      data
    })
  })

  it('submitFormEdit sends PUT to /services/fwcore/users/:id', () => {
    const data = { id: '1', name: 'user1' }
    submitFormEdit(data)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/users/1',
      method: 'PUT',
      data
    })
  })

  it('getOrgList sends GET to /services/fwcore/users/checkOrg', () => {
    getOrgList()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/users/checkOrg',
      method: 'GET'
    })
  })

  it('batchDelete sends DELETE with qs params', () => {
    batchDelete({ items: ['1', '2'] })
    const url = request.mock.calls[0][0].url
    expect(url).toContain('/services/fwcore/users?')
    expect(url).toContain('items=1')
    expect(request.mock.calls[0][0].method).toBe('DELETE')
  })

  it('batchLocked sends PUT to /status/lock', () => {
    batchLocked({ items: ['1'] })
    const url = request.mock.calls[0][0].url
    expect(url).toContain('/services/fwcore/users/status/lock?')
    expect(request.mock.calls[0][0].method).toBe('PUT')
  })

  it('batchUnLocked sends PUT to /status/unlock', () => {
    batchUnLocked({ items: ['1'] })
    const url = request.mock.calls[0][0].url
    expect(url).toContain('/services/fwcore/users/status/unlock?')
    expect(request.mock.calls[0][0].method).toBe('PUT')
  })

  it('batchResetPsd sends PUT to /default/pwd', () => {
    batchResetPsd({ items: ['1'] })
    const url = request.mock.calls[0][0].url
    expect(url).toContain('/services/fwcore/users/default/pwd?')
    expect(request.mock.calls[0][0].method).toBe('PUT')
  })

  it('syncUser sends POST to /services/fwcore/users/userTemp', () => {
    syncUser()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/users/userTemp',
      method: 'POST'
    })
  })

  it('getCurUser sends GET to /services/fwcore/users/currentUser', () => {
    getCurUser()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/users/currentUser',
      method: 'GET'
    })
  })

  it('modifyPassword sends PUT to /services/fwcore/users/modifyPwd', () => {
    const data = { oldPwd: 'old', newPwd: 'new' }
    modifyPassword(data)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/users/modifyPwd',
      method: 'PUT',
      data
    })
  })
})
