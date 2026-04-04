import { splitArr, deepClone, distinct } from '@/api/common'

describe('API: common.js', () => {
  describe('splitArr', () => {
    it('joins array elements with the given separator', () => {
      expect(splitArr(['a', 'b', 'c'], ',')).toBe('a,b,c,')
    })

    it('returns empty string for empty array', () => {
      expect(splitArr([], ',')).toBe('')
    })

    it('works with a single element', () => {
      expect(splitArr(['x'], '-')).toBe('x-')
    })
  })

  describe('deepClone', () => {
    it('clones a flat object', () => {
      const obj = { a: 1, b: 'hello' }
      const clone = deepClone(obj)
      expect(clone).toEqual(obj)
      expect(clone).not.toBe(obj)
    })

    it('clones nested objects', () => {
      const obj = { a: { b: { c: 42 } } }
      const clone = deepClone(obj)
      expect(clone).toEqual(obj)
      expect(clone.a).not.toBe(obj.a)
      expect(clone.a.b).not.toBe(obj.a.b)
    })

    it('clones arrays', () => {
      const arr = [1, [2, 3], { x: 4 }]
      const clone = deepClone(arr)
      expect(clone).toEqual(arr)
      expect(clone).not.toBe(arr)
      expect(clone[1]).not.toBe(arr[1])
      expect(clone[2]).not.toBe(arr[2])
    })
  })

  describe('distinct', () => {
    it('removes duplicates based on keyFunc', () => {
      const data = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'a-dup' }
      ]
      const result = distinct(data, item => item.id)
      expect(result).toHaveLength(2)
      // without compareFunc, first entry wins
      expect(result.find(r => r.id === 1).name).toBe('a')
    })

    it('uses compareFunc to decide replacement', () => {
      const data = [
        { id: 1, score: 10 },
        { id: 1, score: 20 }
      ]
      // replace when new score is higher
      const result = distinct(data, item => item.id, (newVal, oldVal) => newVal.score > oldVal.score)
      expect(result).toHaveLength(1)
      expect(result[0].score).toBe(20)
    })
  })
})
