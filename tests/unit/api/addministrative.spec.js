import { getPage, submitForm, batchDelete, singleDelete, getName, getPageAuth } from '@/api/addministrative'
const request = require('@/utils/request')

jest.mock('@/utils/request', () => { const fn = jest.fn(() => Promise.resolve({})); fn.default = fn; return fn })

describe('API: addministrative.js', () => {
  beforeEach(() => {
    request.mockClear()
    request.mockResolvedValue({})
  })

  describe('CRUD via createCrudApi(/services/fwcore/template)', () => {
    it('getPage sends GET with params', () => {
      const params = { currentPage: 1, pageSize: 10 }
      getPage(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/template',
        method: 'get',
        params
      })
    })

    it('submitForm sends POST for new record', () => {
      const params = { name: 'test' }
      submitForm(params)
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/services/fwcore/template',
          method: 'POST',
          data: expect.objectContaining({ name: 'test' })
        })
      )
    })

    it('submitForm sends PUT for existing record', () => {
      const params = { id: '5', name: 'updated' }
      submitForm(params)
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/services/fwcore/template/5',
          method: 'PUT',
          data: expect.objectContaining({ id: '5', name: 'updated' })
        })
      )
    })
  })

  describe('getName', () => {
    it('sends GET to /services/fwcore/template with params', () => {
      const params = { keyword: 'foo' }
      getName(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/template',
        method: 'get',
        params
      })
    })
  })

  describe('getPageAuth', () => {
    it('sends GET to /services/fwcore/template-auth with params', () => {
      const params = { currentPage: 1 }
      getPageAuth(params)
      expect(request).toHaveBeenCalledWith({
        url: '/services/fwcore/template-auth',
        method: 'get',
        params
      })
    })
  })
})
