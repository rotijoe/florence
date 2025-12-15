'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MoreVertical, Plus } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

import {
  buildAddEventHref,
  formatTrackDate,
  getLastEventPlaceholder,
  getTrackDescriptionFallback
} from '@/app/[userId]/tracks/helpers'
import { TRACK_TILE_COPY } from './constants'
import { createInitialNotificationState } from './helpers'
import type { TrackTileProps, TrackTilesProps } from './types'

function TrackTile({
  userId,
  track,
  isNotificationsEnabled,
  onNotificationsEnabledChange
}: TrackTileProps) {
  const startDateLabel = formatTrackDate(track.createdAt)
  const lastUpdatedLabel = formatTrackDate(track.updatedAt)
  const addEventHref = buildAddEventHref(userId, track.slug)
  const lastEventPlaceholder = getLastEventPlaceholder()
  const description = getTrackDescriptionFallback(track.description)

  function renderTitleLink() {
    return (
      <Link
        href={`/${userId}/tracks/${track.slug}`}
        className='line-clamp-1 text-base font-semibold tracking-tight hover:underline hover:underline-offset-4 sm:text-lg'
      >
        {track.title}
      </Link>
    )
  }

  function renderMobileMenu() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon-sm'
            className='rounded-full'
            aria-label='Track actions'
          >
            <MoreVertical className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-52'>
          <DropdownMenuItem asChild>
            <Link href={`/${userId}/tracks/${track.slug}`}>Open track</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={addEventHref}>Add event</Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>{TRACK_TILE_COPY.deleteTrackLabel} (UI only)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  function renderMeta() {
    return (
      <div className='grid grid-cols-2 gap-3 sm:gap-4'>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>{TRACK_TILE_COPY.startDateLabel}</p>
          <p className='text-sm font-medium'>{startDateLabel}</p>
        </div>
        <div className='space-y-1'>
          <p className='text-xs text-muted-foreground'>{TRACK_TILE_COPY.lastUpdatedLabel}</p>
          <p className='text-sm font-medium'>{lastUpdatedLabel}</p>
        </div>
      </div>
    )
  }

  function renderLastEvent() {
    return (
      <div className='space-y-1'>
        <div className='flex items-center justify-between gap-3'>
          <p className='text-xs text-muted-foreground'>{lastEventPlaceholder.label}</p>
          <Badge variant='muted' className='text-[11px]'>
            UI only
          </Badge>
        </div>
        <p className='text-sm font-medium'>{lastEventPlaceholder.detail}</p>
        <p className='text-xs text-muted-foreground'>{lastEventPlaceholder.hint}</p>
      </div>
    )
  }

  function renderMobileFooterActions() {
    return (
      <div className='flex w-full flex-col gap-3 sm:hidden'>
        <Button asChild className='w-full gap-2'>
          <Link href={addEventHref}>
            <Plus className='size-4' />
            {TRACK_TILE_COPY.addEventLabel}
          </Link>
        </Button>
        <div className='flex items-center justify-between gap-3'>
          {renderNotificationsToggle()}
          <Badge variant='muted' className='shrink-0'>
            {TRACK_TILE_COPY.deleteTrackLabel}: UI only
          </Badge>
        </div>
      </div>
    )
  }

  function renderNotificationsToggle() {
    return (
      <div className='flex items-center gap-3'>
        <Switch
          checked={isNotificationsEnabled}
          onCheckedChange={onNotificationsEnabledChange}
          aria-label='Toggle notifications (UI only)'
        />
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-medium'>{TRACK_TILE_COPY.notificationsLabel}</p>
            <Badge variant='muted' className='text-[11px]'>
              {TRACK_TILE_COPY.notificationsUiOnlyHint}
            </Badge>
          </div>
          <p className='text-xs text-muted-foreground'>{isNotificationsEnabled ? 'On' : 'Off'}</p>
        </div>
      </div>
    )
  }

  function renderDesktopFooter() {
    return (
      <div className='hidden w-full items-center justify-between gap-4 sm:flex'>
        {renderNotificationsToggle()}
      </div>
    )
  }

  function renderHeader() {
    return (
      <CardHeader className='px-4 py-4 sm:px-6 sm:py-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 space-y-1'>
            <CardTitle className='min-w-0'>{renderTitleLink()}</CardTitle>
            <p className='line-clamp-2 text-sm text-muted-foreground'>{description}</p>
          </div>
          <div className='shrink-0'>{renderMobileMenu()}</div>
        </div>
      </CardHeader>
    )
  }

  function renderBody() {
    return (
      <CardContent className='space-y-4 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-5'>
        {renderMeta()}
        <Separator className='bg-muted/60' />
        {renderLastEvent()}
      </CardContent>
    )
  }

  function renderFooter() {
    return (
      <CardFooter className='border-t border-muted/40 px-4 py-4 sm:px-6 sm:py-5'>
        {renderDesktopFooter()}
        {renderMobileFooterActions()}
      </CardFooter>
    )
  }

  return (
    <Card className='rounded-2xl border-muted/40 bg-muted/20 py-0 shadow-sm transition-colors hover:bg-muted/30 hover:shadow-md'>
      {renderHeader()}
      {renderBody()}
      {renderFooter()}
    </Card>
  )
}

export function TrackTiles({ userId, tracks }: TrackTilesProps) {
  const initialState = useMemo(() => createInitialNotificationState(tracks), [tracks])
  const [notificationsEnabledById, setNotificationsEnabledById] =
    useState<Record<string, boolean>>(initialState)

  function handleNotificationsChange(trackId: string, next: boolean) {
    setNotificationsEnabledById((prev) => ({ ...prev, [trackId]: next }))
  }

  function renderTiles() {
    return tracks.map((track) => (
      <TrackTile
        key={track.id}
        userId={userId}
        track={track}
        isNotificationsEnabled={Boolean(notificationsEnabledById[track.id])}
        onNotificationsEnabledChange={(next) => handleNotificationsChange(track.id, next)}
      />
    ))
  }

  return <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>{renderTiles()}</div>
}

export { TrackTile }
