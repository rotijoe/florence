'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth_client'
import { fetchUserData, createUserTrack } from './helpers'
import type { UserWithTracks } from './types'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MoreVertical } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [userData, setUserData] = useState<UserWithTracks | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [trackTitle, setTrackTitle] = useState('')
  const [trackDescription, setTrackDescription] = useState('')

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

  async function handleCreateTrack(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setCreateError(null)

    try {
      await createUserTrack(trackTitle.trim(), trackDescription.trim() || null)
      setIsDialogOpen(false)
      setTrackTitle('')
      setTrackDescription('')
      await loadUserData()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create track')
    } finally {
      setIsCreating(false)
    }
  }

  function renderCreateDialog() {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new health track</DialogTitle>
            <DialogDescription>
              Add a new health track to start tracking your health journey.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTrack}>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='track-title'>Track name</Label>
                <Input
                  id='track-title'
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder='e.g., Sleep, Hydration, Medication'
                  required
                  disabled={isCreating}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='track-description'>Description</Label>
                <Textarea
                  id='track-description'
                  value={trackDescription}
                  onChange={(e) => setTrackDescription(e.target.value)}
                  placeholder='Optional description for this track'
                  disabled={isCreating}
                />
              </div>
              {createError && <p className='text-sm text-destructive'>{createError}</p>}
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsDialogOpen(false)
                  setCreateError(null)
                  setTrackTitle('')
                  setTrackDescription('')
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
