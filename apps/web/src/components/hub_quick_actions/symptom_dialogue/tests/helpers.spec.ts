import { getDefaultTrack } from '../helpers'
import type { TrackOption } from '../types'

describe('getDefaultTrack', () => {
  it('returns undefined for empty tracks array', () => {
    expect(getDefaultTrack([])).toBeUndefined()
  })

  it('returns the slug of the most recently updated track', () => {
    const tracks: TrackOption[] = [
      {
        slug: 'track-1',
        title: 'Track 1',
        lastUpdatedAt: new Date('2024-01-10T00:00:00Z')
      },
      {
        slug: 'track-2',
        title: 'Track 2',
        lastUpdatedAt: new Date('2024-01-15T00:00:00Z')
      },
      {
        slug: 'track-3',
        title: 'Track 3',
        lastUpdatedAt: new Date('2024-01-12T00:00:00Z')
      }
    ]

    expect(getDefaultTrack(tracks)).toBe('track-2')
  })

  it('handles string dates', () => {
    const tracks: TrackOption[] = [
      {
        slug: 'track-1',
        title: 'Track 1',
        lastUpdatedAt: '2024-01-10T00:00:00Z'
      },
      {
        slug: 'track-2',
        title: 'Track 2',
        lastUpdatedAt: '2024-01-15T00:00:00Z'
      }
    ]

    expect(getDefaultTrack(tracks)).toBe('track-2')
  })

  it('returns first track if dates are equal', () => {
    const tracks: TrackOption[] = [
      {
        slug: 'track-1',
        title: 'Track 1',
        lastUpdatedAt: new Date('2024-01-15T00:00:00Z')
      },
      {
        slug: 'track-2',
        title: 'Track 2',
        lastUpdatedAt: new Date('2024-01-15T00:00:00Z')
      }
    ]

    expect(getDefaultTrack(tracks)).toBe('track-1')
  })
})

