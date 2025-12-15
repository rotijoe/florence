import { getTrackDescriptionFallback } from '../helpers'

describe('getTrackDescriptionFallback', () => {
  it('returns description when it is a non-empty string', () => {
    expect(getTrackDescriptionFallback('Hello')).toBe('Hello')
    expect(getTrackDescriptionFallback('  Hello  ')).toBe('  Hello  ')
  })

  it('returns fallback when description is null/undefined/empty', () => {
    expect(getTrackDescriptionFallback(null)).toBe('Add a short description to make this track easier to scan.')
    expect(getTrackDescriptionFallback(undefined)).toBe('Add a short description to make this track easier to scan.')
    expect(getTrackDescriptionFallback('')).toBe('Add a short description to make this track easier to scan.')
    expect(getTrackDescriptionFallback('   ')).toBe('Add a short description to make this track easier to scan.')
  })
})


