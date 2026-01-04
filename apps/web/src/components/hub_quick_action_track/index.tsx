'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TrackCreateDialog } from '@/components/track_create_dialog'
import type { HubQuickActionTrackProps } from './types'

export function HubQuickActionTrack({ userId, onSuccess }: HubQuickActionTrackProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleSuccess() {
    setIsOpen(false)
    onSuccess?.()
  }

  return (
    <>
      <Button
        variant='outline'
        className='justify-between rounded-full px-5 sm:w-auto'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        <span>track</span>
        <Plus className='size-4 text-muted-foreground' />
      </Button>
      <TrackCreateDialog
        userId={userId}
        open={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={handleSuccess}
      />
    </>
  )
}

