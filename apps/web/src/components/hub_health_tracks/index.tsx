'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { TrackCreateDialog } from '@/components/track_create_dialog'
import { HUB_SECTION_TITLES } from './constants'
import type { HubHealthTracksProps } from './types'

export function HubHealthTracks({ userId, tracks }: HubHealthTracksProps) {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  function handleCreateSuccess() {
    router.refresh()
  }

  function renderEmptyState() {
    return (
      <>
        <Card className='border-muted/40 bg-muted/30 shadow-none'>
          <CardHeader>
            <CardTitle className='text-base font-semibold'>
              {HUB_SECTION_TITLES.healthTracks}
            </CardTitle>
            <CardDescription className='text-sm'>
              When you create health tracks they will appear here.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant='outline' size='sm' onClick={() => setIsCreateDialogOpen(true)}>
              Create a health track
            </Button>
          </CardFooter>
        </Card>
        <TrackCreateDialog
          userId={userId}
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleCreateSuccess}
        />
      </>
    )
  }

  function renderTrackItems() {
    return tracks.map((track) => (
      <Link key={track.id} href={`/${userId}/tracks/${track.slug}`}>
        <Card className='bg-muted/40 border-muted-foreground/10 shadow-none hover:bg-muted/60 transition-colors cursor-pointer'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>{track.title}</CardTitle>
            {track.description ? (
              <CardDescription className='text-xs sm:text-sm'>{track.description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardFooter>
            <p className='text-xs text-muted-foreground'>{track.lastUpdatedLabel}</p>
          </CardFooter>
        </Card>
      </Link>
    ))
  }

  if (!tracks || tracks.length === 0) {
    return renderEmptyState()
  }

  return (
    <>
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-base font-semibold'>{HUB_SECTION_TITLES.healthTracks}</h2>
          <Button
            variant='ghost'
            size='icon-sm'
            className='rounded-full'
            type='button'
            aria-label='Add health track'
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className='size-4' />
          </Button>
        </div>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>{renderTrackItems()}</div>
      </div>
      <TrackCreateDialog
        userId={userId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
