import type { TrackTileTrack } from './types'

export function createInitialNotificationState(tracks: TrackTileTrack[]) {
  return tracks.reduce<Record<string, boolean>>((acc, track) => {
    acc[track.id] = false
    return acc
  }, {})
}


