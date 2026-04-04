jest.mock('@/settings', () => ({
  showSettings: true,
  fixedHeader: false,
  sidebarLogo: false
}))

import settingsModule from '@/store/modules/settings'

const { state, mutations, actions } = settingsModule

describe('Store: settings module', () => {
  it('state defaults match settings values', () => {
    expect(state.showSettings).toBe(true)
    expect(state.fixedHeader).toBe(false)
    expect(state.sidebarLogo).toBe(false)
  })

  it('CHANGE_SETTING mutation updates an existing key', () => {
    const s = { ...state }
    mutations.CHANGE_SETTING(s, { key: 'fixedHeader', value: true })
    expect(s.fixedHeader).toBe(true)
  })

  it('CHANGE_SETTING mutation ignores a non-existing key', () => {
    const s = { ...state }
    mutations.CHANGE_SETTING(s, { key: 'nonExistent', value: 'anything' })
    expect(s.nonExistent).toBeUndefined()
  })

  it('changeSetting action commits CHANGE_SETTING', () => {
    const commit = jest.fn()
    const data = { key: 'sidebarLogo', value: true }
    actions.changeSetting({ commit }, data)
    expect(commit).toHaveBeenCalledWith('CHANGE_SETTING', data)
  })
})
