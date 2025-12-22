'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useSession } from '@/lib/auth_client'
import { fetchUserData } from './helpers'
import type { UserWithTracks } from './types'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrackCreateDialog } from '@/components/track_create_dialog'
import { TrackTiles } from '@/components/track_tile'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [userData, setUserData] = useState<UserWithTracks | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const loadUserData = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchUserData(session.user.id)
      setUserData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/')
      return
    }

    if (session) {
      loadUserData()
    }
  }, [session, isPending, router, loadUserData])

  function renderLoading() {
    return (
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-9 w-40' />
          <Skeleton className='h-4 w-72' />
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          <Skeleton className='h-64 rounded-2xl' />
          <Skeleton className='h-64 rounded-2xl' />
          <Skeleton className='h-64 rounded-2xl' />
        </div>
      </div>
    )
  }

  function renderError() {
    return (
      <Card className='rounded-2xl border-muted/40 bg-muted/20 py-0 shadow-sm'>
        <CardHeader className='px-4 py-4 sm:px-6 sm:py-5'>
          <CardTitle className='text-base font-semibold'>Couldn’t load your tracks</CardTitle>
          <CardDescription className='text-sm'>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
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
    if (!userData?.tracks || userData.tracks.length === 0) {
      return renderEmptyState()
    }

    return <TrackTiles userId={userData.id} tracks={userData.tracks} />
  }

  function renderCreateDialog() {
    if (!session?.user?.id) return null
    return (
      <TrackCreateDialog
        userId={session.user.id}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadUserData}
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

  function renderContent() {
    if (isLoading) {
      return renderLoading()
    }

    if (error) {
      return renderError()
    }

    return (
      <div className='space-y-8'>
        {renderHeader()}
        {renderHealthTracks()}
        {renderCreateDialog()}
      </div>
    )
  }

  if (isPending || !session) {
    return null
  }

  return <div className='container mx-auto px-4 py-8 max-w-7xl'>{renderContent()}</div>
}
