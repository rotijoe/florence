import { mapTracksToHealthTrackSummary } from '../helpers'
import type { TrackResponse } from '@packages/types'

describe('mapTracksToHealthTrackSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-02T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should map tracks to health track summary', () => {
    const tracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: 'Test description',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      }
    ]

    const result = mapTracksToHealthTrackSummary(tracks)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'track-1',
      title: 'Test Track',
      description: 'Test description',
      slug: 'test-track',
      lastUpdatedAt: '2024-01-01T12:00:00Z',
      lastUpdatedLabel: expect.any(String)
    })
  })

  it('should map multiple tracks', () => {
    const tracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-1',
        title: 'Track 1',
        slug: 'track-1',
        description: 'Description 1',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      },
      {
        id: 'track-2',
        userId: 'user-1',
        title: 'Track 2',
        slug: 'track-2',
        description: 'Description 2',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      }
    ]

    const result = mapTracksToHealthTrackSummary(tracks)

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('track-1')
    expect(result[1].id).toBe('track-2')
  })

  it('should handle empty array', () => {
    const tracks: TrackResponse[] = []

    const result = mapTracksToHealthTrackSummary(tracks)

    expect(result).toEqual([])
  })

  it('should compute last updated label for each track', () => {
    const tracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-1',
        title: 'Test Track',
        slug: 'test-track',
        description: 'Test description',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      }
    ]

    const result = mapTracksToHealthTrackSummary(tracks)

    expect(result[0].lastUpdatedLabel).toBe('Updated yesterday')
  })
})

