'use client'

import { HubQuickActionSymptom } from '@/components/hub_quick_action_symptom'
import { HubQuickActionEvent } from '@/components/hub_quick_action_event'
import { HubQuickActionTrack } from '@/components/hub_quick_action_track'
import { HubQuickActionDocument } from '@/components/hub_quick_action_document'
import type { HubQuickActionsProps } from './types'

export function HubQuickActions({ tracks, userId, onTrackCreated }: HubQuickActionsProps) {
  const hasTracks = tracks && tracks.length > 0

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

  function RenderQuickActionButtons() {
    return (
      <div className='-mx-4 overflow-x-auto pb-1 sm:mx-0 sm:overflow-visible'>
        <div className='flex w-max gap-3 px-4 sm:w-auto sm:px-0'>
          <HubQuickActionSymptom tracks={tracks} userId={userId} />
          <HubQuickActionEvent tracks={tracks} userId={userId} hasTracks={hasTracks} />
          <HubQuickActionTrack userId={userId} onSuccess={onTrackCreated} />
          <HubQuickActionDocument tracks={tracks} userId={userId} hasTracks={hasTracks} />
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3 rounded-2xl bg-muted/40 px-4 py-4 sm:px-6 sm:py-5'>
      <RenderQuickLogHeader />
      <RenderQuickActionButtons />
    </div>
  )
}
