import { formatTimestamp } from '../helpers'

describe('formatTimestamp', () => {
  it('formats ISO string to readable timestamp', () => {
    const isoString = '2025-10-21T14:30:45.000Z'
    const result = formatTimestamp(isoString)

    expect(result).toMatch(/21 October 2025/)
    // Time may vary by timezone, so just check that time is present
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/)
  })

  it('handles different dates correctly', () => {
    const isoString = '2024-01-15T09:15:30.000Z'
    const result = formatTimestamp(isoString)

    expect(result).toMatch(/15 January 2024/)
    expect(result).toMatch(/09:15/)
  })

  it('includes seconds in formatted timestamp', () => {
    const isoString = '2023-12-25T23:59:59.000Z'
    const result = formatTimestamp(isoString)

    expect(result).toMatch(/25 December 2023/)
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/)
  })
})
