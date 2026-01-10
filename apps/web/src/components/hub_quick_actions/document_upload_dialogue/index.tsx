'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Upload, Loader2, ChevronDownIcon } from 'lucide-react'
import { EventType } from '@packages/types'
import { useEventUpload } from '@/hooks/use_event_upload'
import { createEventAction } from '@/app/[userId]/tracks/[trackSlug]/actions'
import type { DocumentUploadDialogueProps } from './types'
import { EVENT_TYPE_LABELS, EVENT_TYPE_OPTIONS } from './constants'
import { getStatusText } from './helpers'

export function DocumentUploadDialogue({
  open,
  onOpenChange,
  selectedTrackTitle,
  selectedTrackSlug,
  userId,
  onSuccess,
  onLoadingChange
}: DocumentUploadDialogueProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [eventType, setEventType] = useState<EventType>(EventType.NOTE)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    status,
    error: uploadError,
    isUploading,
    upload,
    reset
  } = useEventUpload({
    userId,
    trackSlug: selectedTrackSlug,
    onComplete: (updatedEvent) => {
      onLoadingChange?.(false)
      onSuccess?.({ eventId: updatedEvent.id, trackSlug: selectedTrackSlug })
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    }
  })

  useEffect(() => {
    if (isUploading || isCreatingEvent) {
      onLoadingChange?.(true)
    } else if (status === 'idle' || status === 'error') {
      onLoadingChange?.(false)
    }
  }, [isUploading, isCreatingEvent, status, onLoadingChange])

  useEffect(() => {
    if (open) {
      setSelectedFile(null)
      setTitle('')
      setNotes('')
      setEventType(EventType.NOTE)
      setValidationError(null)
      reset()
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [open, reset])

  useEffect(() => {
    if (uploadError) {
      toast.error(uploadError)
      onLoadingChange?.(false)
    }
  }, [uploadError, onLoadingChange])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValidationError(null)
    }
  }

  async function handleUpload() {
    if (!selectedFile || !title.trim()) {
      setValidationError('Please select a file and enter a title')
      return
    }

    setValidationError(null)
    setIsCreatingEvent(true)
    onLoadingChange?.(true)

    try {
      // Step 1: Create event
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('trackSlug', selectedTrackSlug)
      formData.append('title', title.trim())
      formData.append('notes', notes.trim() || '')
      formData.append('type', eventType)

      const createResult = await createEventAction(formData)

      if (createResult.error || !createResult.event) {
        throw new Error(createResult.error || 'Failed to create event')
      }

      // Step 2: Upload file to the created event
      await upload({ eventId: createResult.event.id, file: selectedFile })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setValidationError(errorMessage)
      toast.error(errorMessage)
      setIsCreatingEvent(false)
      onLoadingChange?.(false)
    }
  }

  function handleClose() {
    if (isUploading || isCreatingEvent) return
    onOpenChange(false)
  }

  const isUploadDisabled = !selectedFile || !title.trim() || isUploading || isCreatingEvent
  const displayError = validationError || uploadError

  const selectedEventTypeLabel = EVENT_TYPE_LABELS[eventType]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to track your health records. Maximum file size is 10MB.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <Field>
            <FieldLabel htmlFor='track-display'>Track</FieldLabel>
            <FieldContent>
              <Input
                id='track-display'
                value={selectedTrackTitle}
                disabled
                className='bg-muted cursor-not-allowed'
                readOnly
                aria-readonly='true'
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor='event-type-select'>Event type</FieldLabel>
            <FieldContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id='event-type-select'
                    variant='outline'
                    className='w-full justify-between'
                    role='combobox'
                    aria-label='Select event type'
                    disabled={isUploading || isCreatingEvent}
                  >
                    {selectedEventTypeLabel}
                    <ChevronDownIcon className='ml-2 size-4 shrink-0 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-[var(--radix-dropdown-menu-trigger-width)]'>
                  {EVENT_TYPE_OPTIONS.map((type) => (
                    <DropdownMenuItem key={type} onClick={() => setEventType(type)}>
                      {EVENT_TYPE_LABELS[type]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor='file-upload'>File</FieldLabel>
            <FieldContent>
              <input
                ref={fileInputRef}
                id='file-upload'
                type='file'
                onChange={handleFileSelect}
                disabled={isUploading || isCreatingEvent}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              />
              {selectedFile && (
                <p className='mt-2 text-sm text-muted-foreground'>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor='title-input'>Title</FieldLabel>
            <FieldContent>
              <Input
                id='title-input'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter document title'
                disabled={isUploading || isCreatingEvent}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor='notes-textarea'>Notes</FieldLabel>
            <FieldContent>
              <Textarea
                id='notes-textarea'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Add any additional details...'
                rows={3}
                disabled={isUploading || isCreatingEvent}
              />
            </FieldContent>
          </Field>

          {displayError && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive' role='alert'>
              {displayError}
            </div>
          )}

          {(status !== 'idle' && status !== 'error') || isCreatingEvent ? (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              {(isUploading || isCreatingEvent) && <Loader2 className='size-4 animate-spin' />}
              <span>{getStatusText(isCreatingEvent, status)}</span>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={handleClose}
            disabled={isUploading || isCreatingEvent}
          >
            {status === 'success' ? 'Close' : 'Cancel'}
          </Button>
          <Button type='button' onClick={handleUpload} disabled={isUploadDisabled}>
            {isUploading || isCreatingEvent ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                {getStatusText(isCreatingEvent, status)}
              </>
            ) : (
              <>
                <Upload className='mr-2 size-4' />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
