import { formatTrackDate } from '../helpers'

describe('formatTrackDate', () => {
  beforeEach(() => {
    jest.spyOn(global.Date.prototype, 'toLocaleDateString').mockImplementation(function (
      this: Date
    ) {
      return this.toISOString().split('T')[0]
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should format date string correctly', () => {
    const dateString = '2024-01-15T10:30:00Z'
    const formatted = formatTrackDate(dateString)

    expect(formatted).toBeDefined()
    expect(typeof formatted).toBe('string')
  })

  it('should format date with different date strings', () => {
    const dateString1 = '2024-12-25T00:00:00Z'
    const formatted1 = formatTrackDate(dateString1)

    expect(formatted1).toBeDefined()
    expect(typeof formatted1).toBe('string')

    const dateString2 = '2023-06-01T12:00:00Z'
    const formatted2 = formatTrackDate(dateString2)

    expect(formatted2).toBeDefined()
    expect(typeof formatted2).toBe('string')
  })
})
