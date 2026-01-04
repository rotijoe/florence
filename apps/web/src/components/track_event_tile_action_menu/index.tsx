'use client'

import Link from 'next/link'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { stopLinkNavigation } from '@/lib/stop_link_navigation'
import type { TrackEventTileActionMenuProps } from './types'

export function TrackEventTileActionMenu({
  href,
  eventTitle,
  onDeleteClick,
  variant = 'default',
  symptomStyles
}: TrackEventTileActionMenuProps) {
  const isSymptom = variant === 'symptom'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isSymptom ? 'ghost' : 'outline'}
          size='sm'
          onClick={stopLinkNavigation}
          aria-label={`Actions for ${eventTitle}`}
          className={cn(
            'shrink-0',
            isSymptom && [symptomStyles?.bgColor, symptomStyles?.textColor]
          )}
        >
          <MoreVertical className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuItem onSelect={(e) => stopLinkNavigation(e)}>
          <Link href={href} className='block w-full'>
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant='destructive'
          onSelect={(e) => {
            stopLinkNavigation(e)
            onDeleteClick()
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

