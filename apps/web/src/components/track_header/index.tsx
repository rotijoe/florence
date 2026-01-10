'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import type { TrackHeaderProps } from './types'

export function TrackHeader({ track, userId, trackSlug }: TrackHeaderProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleCreateEvent() {
    const returnTo = encodeURIComponent(`/${userId}/tracks/${trackSlug}`)
    router.push(`/${userId}/tracks/${trackSlug}/new?returnTo=${returnTo}`)
  }

  function handleDeleteClick() {
    setShowDeleteDialog(true)
  }

  function handleDeleteCancel() {
    setShowDeleteDialog(false)
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      const { deleteTrackAction } = await import(
        '@/app/[userId]/tracks/[trackSlug]/actions'
      )
      const result = await deleteTrackAction(userId, trackSlug)

      if (result.error) {
        toast.error(result.error)
        setShowDeleteDialog(false)
        return
      }

      // If successful, redirect happens in the action
      // But we can close the dialog just in case
      setShowDeleteDialog(false)
    })
  }

  return (
    <>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>{track.name}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <MoreVertical className='size-4' />
              <span className='sr-only'>Page actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem onSelect={handleCreateEvent}>Create event</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleDeleteClick}>Delete track</DropdownMenuItem>
            <DropdownMenuItem disabled>Export track data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete track</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{track.name}&quot;? This will permanently
                delete the track and all its events. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleDeleteCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={handleConfirmDelete}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
