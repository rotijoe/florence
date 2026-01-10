'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AddEventButtonProps } from './types'

export function AddEventButton({ userId, trackSlug }: AddEventButtonProps) {
  const router = useRouter()

  function handleClick() {
    const returnTo = encodeURIComponent(`/${userId}/tracks/${trackSlug}`)
    router.push(`/${userId}/tracks/${trackSlug}/new?returnTo=${returnTo}`)
  }

  return (
    <Button onClick={handleClick} variant='outline' className='w-full'>
      <Plus className='mr-2 size-4' />
      Add event
    </Button>
  )
}
