'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SymptomDialogue } from '@/components/hub_quick_actions/symptom_dialogue'
import type { HubQuickActionSymptomProps } from './types'

export function HubQuickActionSymptom({ tracks, userId, onSuccess }: HubQuickActionSymptomProps) {
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
        <span>Log symptom</span>
        <Plus className='size-4 text-muted-foreground' />
      </Button>
      <SymptomDialogue
        open={isOpen}
        onOpenChange={setIsOpen}
        tracks={tracks}
        userId={userId}
        onSuccess={handleSuccess}
      />
    </>
  )
}

