'use client'

import { useState, useOptimistic, startTransition, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
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
import { createEventOnSaveAction } from '@/app/[userId]/tracks/[trackSlug]/new/actions'
import { EventType, type EventResponse } from '@packages/types'
import { UploadDocument } from '@/components/upload_document'
import { EventAttachment } from '@/components/attachment_list'

export function EventDetail({ event, trackSlug, userId, mode }: EventDetailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isCreateMode = mode === 'create'
  const returnTo = searchParams.get('returnTo')
  const [isEditing, setIsEditing] = useState(isCreateMode)
  const [error, setError] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [optimisticEvent, updateOptimisticEvent] = useOptimistic(event, optimisticReducer)

  // Track initial values for dirty checking
  const initialTitleRef = useRef(isCreateMode ? '' : event.title)
  const initialNotesRef = useRef(isCreateMode ? null : (event.notes ?? null))
  const [currentTitle, setCurrentTitle] = useState(initialTitleRef.current)
  const [currentNotes, setCurrentNotes] = useState(initialNotesRef.current)
  const [currentType, setCurrentType] = useState<EventType>(event.type)
  const [currentDate, setCurrentDate] = useState<string>(
    isCreateMode ? '' : new Date(event.date).toISOString().slice(0, 16)
  )

  // Calculate if form is dirty
  const isDirty =
    currentTitle !== initialTitleRef.current || currentNotes !== initialNotesRef.current

  // Unsaved change protection
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  async function formAction(formData: FormData) {
    setError(null)

    if (isCreateMode) {
      // Create mode: use createEventOnSaveAction
      const result = await createEventOnSaveAction(formData)

      if (result.error) {
        toast.error(result.error)
        setError(result.error)
        return
      }

      // Success: redirect happens in server action
      return
    }

    // Edit mode: use updateEventAction with optimistic updates
    const title = (formData.get('title') as string) ?? ''
    const notes = (formData.get('notes') as string | null) ?? null

    updateOptimisticEvent({
      title: title.trim(),
      notes: notes === '' ? null : notes,
      updatedAt: new Date().toISOString()
    })

    const result = await updateEventAction(null, formData)

    if (result.error) {
      // Rollback on error
      updateOptimisticEvent({
        title: event.title,
        notes: event.notes ?? null,
        updatedAt: event.updatedAt
      })
      toast.error(result.error)
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
      // Update initial refs for dirty checking
      initialTitleRef.current = result.event.title
      initialNotesRef.current = result.event.notes ?? null
      setCurrentTitle(result.event.title)
      setCurrentNotes(result.event.notes ?? null)
      setIsEditing(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancel = () => {
    if (isCreateMode) {
      // In create mode, navigate back to where user came from (or track page as fallback)
      const fallbackUrl = `/${userId}/tracks/${trackSlug}`
      router.push(returnTo || fallbackUrl)
      return
    }
    // In edit mode, reset to original values
    setIsEditing(false)
    setError(null)
    setCurrentTitle(initialTitleRef.current)
    setCurrentNotes(initialNotesRef.current)
    updateOptimisticEvent({
      title: event.title,
      notes: event.notes ?? null,
      updatedAt: event.updatedAt
    })
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
        toast.error(result.error)
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
      toast.error(result.error)
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
          {renderHeader(
            optimisticEvent,
            isEditing,
            handleCancel,
            handleEdit,
            handleUploadClick,
            handleDeleteClick,
            isCreateMode,
            setCurrentTitle
          )}
          {renderContent(
            optimisticEvent,
            isEditing,
            handleDeleteAttachment,
            isCreateMode,
            currentTitle,
            currentNotes,
            setCurrentTitle,
            setCurrentNotes,
            currentType,
            setCurrentType,
            currentDate,
            setCurrentDate
          )}
          {renderFooter(optimisticEvent, isCreateMode)}
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
  onDeleteEvent: () => void,
  isCreateMode: boolean
) {
  if (isCreateMode) {
    return null
  }

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
  handleDeleteClick: () => void,
  isCreateMode: boolean,
  setCurrentTitle?: (value: string) => void
) {
  return (
    <CardHeader data-testid='event-header' className='gap-4'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='flex justify-end gap-2'>
          <div className='flex gap-2'>{renderEditingButtons(onCancel, isEditing)}</div>
          {!isEditing &&
            renderActionsMenu(handleEdit, handleUploadClick, handleDeleteClick, isCreateMode)}
        </div>
        <div className='space-y-2'>
          {renderTitle(isEditing, event, setCurrentTitle)}
          <span className='w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-primary'>
            {event.type}
          </span>
        </div>
      </div>
    </CardHeader>
  )
}

function renderTitle(
  isEditing: boolean,
  event: EventResponse,
  setCurrentTitle?: (value: string) => void
) {
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
            onChange={(e) => setCurrentTitle?.(e.target.value)}
            className='h-auto border-0 border-b border-border rounded-none bg-transparent p-0 shadow-none !text-3xl md:!text-3xl font-semibold leading-none focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-ring'
          />
        </FieldContent>
      </Field>
    )
  }
  return <CardTitle className='text-3xl'>{event.title}</CardTitle>
}

function renderContent(
  event: EventResponse,
  isEditing: boolean,
  onDeleteAttachment?: () => void,
  isCreateMode?: boolean,
  currentTitle?: string,
  currentNotes?: string | null,
  setCurrentTitle?: (value: string) => void,
  setCurrentNotes?: (value: string | null) => void,
  currentType?: EventType,
  setCurrentType?: (value: EventType) => void,
  currentDate?: string,
  setCurrentDate?: (value: string) => void
) {
  return (
    <CardContent className='space-y-6'>
      {isCreateMode && renderTypeSelector(currentType, setCurrentType)}
      {isCreateMode &&
        currentType === EventType.APPOINTMENT &&
        renderAppointmentDateTime(currentDate, setCurrentDate)}
      {renderNotes(
        event,
        isEditing,
        isCreateMode,
        currentTitle,
        currentNotes,
        setCurrentTitle,
        setCurrentNotes
      )}
      {!isCreateMode && renderAttachments(event.fileUrl, onDeleteAttachment)}
    </CardContent>
  )
}

const renderNotes = (
  event: EventResponse,
  isEditing: boolean,
  isCreateMode?: boolean,
  currentTitle?: string,
  currentNotes?: string | null,
  setCurrentTitle?: (value: string) => void,
  setCurrentNotes?: (value: string | null) => void
) => {
  if (isEditing) {
    return (
      <Field>
        <FieldLabel htmlFor='notes'>Notes</FieldLabel>
        <FieldContent>
          <Textarea
            id='notes'
            name='notes'
            defaultValue={event.notes || ''}
            onChange={(e) => setCurrentNotes?.(e.target.value || null)}
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

function renderTypeSelector(currentType?: EventType, setCurrentType?: (value: EventType) => void) {
  if (!setCurrentType) return null

  return (
    <Field>
      <FieldLabel htmlFor='type'>Type</FieldLabel>
      <FieldContent>
        <select
          id='type'
          name='type'
          value={currentType || EventType.NOTE}
          onChange={(e) => setCurrentType(e.target.value as EventType)}
          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <option value={EventType.NOTE}>Note</option>
          <option value={EventType.APPOINTMENT}>Appointment</option>
          <option value={EventType.RESULT}>Result</option>
          <option value={EventType.LETTER}>Letter</option>
          <option value={EventType.FEELING}>Feeling</option>
          <option value={EventType.EXERCISE}>Exercise</option>
          <option value={EventType.SYMPTOM}>Symptom</option>
        </select>
      </FieldContent>
    </Field>
  )
}

function renderAppointmentDateTime(currentDate?: string, setCurrentDate?: (value: string) => void) {
  if (!setCurrentDate) return null

  return (
    <Field>
      <FieldLabel htmlFor='date'>Appointment datetime</FieldLabel>
      <FieldContent>
        <Input
          id='date'
          name='date'
          type='datetime-local'
          value={currentDate || ''}
          onChange={(e) => setCurrentDate(e.target.value)}
          required
        />
      </FieldContent>
    </Field>
  )
}

function renderAttachments(fileUrl: string | null | undefined, onDelete?: () => void) {
  return <EventAttachment fileUrl={fileUrl} onDelete={onDelete} />
}

function renderFooter(event: EventResponse, isCreateMode: boolean) {
  if (isCreateMode) {
    return null
  }

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
