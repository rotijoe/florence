'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { HubQuickActionEventProps } from './types'

export function HubQuickActionEvent({
  tracks,
  userId,
  hasTracks
}: HubQuickActionEventProps) {
  const router = useRouter()

  function handleTrackSelect(trackSlug: string) {
    if (!trackSlug) {
      return
    }

    const returnTo = encodeURIComponent(`/${userId}`)
    router.push(`/${userId}/tracks/${trackSlug}/new?returnTo=${returnTo}`)
  }

  function renderTrackMenuItems() {
    return tracks.map((track) => (
      <DropdownMenuItem
        key={track.id}
        onSelect={() => handleTrackSelect(track.slug)}
        className='flex-col items-start'
      >
        <span className='text-sm font-medium'>{track.title}</span>
        <span className='text-xs text-muted-foreground'>Create new event</span>
      </DropdownMenuItem>
    ))
  }

  function renderDisabledEventButton() {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <span className='inline-flex'>
              <Button
                variant='outline'
                className='justify-between rounded-full px-5 sm:w-auto'
                type='button'
                disabled
              >
                <span>event</span>
                <Plus className='size-4 text-muted-foreground' />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Add a track before creating events</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (!hasTracks) {
    return renderDisabledEventButton()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='justify-between rounded-full px-5 sm:w-auto'
          type='button'
          aria-haspopup='listbox'
        >
          <span>event</span>
          <Plus className='size-4 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-[12rem]'>
        {renderTrackMenuItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

