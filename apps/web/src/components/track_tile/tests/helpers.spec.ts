import { createInitialNotificationState } from '../helpers'
import type { TrackTileTrack } from '../types'

describe('createInitialNotificationState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create initial notification state with all tracks disabled', () => {
    const tracks: TrackTileTrack[] = [
      {
        id: 'track-1',
        title: 'Sleep',
        slug: 'sleep',
        description: 'Track sleep',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      },
      {
        id: 'track-2',
        title: 'Exercise',
        slug: 'exercise',
        description: 'Track exercise',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      }
    ]

    const result = createInitialNotificationState(tracks)

    expect(result).toEqual({
      'track-1': false,
      'track-2': false
    })
  })

  it('should handle empty tracks array', () => {
    const tracks: TrackTileTrack[] = []

    const result = createInitialNotificationState(tracks)

    expect(result).toEqual({})
  })

  it('should handle single track', () => {
    const tracks: TrackTileTrack[] = [
      {
        id: 'track-1',
        title: 'Sleep',
        slug: 'sleep',
        description: 'Track sleep',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      }
    ]

    const result = createInitialNotificationState(tracks)

    expect(result).toEqual({
      'track-1': false
    })
  })
})

