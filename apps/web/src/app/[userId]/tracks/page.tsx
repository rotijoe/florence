'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth_client'
import { fetchUserData } from './helpers'
import type { UserWithTracks } from './types'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { TrackCreateDialog } from '@/components/track_create_dialog'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [userData, setUserData] = useState<UserWithTracks | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/')
      return
    }

    if (session) {
      loadUserData()
    }
  }, [session, isPending, router])

  async function loadUserData() {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchUserData()
      setUserData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  function renderLoading() {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <p className='text-lg text-muted-foreground'>Loading...</p>
      </div>
    )
  }

  function renderError() {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-lg text-destructive'>Failed to load your health tracks</p>
        <p className='text-sm text-muted-foreground'>{error}</p>
      </div>
    )
  }

  function renderEmptyState() {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-lg text-muted-foreground'>
          No health tracks yet. Start tracking your health journey!
        </p>
      </div>
    )
  }

  function renderHealthTracks() {
    if (!userData?.tracks || userData.tracks.length === 0) {
      return renderEmptyState()
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {userData.tracks.map((track) => (
          <Link
            key={track.id}
            href={`/${userData.id}/tracks/${track.slug}`}
            className='transition-transform hover:scale-105'
          >
            <Card className='h-full cursor-pointer hover:shadow-lg'>
              <CardHeader>
                <CardTitle>{track.title}</CardTitle>
                {track.description && <CardDescription>{track.description}</CardDescription>}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    )
  }

  function renderCreateDialog() {
    return (
      <TrackCreateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadUserData}
      />
    )
  }

  function renderHeader() {
    return (
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-4xl font-bold tracking-tight'>Welcome, {userData?.name || 'User'}</h1>
          <p className='text-muted-foreground mt-2'>View and manage your health tracks</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <MoreVertical className='size-4' />
              <span className='sr-only'>Page actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem onSelect={() => setIsDialogOpen(true)}>
              Create health track
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
