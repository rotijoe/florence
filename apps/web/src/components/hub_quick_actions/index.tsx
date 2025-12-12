'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SymptomDialogue } from './symptom_dialogue'
import { TrackCreateDialog } from '@/components/track_create_dialog'
import type { HubQuickActionsProps } from './types'

export function HubQuickActions({ tracks, userId, onTrackCreated }: HubQuickActionsProps) {
  const router = useRouter()
  const [isSymptomDialogOpen, setIsSymptomDialogOpen] = useState(false)
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false)
  const hasTracks = tracks && tracks.length > 0

  function handleTrackSelect(trackSlug: string) {
    if (!trackSlug) {
      return
    }

    const returnTo = encodeURIComponent(`/${userId}`)
    router.push(`/${userId}/tracks/${trackSlug}/new?returnTo=${returnTo}`)
  }

  function handleSymptomSuccess() {
    setIsSymptomDialogOpen(false)
    // Optionally refresh data or show success message
  }

  function handleTrackSuccess() {
    setIsTrackDialogOpen(false)
    onTrackCreated?.()
  }

  function RenderQuickLogHeader() {
    return (
      <div>
        <p className='text-sm font-medium'>Quick log</p>
        <p className='text-sm text-muted-foreground'>
          Capture what is happening in just a few taps.
        </p>
      </div>
    )
  }

  function RenderLogSymptomButton() {
    return (
      <Button
        variant='outline'
        className='justify-between rounded-full px-5 sm:w-auto'
        type='button'
        onClick={() => setIsSymptomDialogOpen(true)}
      >
        <span>Log symptom</span>
        <Plus className='size-4 text-muted-foreground' />
      </Button>
    )
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

  function RenderAddEventDropdown() {
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

  function RenderTrackButton() {
    return (
      <Button
        variant='outline'
        className='justify-between rounded-full px-5 sm:w-auto'
        type='button'
        onClick={() => setIsTrackDialogOpen(true)}
      >
        <span>track</span>
        <Plus className='size-4 text-muted-foreground' />
      </Button>
    )
  }

  function RenderDocumentButton() {
    return (
      <Button
        variant='outline'
        className='justify-between rounded-full px-5 sm:w-auto'
        type='button'
      >
        <span>document</span>
        <ArrowUpIcon className='size-4 text-muted-foreground' />
      </Button>
    )
  }

  function RenderQuickActionButtons() {
    return (
      <div className='-mx-4 overflow-x-auto pb-1 sm:mx-0 sm:overflow-visible'>
        <div className='flex w-max gap-3 px-4 sm:w-auto sm:px-0'>
          <RenderLogSymptomButton />
          <RenderAddEventDropdown />
          <RenderTrackButton />
          <RenderDocumentButton />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='flex flex-col gap-3 rounded-2xl bg-muted/40 px-4 py-4 sm:px-6 sm:py-5'>
        <RenderQuickLogHeader />
        <RenderQuickActionButtons />
      </div>
      <SymptomDialogue
        open={isSymptomDialogOpen}
        onOpenChange={setIsSymptomDialogOpen}
        tracks={tracks}
        userId={userId}
        onSuccess={handleSymptomSuccess}
      />
      <TrackCreateDialog
        open={isTrackDialogOpen}
        onOpenChange={setIsTrackDialogOpen}
        onSuccess={handleTrackSuccess}
      />
    </>
  )
}
