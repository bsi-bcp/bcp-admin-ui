jest.mock('@/settings', () => ({ title: '集成IDE' }))

import getPageTitle from '@/utils/get-page-title'

describe('Util: get-page-title', () => {
  it('returns "pageTitle - title" when pageTitle is provided', () => {
    expect(getPageTitle('Dashboard')).toBe('Dashboard - 集成IDE')
  })

  it('returns only title when pageTitle is empty string', () => {
    expect(getPageTitle('')).toBe('集成IDE')
  })

  it('returns only title when pageTitle is undefined', () => {
    expect(getPageTitle()).toBe('集成IDE')
  })
})
