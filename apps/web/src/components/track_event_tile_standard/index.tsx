'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useDeleteDialog } from '@/components/track_event_tile/hooks'
import { TrackEventTileActionMenu } from '@/components/track_event_tile_action_menu'
import { TrackEventTileDeleteConfirmDialog } from '@/components/track_event_tile_delete_confirm_dialog'
import { TrackEventTileTypeBadge } from '@/components/track_event_tile_type_badge'
import type { TrackEventTileStandardProps } from './types'

export function TrackEventTileStandard({
  userId,
  trackSlug,
  event,
  isActive = false,
  isUpcoming = false
}: TrackEventTileStandardProps) {
  const { isDeleteDialogOpen, setIsDeleteDialogOpen, handleConfirmDelete } = useDeleteDialog(
    userId,
    trackSlug,
    event.id
  )

  const href = `/${userId}/tracks/${trackSlug}/${event.id}`

  return (
    <>
      <Link href={href} className='block' aria-label={event.title}>
        <div
          data-testid='track-event-tile-standard'
          className={cn(
            'rounded-lg bg-muted p-4 transition-colors hover:bg-muted/80',
            isActive && 'ring-2 ring-primary',
            isUpcoming && 'ring-2 ring-indigo-500/30'
          )}
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0 flex-1 space-y-2'>
              <div className='flex items-start gap-2'>
                <h3 className='text-lg font-semibold'>{event.title}</h3>
                <div className='hidden sm:block'>
                  <TrackEventTileTypeBadge event={event} />
                </div>
              </div>
              {event.notes && <p className='text-sm text-muted-foreground'>{event.notes}</p>}
              <div className='sm:hidden'>
                <TrackEventTileTypeBadge event={event} />
              </div>
            </div>

            <TrackEventTileActionMenu
              href={href}
              eventTitle={event.title}
              onDeleteClick={() => setIsDeleteDialogOpen(true)}
            />
          </div>
        </div>
      </Link>

      <TrackEventTileDeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        eventTitle={event.title}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

