'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'
import type { EventResponse } from '@packages/types'
import { Upload, Loader2 } from 'lucide-react'
import { useEventUpload } from '@/hooks/use_event_upload'

type UploadDocumentProps = {
  event: EventResponse
  trackSlug: string
  userId: string
  onUploadComplete: (updatedEvent: EventResponse) => void
  onCancel: () => void
}

export function UploadDocument({
  event,
  trackSlug,
  userId,
  onUploadComplete,
  onCancel
}: UploadDocumentProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    status,
    error: uploadError,
    isUploading,
    upload
  } = useEventUpload({
    userId,
    eventId: event.id,
    trackSlug,
    onComplete: (updatedEvent) => {
      setTimeout(() => {
        onUploadComplete(updatedEvent)
        setIsOpen(false)
      }, 500)
    }
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValidationError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setValidationError('Please select a file')
      return
    }
    setValidationError(null)
    await upload(selectedFile)
  }

  const handleClose = () => {
    if (isUploading) return
    setIsOpen(false)
    onCancel()
  }

  const getStatusText = () => {
    switch (status) {
      case 'getting-url':
        return 'Preparing upload...'
      case 'uploading':
        return 'Uploading file...'
      case 'confirming':
        return 'Saving...'
      case 'success':
        return 'Upload complete!'
      case 'error':
        return 'Upload failed'
      default:
        return 'Select a file to upload'
    }
  }

  const displayError = validationError || uploadError

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document for this event. Maximum file size is 10MB.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Field>
            <FieldLabel htmlFor="file-upload">File</FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </FieldContent>
          </Field>
          {displayError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {displayError}
            </div>
          )}
          {status !== 'idle' && status !== 'error' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isUploading && <Loader2 className="size-4 animate-spin" />}
              <span>{getStatusText()}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
            {status === 'success' ? 'Close' : 'Cancel'}
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {getStatusText()}
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
