import { buildTrackOptions } from '../helpers'
import type { HealthTrackSummary } from '@/app/[userId]/types'
import type { TrackOption } from '../types'

describe('buildTrackOptions', () => {
  it('returns empty array when tracks is null', () => {
    expect(buildTrackOptions(null as any)).toEqual([])
  })

  it('returns empty array when tracks is undefined', () => {
    expect(buildTrackOptions(undefined as any)).toEqual([])
  })

  it('returns empty array when tracks is empty', () => {
    expect(buildTrackOptions([])).toEqual([])
  })

  it('maps tracks to TrackOption format', () => {
    const tracks: HealthTrackSummary[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedLabel: '2 days ago',
        lastUpdatedAt: new Date('2024-01-15T10:00:00Z')
      },
      {
        id: 'track-2',
        slug: 'track-two',
        title: 'Track Two',
        lastUpdatedLabel: '3 days ago',
        lastUpdatedAt: new Date('2024-01-14T08:00:00Z')
      }
    ]

    const result = buildTrackOptions(tracks)

    expect(result).toEqual([
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedAt: new Date('2024-01-15T10:00:00Z')
      },
      {
        id: 'track-2',
        slug: 'track-two',
        title: 'Track Two',
        lastUpdatedAt: new Date('2024-01-14T08:00:00Z')
      }
    ])
  })

  it('preserves all track properties correctly', () => {
    const tracks: HealthTrackSummary[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedLabel: '2 days ago',
        lastUpdatedAt: '2024-01-15T10:00:00Z'
      }
    ]

    const result = buildTrackOptions(tracks)

    expect(result[0]).toMatchObject({
      id: 'track-1',
      slug: 'track-one',
      title: 'Track One',
      lastUpdatedAt: '2024-01-15T10:00:00Z'
    })
  })
})

