import { formatEventDate } from '../helpers'

describe('formatEventDate', () => {
  it('formats ISO date string to readable format', () => {
    const isoDate = '2025-10-21T14:30:00.000Z'
    const formatted = formatEventDate(isoDate)

    expect(formatted).toContain('October')
    expect(formatted).toContain('21')
    expect(formatted).toContain('2025')
  })

  it('handles different dates correctly', () => {
    const isoDate = '2024-01-15T08:00:00.000Z'
    const formatted = formatEventDate(isoDate)

    expect(formatted).toContain('January')
    expect(formatted).toContain('15')
    expect(formatted).toContain('2024')
  })

  it('includes time in the formatted string', () => {
    const isoDate = '2025-10-21T14:30:00.000Z'
    const formatted = formatEventDate(isoDate)

    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
  })
})
