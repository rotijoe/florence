'use client'

import { EventType } from '@packages/types'
import { TrackEventTileSymptom } from '@/components/track_event_tile_symptom'
import { TrackEventTileStandard } from '@/components/track_event_tile_standard'
import { TrackEventTileUpload } from '@/components/track_event_tile_upload'
import type { TrackEventTileProps } from './types'

export function TrackEventTile(props: TrackEventTileProps) {
  const { event } = props

  // Route to correct component based on event type and fileUrl
  if (event.fileUrl) {
    return <TrackEventTileUpload {...props} />
  }

  if (event.type === EventType.SYMPTOM) {
    return <TrackEventTileSymptom {...props} />
  }

  return <TrackEventTileStandard {...props} />
}

// Re-export all variants for external use
export { TrackEventTileSymptom } from '@/components/track_event_tile_symptom'
export { TrackEventTileStandard } from '@/components/track_event_tile_standard'
export { TrackEventTileUpload } from '@/components/track_event_tile_upload'
