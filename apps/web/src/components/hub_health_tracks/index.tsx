'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { HUB_SECTION_TITLES } from './constants'
import type { HubHealthTracksProps } from './types'

export function HubHealthTracks({ tracks }: HubHealthTracksProps) {
  function renderEmptyState() {
    return (
      <Card className="border-muted/40 bg-muted/30 shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {HUB_SECTION_TITLES.healthTracks}
          </CardTitle>
          <CardDescription className="text-sm">
            When you create health tracks they will appear here.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" size="sm">
            Create a health track
          </Button>
        </CardFooter>
      </Card>
    )
  }

  function renderTrackItems() {
    return tracks.map((track) => (
      <Card
        key={track.id}
        className="bg-muted/40 border-muted-foreground/10 shadow-none hover:bg-muted/60 transition-colors"
      >
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{track.title}</CardTitle>
          {track.description ? (
            <CardDescription className="text-xs sm:text-sm">{track.description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardFooter>
          <p className="text-xs text-muted-foreground">{track.lastUpdatedLabel}</p>
        </CardFooter>
      </Card>
    ))
  }

  if (!tracks || tracks.length === 0) {
    return renderEmptyState()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{HUB_SECTION_TITLES.healthTracks}</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          type="button"
          aria-label="Add health track"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{renderTrackItems()}</div>
    </div>
  )
}

