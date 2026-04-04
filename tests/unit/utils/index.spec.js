import { param2Obj, getReqModel, collectParam } from '@/utils/index.js'

describe('Utils:index.js (non-parseTime/formatTime)', () => {
  describe('param2Obj', () => {
    it('parses query parameters from URL', () => {
      expect(param2Obj('https://example.com?name=foo&age=18')).toEqual({ name: 'foo', age: '18' })
    })

    it('returns empty object when no query string', () => {
      expect(param2Obj('https://example.com')).toEqual({})
    })
  })

  describe('collectParam', () => {
    it('collects specified property from array of objects', () => {
      const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
      expect(collectParam(arr, 'id')).toEqual([1, 2])
    })

    it('returns empty array for empty input', () => {
      expect(collectParam([], 'id')).toEqual([])
    })
  })

  describe('getReqModel', () => {
    it('extracts filter params with pagination from models', () => {
      const models = {
        params: { keyword: 'test' },
        filterList: [
          { prop: 'status', status: 'active' }
        ],
        resData: { currentPage: 1, pageSize: 10 }
      }
      const result = getReqModel(models)
      expect(result.keyword).toBe('test')
      expect(result.status).toBe('active')
      expect(result.currentPage).toBe(1)
      expect(result.pageSize).toBe(10)
    })
  })
})
