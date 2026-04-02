import { formatDate } from '@/utils/date'

describe('Utils: date.js', () => {
  const testDate = new Date(2026, 3, 2, 8, 9, 4, 423) // 2026-04-02 08:09:04.423

  it('formats full datetime', () => {
    expect(formatDate(testDate, 'yyyy-MM-dd hh:mm:ss.S')).toBe('2026-04-02 08:09:04.423')
  })

  it('formats date only', () => {
    expect(formatDate(testDate, 'yyyy-MM-dd')).toBe('2026-04-02')
  })

  it('formats with single placeholders', () => {
    expect(formatDate(testDate, 'yyyy-M-d h:m:s')).toBe('2026-4-2 8:9:4')
  })

  it('formats month start pattern', () => {
    expect(formatDate(testDate, 'yyyy-MM-01 00:00:00')).toBe('2026-04-01 00:00:00')
  })

  it('formats end-of-day pattern', () => {
    expect(formatDate(testDate, 'yyyy-MM-dd 23:59:59')).toBe('2026-04-02 23:59:59')
  })

  it('does not pollute Date.prototype', () => {
    expect(new Date().format).toBeUndefined()
  })
})
