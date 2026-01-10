'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TrackCreateDialog } from '@/components/track_create_dialog'
import type { HubQuickActionTrackProps } from './types'

export function HubQuickActionTrack({ userId, onSuccess }: HubQuickActionTrackProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)

  function handleSuccess() {
    setIsOpen(false)
    setIsLoading(false)
    setIsHighlighted(true)
    setTimeout(() => setIsHighlighted(false), 3000)
    toast.success('Track created successfully')
    onSuccess?.()
  }

  function handleLoadingChange(loading: boolean) {
    setIsLoading(loading)
    if (!loading && !isOpen) {
      // Success case - dialog closed after loading
      setIsHighlighted(true)
      setTimeout(() => setIsHighlighted(false), 3000)
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open)
    if (!open) {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant='outline'
        className={cn(
          'justify-between rounded-full px-5 sm:w-auto transition-colors duration-300',
          (isLoading || isHighlighted) &&
            'bg-green-300 hover:bg-green-200 text-white border-green-500'
        )}
        type='button'
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
      >
        {isLoading && <Loader2 className='mr-2 size-4 animate-spin' />}
        <span>track</span>
        {!isLoading && <Plus className='size-4 text-muted-foreground' />}
      </Button>
      <TrackCreateDialog
        userId={userId}
        open={isOpen}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
        onLoadingChange={handleLoadingChange}
      />
    </>
  )
}
