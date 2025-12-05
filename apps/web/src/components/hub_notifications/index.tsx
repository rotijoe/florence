'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { HUB_SECTION_TITLES } from './constants'
import { hubHasNotifications } from './helpers'
import type { HubNotificationsProps } from './types'

export function HubNotifications({ notifications }: HubNotificationsProps) {
  if (!hubHasNotifications(notifications)) {
    return (
      <Card className='border-muted/40 bg-muted/40 shadow-none'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>
            {HUB_SECTION_TITLES.notifications}
          </CardTitle>
          <CardDescription className='text-sm'>
            You have no reminders right now. New suggestions will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  function renderItems() {
    return notifications.map((notification, index) => {
      const showSeparator = index < notifications.length - 1

      return (
        <div key={notification.id} className='space-y-2'>
          <div className='flex flex-col items-start justify-between gap-3'>
            <div className='flex justify-between items-start w-full gap-1.5v'>
              <div>
                <p className='font-medium text-sm sm:text-[15px]'>{notification.title}</p>
              </div>
              <Button
                variant='outline'
                size='icon-sm'
                className='rounded-full bg-transparent p-0 shadow-none'
                type='button'
                aria-label='Dismiss notification'
              >
                <X className='size-3.5' />
              </Button>
            </div>
            <div className='flex justify-between w-full gap-1.5'>
              {notification.ctaLabel ? (
                <Button variant='outline' size='sm' type='button'>
                  {notification.ctaLabel}
                </Button>
              ) : null}
            </div>
          </div>
          {showSeparator ? <Separator className='my-6' /> : null}
        </div>
      )
    })
  }

  return (
    <Card className='border-muted/40 bg-muted/40 shadow-none'>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          {HUB_SECTION_TITLES.notifications}
        </CardTitle>
        <CardDescription className='text-sm'>
          Gentle reminders to keep your health record up to date.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>{renderItems()}</CardContent>
    </Card>
  )
}
