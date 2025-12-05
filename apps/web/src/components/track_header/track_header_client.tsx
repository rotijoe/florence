'use client'

import { startTransition } from 'react'
import { TrackHeader } from './index'
import type { TrackHeaderClientProps } from './types'

export function TrackHeaderClient({
  track,
  userId,
  trackSlug,
  createEventAction
}: TrackHeaderClientProps) {
  function handleCreateEvent() {
    startTransition(() => {
      const formData = new FormData()
      formData.set('userId', userId)
      formData.set('trackSlug', trackSlug)
      createEventAction(formData)
    })
  }

  return (
    <TrackHeader
      track={track}
      userId={userId}
      trackSlug={trackSlug}
      onCreateEvent={handleCreateEvent}
    />
  )
}

