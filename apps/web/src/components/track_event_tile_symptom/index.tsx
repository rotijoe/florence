'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateLabel } from '@/components/track_event_list/helpers'
import { getSeverityStyles } from '@/components/track_event_tile/helpers'
import { useDeleteDialog } from '@/components/track_event_tile/hooks'
import { SeverityIndicator } from '@/components/severity_indicator'
import { TrackEventTileActionMenu } from '@/components/track_event_tile_action_menu'
import { TrackEventTileDeleteConfirmDialog } from '@/components/track_event_tile_delete_confirm_dialog'
import type { TrackEventTileSymptomProps } from './types'

export function TrackEventTileSymptom({
  userId,
  trackSlug,
  event
}: TrackEventTileSymptomProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { isDeleteDialogOpen, setIsDeleteDialogOpen, handleConfirmDelete } = useDeleteDialog(
    userId,
    trackSlug,
    event.id
  )
  const styles = getSeverityStyles(event.severity)
  const href = `/${userId}/tracks/${trackSlug}/${event.id}`

  return (
    <>
      <div
        className={cn(
          'group w-full rounded-full px-4 py-2 text-left transition-colors',
          isExpanded && 'rounded-sm',
          styles.bgColor,
          styles.textColor
        )}
        data-testid='track-event-tile-symptom'
      >
        <button
          type='button'
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex w-full items-center justify-between gap-2'
          aria-expanded={isExpanded}
        >
          <div>
            <span className='font-semibold capitalize'>{event.symptomType || 'Symptom'}</span>
            <span className='ml-2 font-normal opacity-75'>{formatDateLabel(event.date)}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className='size-4 shrink-0' aria-hidden />
          ) : (
            <ChevronDown className='size-4 shrink-0' aria-hidden />
          )}
        </button>
        {isExpanded && (
          <div className='mt-2 border-t border-white/20 pt-2'>
            <div className='my-2'>
              <SeverityIndicator severity={event.severity} />
            </div>
            {event.notes && <div className='text-sm'>{event.notes}</div>}
            <div className='mt-2 flex justify-end'>
              <TrackEventTileActionMenu
                href={href}
                eventTitle={event.symptomType || 'Symptom'}
                onDeleteClick={() => setIsDeleteDialogOpen(true)}
                variant='symptom'
                symptomStyles={styles}
              />
            </div>
          </div>
        )}
      </div>

      <TrackEventTileDeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        eventTitle={event.symptomType || 'Symptom'}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

