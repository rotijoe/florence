'use client'

import { useState, useOptimistic, startTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MoreVertical } from 'lucide-react'
import { formatTimestamp, optimisticReducer } from './helpers'
import type { EventDetailProps } from './types'
import {
  updateEventAction,
  deleteEventAttachmentAction,
  deleteEventAction
} from '@/app/[userId]/tracks/[trackSlug]/[eventId]/actions'
import type { EventResponse } from '@packages/types'
import { UploadDocument } from '@/components/upload_document'
import { EventAttachment } from '@/components/attachment_list'

export function EventDetail({ event, trackSlug, userId, isNew = false }: EventDetailProps) {
  const [isEditing, setIsEditing] = useState(isNew)
  const [error, setError] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [optimisticEvent, updateOptimisticEvent] = useOptimistic(event, optimisticReducer)

  async function formAction(formData: FormData) {
    setError(null)

    const title = (formData.get('title') as string) ?? ''
    const notes = (formData.get('notes') as string | null) ?? null

    // Optimistic update - this is inside an action, so React is happy
    updateOptimisticEvent({
      title: title.trim(),
      notes: notes === '' ? null : notes,
      updatedAt: new Date().toISOString()
    })

    // Call the server action
    const result = await updateEventAction(null, formData)

    if (result.error) {
      // Rollback on error
      updateOptimisticEvent({
        title: event.title,
        notes: event.notes ?? null,
        updatedAt: event.updatedAt
      })
      setError(result.error)
      return
    }

    if (result.event) {
      // Server-confirmed data - update optimistic state with server response
      updateOptimisticEvent({
        title: result.event.title,
        notes: result.event.notes ?? null,
        updatedAt: result.event.updatedAt
      })
      setIsEditing(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = async () => {
    if (isNew) {
      // Delete the event if it's a new event
      const result = await deleteEventAction(userId, trackSlug, optimisticEvent.id)
      if (result.error) {
        setError(result.error)
        return
      }
      // If successful, redirect will happen in the server action
      return
    }
    setIsEditing(false)
    setError(null)
  }

  const handleUploadClick = () => {
    setShowUploadDialog(true)
    setError(null)
  }

  const handleUploadComplete = (updatedEvent: EventResponse) => {
    startTransition(() => {
      updateOptimisticEvent({
        fileUrl: updatedEvent.fileUrl,
        updatedAt: updatedEvent.updatedAt
      })
    })
    setShowUploadDialog(false)
  }

  const handleUploadCancel = () => {
    setShowUploadDialog(false)
  }

  const handleDeleteAttachment = () => {
    startTransition(async () => {
      // Optimistic update - remove attachment from UI immediately
      updateOptimisticEvent({
        fileUrl: null,
        updatedAt: new Date().toISOString()
      })

      // Call the server action
      const result = await deleteEventAttachmentAction(userId, trackSlug, optimisticEvent.id)

      if (result.error) {
        // Rollback on error - restore original fileUrl
        updateOptimisticEvent({
          fileUrl: event.fileUrl ?? null,
          updatedAt: event.updatedAt
        })
        setError(result.error)
        return
      }

      if (result.event) {
        // Server-confirmed data - update optimistic state with server response
        updateOptimisticEvent({
          fileUrl: result.event.fileUrl ?? null,
          updatedAt: result.event.updatedAt
        })
      }
    })
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
    setError(null)
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  const handleDeleteEvent = async () => {
    setError(null)
    const result = await deleteEventAction(userId, trackSlug, optimisticEvent.id)

    if (result.error) {
      setError(result.error)
      setShowDeleteDialog(false)
      return
    }

    // If successful, redirect will happen in the server action
    // No need to close dialog here as redirect will navigate away
  }

  return (
    <>
      <Card>
        <form action={formAction}>
          <input type='hidden' name='userId' value={userId} />
          <input type='hidden' name='eventId' value={optimisticEvent.id} />
          <input type='hidden' name='trackSlug' value={trackSlug} />
          <input type='hidden' name='eventId' value={optimisticEvent.id} />
          <input type='hidden' name='trackSlug' value={trackSlug} />
          {renderHeader(
            optimisticEvent,
            isEditing,
            handleCancel,
            handleEdit,
            handleUploadClick,
            handleDeleteClick
          )}
          {renderContent(optimisticEvent, isEditing, handleDeleteAttachment)}
          {renderFooter(optimisticEvent)}
        </form>
        {error && (
          <div data-testid='error-message' className='px-6 pb-4 text-sm text-destructive'>
            {error}
          </div>
        )}
      </Card>
      {showUploadDialog && (
        <UploadDocument
          event={optimisticEvent}
          trackSlug={trackSlug}
          userId={userId}
          onUploadComplete={handleUploadComplete}
          onCancel={handleUploadCancel}
        />
      )}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button type='button' variant='destructive' onClick={handleDeleteEvent}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function renderActionsMenu(
  onEditEvent: () => void,
  onUploadDocument: () => void,
  onDeleteEvent: () => void
) {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='w-full'>
            <MoreVertical className='size-4' />
            <span className='sr-only'>Event actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem onSelect={onEditEvent}>Edit event</DropdownMenuItem>
          <DropdownMenuItem onSelect={onUploadDocument}>Upload document</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onSelect={onDeleteEvent}>
            Delete event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function EditingButtons({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus()

  return (
    <>
      <Button type='submit' size='sm' disabled={pending}>
        {pending ? 'Saving...' : 'Save'}
      </Button>
      <Button type='button' onClick={onCancel} variant='outline' size='sm' disabled={pending}>
        Cancel
      </Button>
    </>
  )
}

function renderEditingButtons(onCancel: () => void, isEditing: boolean) {
  if (!isEditing) return null

  return <EditingButtons onCancel={onCancel} />
}

function renderHeader(
  event: EventResponse,
  isEditing: boolean,
  onCancel: () => void,
  handleEdit: () => void,
  handleUploadClick: () => void,
  handleDeleteClick: () => void
) {
  return (
    <CardHeader data-testid='event-header' className='gap-4'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='flex justify-end gap-2'>
          <div className='flex gap-2'>{renderEditingButtons(onCancel, isEditing)}</div>
          {!isEditing && renderActionsMenu(handleEdit, handleUploadClick, handleDeleteClick)}
        </div>
        <div className='space-y-2'>
          {renderTitle(isEditing, event)}
          <span className='w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-primary'>
            {event.type}
          </span>
        </div>
      </div>
    </CardHeader>
  )
}

function renderTitle(isEditing: boolean, event: EventResponse) {
  if (isEditing) {
    return (
      <Field>
        <FieldLabel htmlFor='title' className='sr-only'>
          Title
        </FieldLabel>
        <FieldContent>
          <Input
            id='title'
            name='title'
            defaultValue={event.title}
            className='h-auto border-0 border-b border-border rounded-none bg-transparent p-0 shadow-none !text-3xl md:!text-3xl font-semibold leading-none focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-ring'
          />
        </FieldContent>
      </Field>
    )
  }
  return <CardTitle className='text-3xl'>{event.title}</CardTitle>
}

function renderContent(event: EventResponse, isEditing: boolean, onDeleteAttachment?: () => void) {
  return (
    <CardContent className='space-y-6'>
      {renderNotes(event, isEditing)}
      {renderAttachments(event.fileUrl, onDeleteAttachment)}
    </CardContent>
  )
}

const renderNotes = (event: EventResponse, isEditing: boolean) => {
  if (isEditing) {
    return (
      <Field>
        <FieldLabel htmlFor='notes'>Notes</FieldLabel>
        <FieldContent>
          <Textarea
            id='notes'
            name='notes'
            defaultValue={event.notes || ''}
            rows={6}
            className='resize-none'
          />
        </FieldContent>
      </Field>
    )
  }

  if (!event.notes) {
    return null
  }

  return (
    <div
      data-testid='notes-section'
      className='border border-border px-3 py-2 rounded-md text-foreground bg-cardspace-y-2'
    >
      <h3 className='text-sm font-semibold text-muted-foreground'>Notes</h3>
      <p className='text-sm leading-6'>{event.notes}</p>
    </div>
  )
}

function renderAttachments(fileUrl: string | null | undefined, onDelete?: () => void) {
  return <EventAttachment fileUrl={fileUrl} onDelete={onDelete} />
}

function renderFooter(event: EventResponse) {
  return (
    <CardFooter className='flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground'>
      <div>
        <span className='font-medium'>Created:</span> {formatTimestamp(event.createdAt)}
      </div>
      {event.updatedAt !== event.createdAt && (
        <div>
          <span className='font-medium'>Updated:</span> {formatTimestamp(event.updatedAt)}
        </div>
      )}
    </CardFooter>
  )
}
