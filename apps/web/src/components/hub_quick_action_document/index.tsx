'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DocumentUploadDialogue } from '@/components/hub_quick_actions/document_upload_dialogue'
import type { HubQuickActionDocumentProps } from './types'

export function HubQuickActionDocument({ tracks, hasTracks, userId }: HubQuickActionDocumentProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<{ slug: string; title: string } | null>(null)

  function handleTrackSelect(trackSlug: string) {
    if (!trackSlug) return
    const track = tracks.find((t) => t.slug === trackSlug)
    if (track) {
      setSelectedTrack({ slug: track.slug, title: track.title })
      setIsOpen(true)
    }
  }

  function handleSuccess({ eventId, trackSlug }: { eventId: string; trackSlug: string }) {
    setIsOpen(false)
    setSelectedTrack(null)
    toast.success('Document uploaded successfully', {
      action: {
        label: 'View event',
        onClick: () => {
          router.push(`/${userId}/tracks/${trackSlug}/${eventId}`)
        }
      }
    })
  }

  function renderDocumentMenuItems() {
    return tracks.map((track) => (
      <DropdownMenuItem
        key={track.id}
        onSelect={() => handleTrackSelect(track.slug)}
        className='flex-col items-start'
      >
        <span className='text-sm font-medium'>{track.title}</span>
        <span className='text-xs text-muted-foreground'>Upload document</span>
      </DropdownMenuItem>
    ))
  }

  function renderDisabledDocumentButton() {
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
                <span>document</span>
                <ArrowUpIcon className='size-4 text-muted-foreground' />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Add a track before uploading documents</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (!hasTracks) {
    return renderDisabledDocumentButton()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            className='justify-between rounded-full px-5 sm:w-auto'
            type='button'
            aria-haspopup='listbox'
          >
            <span>document</span>
            <ArrowUpIcon className='size-4 text-muted-foreground' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='min-w-[12rem]'>
          {renderDocumentMenuItems()}
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedTrack && (
        <DocumentUploadDialogue
          open={isOpen}
          onOpenChange={setIsOpen}
          selectedTrackTitle={selectedTrack.title}
          selectedTrackSlug={selectedTrack.slug}
          userId={userId}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
