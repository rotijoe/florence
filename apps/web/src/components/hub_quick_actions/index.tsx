'use client'

import { useState } from 'react'
import { ArrowUpIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonDropdown } from '@/components/button_dropdown'
import { SymptomDialogue } from './symptom_dialogue'
import type { HubQuickActionsProps } from './types'
import { convertOptionsToDropdownItems } from './helpers'

export function HubQuickActions({
  eventOptions,
  onSelectOption,
  tracks,
  userId
}: HubQuickActionsProps) {
  const [isSymptomDialogOpen, setIsSymptomDialogOpen] = useState(false)

  function handleSymptomSuccess() {
    setIsSymptomDialogOpen(false)
    // Optionally refresh data or show success message
  }

  return (
    <>
      <div className='flex flex-col gap-3 rounded-2xl bg-muted/40 px-4 py-4 sm:px-6 sm:py-5'>
        <div>
          <p className='text-sm font-medium'>Quick log</p>
          <p className='text-sm text-muted-foreground'>
            Capture what is happening in just a few taps.
          </p>
        </div>
        <div className='-mx-4 overflow-x-auto pb-1 sm:mx-0 sm:overflow-visible'>
          <div className='flex w-max gap-3 px-4 sm:w-auto sm:px-0'>
            <Button
              variant='outline'
              className='justify-between rounded-full px-5 sm:w-auto'
              type='button'
              onClick={() => setIsSymptomDialogOpen(true)}
            >
              <span>Log symptom</span>
              <Plus className='size-4 text-muted-foreground' />
            </Button>

            <ButtonDropdown
              text='Add event'
              dropdownItems={convertOptionsToDropdownItems(
                'createEvent',
                eventOptions,
                onSelectOption
              )}
            />

            <Button
              variant='outline'
              className='justify-between rounded-full px-5 sm:w-auto'
              type='button'
            >
              <span>track</span>
              <Plus className='size-4 text-muted-foreground' />
            </Button>
            <Button
              variant='outline'
              className='justify-between rounded-full px-5 sm:w-auto'
              type='button'
            >
              <span>document</span>
              <ArrowUpIcon className='size-4 text-muted-foreground' />
            </Button>
          </div>
        </div>
      </div>

      <SymptomDialogue
        open={isSymptomDialogOpen}
        onOpenChange={setIsSymptomDialogOpen}
        tracks={tracks}
        userId={userId}
        onSuccess={handleSymptomSuccess}
      />
    </>
  )
}
