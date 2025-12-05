'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HUB_SECTION_TITLES } from './constants'
import type { HubRecentActivityProps } from './types'

export function HubRecentActivity({ items }: HubRecentActivityProps) {
  if (!items || items.length === 0) {
    return (
      <Card className='border-muted/40 bg-muted/30 shadow-none'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>
            {HUB_SECTION_TITLES.recentActivity}
          </CardTitle>
          <CardDescription className='text-sm'>
            Recent updates will appear here once you start logging symptoms, events, and
            appointments.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  function renderActivityItems() {
    return items.map((item) => (
      <div key={item.id} className='flex items-center justify-between text-sm'>
        <span>{item.label}</span>
        <span className='text-xs text-muted-foreground'>{item.timestampLabel}</span>
      </div>
    ))
  }

  return (
    <Card className='border-muted/40 bg-muted/30 shadow-none'>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          {HUB_SECTION_TITLES.recentActivity}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>{renderActivityItems()}</CardContent>
    </Card>
  )
}
