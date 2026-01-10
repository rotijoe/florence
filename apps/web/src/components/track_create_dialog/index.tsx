'use client'

import { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { createTrack } from './helpers'
import type { TrackCreateDialogProps } from './types'

export function TrackCreateDialog({
  userId,
  open,
  onOpenChange,
  onSuccess,
  onLoadingChange
}: TrackCreateDialogProps) {
  const [trackTitle, setTrackTitle] = useState('')
  const [trackDescription, setTrackDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTrackTitle('')
      setTrackDescription('')
      setError(null)
    }
  }, [open])

  function handleClose() {
    onOpenChange(false)
    setError(null)
    setTrackTitle('')
    setTrackDescription('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setError(null)
    onLoadingChange?.(true)

    try {
      await createTrack(userId, trackTitle.trim(), trackDescription.trim() || null)
      toast.success('Track created successfully')
      onLoadingChange?.(false)
      onOpenChange(false)
      setTrackTitle('')
      setTrackDescription('')
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create track'
      setError(errorMessage)
      toast.error(errorMessage)
      onLoadingChange?.(false)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create new health track</DialogTitle>
          <DialogDescription>
            Add a new health track to start tracking your health journey.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='track-title'>Track name</Label>
              <Input
                id='track-title'
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder='e.g., Sleep, Hydration, Medication'
                required
                disabled={isCreating}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='track-description'>Description</Label>
              <Textarea
                id='track-description'
                value={trackDescription}
                onChange={(e) => setTrackDescription(e.target.value)}
                placeholder='Optional description for this track'
                disabled={isCreating}
              />
            </div>
            {error && (
              <p className='text-sm text-destructive' role='alert'>
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type='submit' disabled={isCreating}>
              {isCreating && <Loader2 className='mr-2 size-4 animate-spin' />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
