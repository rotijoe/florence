import { formatEventTime } from '../helpers'

describe('formatEventTime', () => {
  it('formats event time with meridiem', () => {
    const isoDate = '2025-05-09T15:00:00.000Z'
    const formatted = formatEventTime(isoDate)

    expect(formatted).toBe('3:00 PM')
  })

  it('formats morning times correctly', () => {
    const isoDate = '2025-05-09T09:00:00.000Z'
    const formatted = formatEventTime(isoDate)

    expect(formatted).toBe('9:00 AM')
  })

  it('formats midnight correctly', () => {
    const isoDate = '2025-05-09T00:00:00.000Z'
    const formatted = formatEventTime(isoDate)

    expect(formatted).toBe('12:00 AM')
  })

  it('formats noon correctly', () => {
    const isoDate = '2025-05-09T12:00:00.000Z'
    const formatted = formatEventTime(isoDate)

    expect(formatted).toBe('12:00 PM')
  })

  it('formats times with minutes correctly', () => {
    const isoDate = '2025-05-09T14:30:00.000Z'
    const formatted = formatEventTime(isoDate)

    expect(formatted).toBe('2:30 PM')
  })

  it('formats evening times correctly', () => {
    const isoDate = '2025-05-09T18:45:00.000Z'
    const formatted = formatEventTime(isoDate)

    expect(formatted).toBe('6:45 PM')
  })
})
