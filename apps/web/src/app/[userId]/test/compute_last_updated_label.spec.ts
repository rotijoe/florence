import { computeLastUpdatedLabel } from '../helpers'

describe('computeLastUpdatedLabel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return "Updated just now" for very recent updates', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    jest.setSystemTime(now)

    const updatedAt = new Date('2024-01-01T12:00:00Z')
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('Updated just now')
  })

  it('should return "Updated X minute ago" for updates within the last hour', () => {
    const now = new Date('2024-01-01T12:30:00Z')
    jest.setSystemTime(now)

    const updatedAt = new Date('2024-01-01T12:15:00Z')
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('Updated 15 minutes ago')
  })

  it('should return "Updated 1 minute ago" for singular minute', () => {
    const now = new Date('2024-01-01T12:01:00Z')
    jest.setSystemTime(now)

    const updatedAt = new Date('2024-01-01T12:00:00Z')
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('Updated 1 minute ago')
  })

  it('should return "Updated this morning" for morning updates when current time is afternoon', () => {
    const now = new Date('2024-01-01T14:00:00Z')
    jest.setSystemTime(now)

    const updatedAt = new Date('2024-01-01T10:00:00Z')
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('Updated this morning')
  })

  it('should return "Updated today" for same-day updates in afternoon', () => {
    const now = new Date('2024-01-01T14:00:00Z')
    jest.setSystemTime(now)

    const updatedAt = new Date('2024-01-01T13:00:00Z')
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('Updated today')
  })

  it('should return "Updated yesterday" for updates from yesterday', () => {
    const now = new Date('2024-01-02T12:00:00Z')
    jest.setSystemTime(now)

    const updatedAt = new Date('2024-01-01T12:00:00Z')
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('Updated yesterday')
  })

  it('should return "Updated X days ago" for updates within the last week', () => {
    const now = new Date('2024-01-05T12:00:00Z')
    jest.setSystemTime(now)

    const updatedAt = new Date('2024-01-03T12:00:00Z')
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('Updated 2 days ago')
  })

  it('should return formatted date for updates older than a week', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    jest.setSystemTime(now)

    const updatedAt = new Date('2024-01-01T12:00:00Z')
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('1 January 2024')
  })

  it('should handle string dates', () => {
    const now = new Date('2024-01-02T12:00:00Z')
    jest.setSystemTime(now)

    const updatedAt = '2024-01-01T12:00:00Z'
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('Updated yesterday')
  })

  it('should handle Date objects', () => {
    const now = new Date('2024-01-02T12:00:00Z')
    jest.setSystemTime(now)

    const updatedAt = new Date('2024-01-01T12:00:00Z')
    const result = computeLastUpdatedLabel(updatedAt)

    expect(result).toBe('Updated yesterday')
  })
})

