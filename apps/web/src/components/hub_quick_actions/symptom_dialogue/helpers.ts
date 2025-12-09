import type { TrackOption } from './types'

export function getDefaultTrack(tracks: TrackOption[]): string | undefined {
  if (tracks.length === 0) {
    return undefined
  }

  const sortedTracks = [...tracks].sort((a, b) => {
    const dateA = typeof a.lastUpdatedAt === 'string' ? new Date(a.lastUpdatedAt) : a.lastUpdatedAt
    const dateB = typeof b.lastUpdatedAt === 'string' ? new Date(b.lastUpdatedAt) : b.lastUpdatedAt
    return dateB.getTime() - dateA.getTime()
  })

  return sortedTracks[0]?.slug
}
