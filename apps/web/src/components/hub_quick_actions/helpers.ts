import type { HealthTrackSummary } from '@/app/[userId]/types'
import type { TrackOption } from './types'

export function buildTrackOptions(tracks: HealthTrackSummary[]): TrackOption[] {
  if (!tracks || tracks.length === 0) {
    return []
  }

  return tracks.map((track) => ({
    id: track.id,
    slug: track.slug,
    title: track.title,
    lastUpdatedAt: track.lastUpdatedAt
  }))
}

