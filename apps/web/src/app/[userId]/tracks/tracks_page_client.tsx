'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import type { TrackResponse } from '@packages/types'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrackCreateDialog } from '@/components/track_create_dialog'
import { TrackTiles } from '@/components/track_tile'

interface TracksPageClientProps {
  userId: string
  tracks: TrackResponse[]
}

export function TracksPageClient({ userId, tracks }: TracksPageClientProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function handleSuccess() {
    setIsDialogOpen(false)
    router.refresh()
  }

  function renderEmptyState() {
    return (
      <Card className='rounded-2xl border-muted/40 bg-muted/20 py-0 shadow-sm'>
        <CardHeader className='px-4 py-4 sm:px-6 sm:py-5'>
          <CardTitle className='text-base font-semibold'>No tracks yet</CardTitle>
          <CardDescription className='text-sm'>
            Create your first track to keep notes, uploads, and events in one place.
          </CardDescription>
        </CardHeader>
        <CardFooter className='border-t border-muted/40 px-4 py-4 sm:px-6 sm:py-5'>
          <Button className='gap-2' onClick={() => setIsDialogOpen(true)}>
            <Plus className='size-4' />
            Create track
          </Button>
        </CardFooter>
      </Card>
    )
  }

  function renderHealthTracks() {
    if (!tracks || tracks.length === 0) {
      return renderEmptyState()
    }

    return <TrackTiles userId={userId} tracks={tracks} />
  }

  function renderCreateDialog() {
    return (
      <TrackCreateDialog
        userId={userId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
      />
    )
  }

  function renderHeader() {
    return (
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>Your tracks</h1>
          <p className='text-sm text-muted-foreground sm:text-base'>
            A simple place to keep health notes and uploads.
          </p>
        </div>
        <Button className='gap-2 sm:w-auto' onClick={() => setIsDialogOpen(true)}>
          <Plus className='size-4' />
          Create track
        </Button>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <div className='space-y-8'>
        {renderHeader()}
        {renderHealthTracks()}
        {renderCreateDialog()}
      </div>
    </div>
  )
}

