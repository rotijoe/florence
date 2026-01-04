'use client'

import { EventType } from '@packages/types'
import { Calendar } from 'lucide-react'
import type { TrackEventTileTypeBadgeProps } from './types'

export function TrackEventTileTypeBadge({ event }: TrackEventTileTypeBadgeProps) {
  const isAppointment = event.type === EventType.APPOINTMENT

  return (
    <span className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-.5 text-xs font-medium text-primary'>
      {isAppointment && (
        <Calendar className='size-3.5' data-testid='event-type-icon-APPOINTMENT' aria-hidden />
      )}
      {event.type}
    </span>
  )
}
