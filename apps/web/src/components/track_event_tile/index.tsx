'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EventType, type EventResponse } from '@packages/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Calendar, MoreVertical } from 'lucide-react'
import type { TrackEventTileProps } from './types'

function stopLinkNavigation(e: { preventDefault: () => void; stopPropagation: () => void }) {
  e.preventDefault()
  e.stopPropagation()
}

function renderTypeBadge(event: EventResponse) {
  const isAppointment = event.type === EventType.APPOINTMENT

  return (
    <span className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
      {isAppointment && (
        <Calendar className='size-3.5' data-testid='event-type-icon-APPOINTMENT' aria-hidden />
      )}
      {event.type}
    </span>
  )
}


export function TrackEventTile({
  userId,
  trackSlug,
  event,
  isActive = false,
  isUpcoming = false
}: TrackEventTileProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const isSymptom = event.type === EventType.SYMPTOM
  const variant = isSymptom ? 'symptom' : 'standard'

  const href = `/${userId}/tracks/${trackSlug}/${event.id}`

  async function handleConfirmDelete() {
    const { deleteEventAction } = await import(
      '@/app/[userId]/tracks/[trackSlug]/[eventId]/actions'
    )
    await deleteEventAction(userId, trackSlug, event.id)
  }

  return (
    <>
      <Link href={href} className='block' aria-label={event.title}>
        <Card
          data-testid='track-event-tile'
          data-variant={variant}
          data-upcoming={isUpcoming ? 'true' : 'false'}
          className={cn(
            'relative cursor-pointer transition-colors hover:bg-accent/50',
            isActive && 'border-primary bg-accent',
            isUpcoming && 'border-indigo-500/30',
            isSymptom && 'border-l-4 border-l-rose-400/60 bg-rose-500/5'
          )}
        >
          <CardHeader className={cn('pb-2', isSymptom && 'pb-1')}>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0 space-y-1'>
                <CardTitle className={cn('text-lg font-semibold', isSymptom && 'text-base')}>
                  {event.title}
                </CardTitle>
                {event.notes && (
                  <p
                    className={cn(
                      'text-sm text-muted-foreground line-clamp-2',
                      isSymptom && 'line-clamp-1'
                    )}
                  >
                    {event.notes}
                  </p>
                )}
              </div>

              <div className='flex shrink-0 items-start gap-2'>
                <div className='hidden flex-col items-end gap-1 text-right sm:flex'>
                  {renderTypeBadge(event)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={stopLinkNavigation}
                      aria-label='Event actions'
                      className='shrink-0'
                    >
                      <MoreVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-44'>
                    <DropdownMenuItem onSelect={(e) => stopLinkNavigation(e)}>
                      <Link href={href} className='block w-full'>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant='destructive'
                      onSelect={(e) => {
                        stopLinkNavigation(e)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className='flex items-center justify-between gap-3 sm:hidden'>
              {renderTypeBadge(event)}
            </div>
          </CardHeader>

          <CardContent className={cn('space-y-3', isSymptom && 'space-y-2')}>
            {/* <div className='space-y-1'>
              {renderMetaRow(
                'Event time',
                `${formatEventDate(event.date)} · ${formatEventTime(event.date)}`
              )}
              {renderMetaRow('Created', formatEventDate(event.createdAt))}
              {renderMetaRow('Updated', formatEventDate(event.updatedAt))}
            </div> */}
          </CardContent>
        </Card>
      </Link>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete “{event.title}”? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type='button' variant='destructive' onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
