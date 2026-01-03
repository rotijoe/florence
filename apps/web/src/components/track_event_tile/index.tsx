'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EventType, type EventResponse } from '@packages/types'
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
import { Calendar, MoreVertical, ChevronDown, ChevronUp, FileText, Image, File } from 'lucide-react'
import { getFileDetails } from '@/lib/get_file_details'
import { getSeverityStyles } from './helpers'
import { useDeleteDialog } from './hooks'
import type {
  TrackEventTileProps,
  TrackEventTileSymptomProps,
  TrackEventTileStandardProps,
  TrackEventTileUploadProps
} from './types'

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

function FileIcon({ fileType }: { fileType: 'image' | 'pdf' | 'word' | 'text' | 'other' }) {
  if (fileType === 'pdf') {
    return (
      <div className='flex size-8 shrink-0 items-center justify-center rounded border border-border bg-destructive/10'>
        <FileText className='size-4 text-destructive' />
      </div>
    )
  }

  if (fileType === 'word') {
    return (
      <div className='flex size-8 shrink-0 items-center justify-center rounded border border-border bg-blue-500/10'>
        <FileText className='size-4 text-blue-600' />
      </div>
    )
  }

  if (fileType === 'image') {
    return (
      <div className='flex size-8 shrink-0 items-center justify-center rounded border border-border bg-muted'>
        <Image className='size-4 text-muted-foreground' />
      </div>
    )
  }

  if (fileType === 'text') {
    return (
      <div className='flex size-8 shrink-0 items-center justify-center rounded border border-border bg-muted'>
        <FileText className='size-4 text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='flex size-8 shrink-0 items-center justify-center rounded border border-border bg-muted'>
      <File className='size-4 text-muted-foreground' />
    </div>
  )
}

export function TrackEventTileSymptom({
  userId: _userId,
  trackSlug: _trackSlug,
  event
}: TrackEventTileSymptomProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const styles = getSeverityStyles(event.severity)

  return (
    <button
      type='button'
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        'w-full rounded-full px-4 py-2 text-left transition-colors',
        styles.bgColor,
        styles.textColor
      )}
      data-testid='track-event-tile-symptom'
      aria-expanded={isExpanded}
    >
      <div className='flex items-center justify-between gap-2'>
        <span className='font-medium'>{event.symptomType || 'Symptom'}</span>
        {isExpanded ? (
          <ChevronUp className='size-4 shrink-0' aria-hidden />
        ) : (
          <ChevronDown className='size-4 shrink-0' aria-hidden />
        )}
      </div>
      {isExpanded && event.notes && (
        <div className='mt-2 border-t border-white/20 pt-2 text-sm'>{event.notes}</div>
      )}
    </button>
  )
}

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
                <div className='hidden sm:block'>{renderTypeBadge(event)}</div>
              </div>
              {event.notes && <p className='text-sm text-muted-foreground'>{event.notes}</p>}
              <div className='sm:hidden'>{renderTypeBadge(event)}</div>
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
      </Link>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
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

export function TrackEventTileUpload({
  userId,
  trackSlug,
  event,
  isActive = false,
  isUpcoming = false
}: TrackEventTileUploadProps) {
  const { isDeleteDialogOpen, setIsDeleteDialogOpen, handleConfirmDelete } = useDeleteDialog(
    userId,
    trackSlug,
    event.id
  )

  const href = `/${userId}/tracks/${trackSlug}/${event.id}`
  const fileDetails = event.fileUrl ? getFileDetails(event.fileUrl) : null

  return (
    <>
      <Link href={href} className='block' aria-label={event.title}>
        <div
          data-testid='track-event-tile-upload'
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
                <div className='hidden sm:block'>{renderTypeBadge(event)}</div>
              </div>
              {event.notes && <p className='text-sm text-muted-foreground'>{event.notes}</p>}
              <div className='sm:hidden'>{renderTypeBadge(event)}</div>
              {fileDetails && (
                <div className='flex items-center gap-2 rounded-md border border-border bg-card p-2'>
                  <FileIcon fileType={fileDetails.fileType} />
                  <span className='flex-1 text-sm text-foreground'>{fileDetails.filename}</span>
                </div>
              )}
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
      </Link>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
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
