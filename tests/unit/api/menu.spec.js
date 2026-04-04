import { listAll, getMenuTree, updateMenu, getSourceTypeOptions, delMenu, detailMenu, getBusinessMenu } from '@/api/menu'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: menu.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  it('listAll sends GET to /services/fwcore/menus/listAll', () => {
    listAll()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/menus/listAll',
      method: 'get'
    })
  })

  it('getMenuTree sends GET to /services/fwcore/menus/getTotalTree', () => {
    getMenuTree()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/menus/getTotalTree',
      method: 'get'
    })
  })

  it('updateMenu sends POST for new menu (no id)', () => {
    const params = { name: 'Dashboard' }
    updateMenu(params)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/menus',
      method: 'POST',
      data: params
    })
  })

  it('updateMenu sends PUT for existing menu (with id)', () => {
    const params = { id: '10', name: 'Settings' }
    updateMenu(params)
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/menus/10',
      method: 'PUT',
      data: params
    })
  })

  it('getSourceTypeOptions sends GET with code in URL', () => {
    getSourceTypeOptions('MENU_TYPE')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/props/getPropListByPropCode?code=MENU_TYPE',
      method: 'get'
    })
  })

  it('delMenu sends DELETE with id in URL', () => {
    delMenu('99')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/menus/99',
      method: 'DELETE'
    })
  })

  it('detailMenu sends GET with id in URL', () => {
    detailMenu('42')
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/menus/42',
      method: 'GET'
    })
  })

  it('getBusinessMenu sends GET to /services/fwcore/menus/businessMenuTrees', () => {
    getBusinessMenu()
    expect(request).toHaveBeenCalledWith({
      url: '/services/fwcore/menus/businessMenuTrees',
      method: 'get'
    })
  })
})
