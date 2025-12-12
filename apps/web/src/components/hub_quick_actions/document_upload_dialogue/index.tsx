'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Upload } from 'lucide-react'
import type { DocumentUploadDialogueProps } from './types'

export function DocumentUploadDialogue({
  open,
  onOpenChange,
  selectedTrackTitle,
  selectedTrackSlug,
  onSuccess
}: DocumentUploadDialogueProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setSelectedFile(null)
      setTitle('')
      setNotes('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [open])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  function handleUpload() {
    if (!selectedFile || !title.trim()) {
      return
    }

    // UI-only: just close dialog and call success callback
    onSuccess?.()
    onOpenChange(false)
  }

  function handleClose() {
    onOpenChange(false)
  }

  const isUploadDisabled = !selectedFile || !title.trim()

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
            <FieldLabel htmlFor='file-upload'>File</FieldLabel>
            <FieldContent>
              <input
                ref={fileInputRef}
                id='file-upload'
                type='file'
                onChange={handleFileSelect}
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
              />
            </FieldContent>
          </Field>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button type='button' onClick={handleUpload} disabled={isUploadDisabled}>
            <Upload className='mr-2 size-4' />
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
