import { formatDateLabel } from '../helpers'

describe('formatDateLabel', () => {
  it('formats ISO date string to readable date label', () => {
    const isoDate = '2025-05-09T09:00:00.000Z'
    const formatted = formatDateLabel(isoDate)

    expect(formatted).toBe('9 May 2025')
  })

  it('handles different dates correctly', () => {
    const isoDate = '2024-01-15T08:00:00.000Z'
    const formatted = formatDateLabel(isoDate)

    expect(formatted).toBe('15 January 2024')
  })

  it('handles end of year dates', () => {
    const isoDate = '2025-12-31T23:59:59.000Z'
    const formatted = formatDateLabel(isoDate)

    expect(formatted).toBe('31 December 2025')
  })

  it('handles beginning of year dates', () => {
    const isoDate = '2025-01-01T00:00:00.000Z'
    const formatted = formatDateLabel(isoDate)

    expect(formatted).toBe('1 January 2025')
  })
})
