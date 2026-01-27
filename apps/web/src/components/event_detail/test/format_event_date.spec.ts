import { formatEventDate } from '../helpers'

describe('formatEventDate', () => {
  it('formats ISO string to readable event date', () => {
    const isoString = '2025-10-21T14:30:00.000Z'
    const result = formatEventDate(isoString)

    expect(result).toMatch(/21 October 2025/)
    // Time may vary by timezone, so just check that time is present
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('handles different dates correctly', () => {
    const isoString = '2024-01-15T09:15:00.000Z'
    const result = formatEventDate(isoString)

    expect(result).toMatch(/15 January 2024/)
    expect(result).toMatch(/09:15/)
  })

  it('formats date with correct format (year, month, day, hour, minute)', () => {
    const isoString = '2023-12-25T23:59:00.000Z'
    const result = formatEventDate(isoString)

    expect(result).toMatch(/25 December 2023/)
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})
