'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import type { TrackHeaderProps } from './types'

export function TrackHeader({ track, userId, trackSlug }: TrackHeaderProps) {
  const router = useRouter()

  function handleCreateEvent() {
    router.push(`/${userId}/tracks/${trackSlug}/new`)
  }

  return (
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
          <DropdownMenuItem disabled>Delete track</DropdownMenuItem>
          <DropdownMenuItem disabled>Export track data</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
