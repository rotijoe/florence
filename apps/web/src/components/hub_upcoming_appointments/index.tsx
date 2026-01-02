'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HUB_SECTION_TITLES } from './constants'
import type { HubUpcomingAppointmentsProps } from './types'
import type { AppointmentSummary } from '@/app/[userId]/types'
import { formatAppointmentDateLabel, formatAppointmentTime, fetchAllAppointments } from './helpers'

export function HubUpcomingAppointments({
  appointments: initialAppointments,
  userId,
  hasMore
}: HubUpcomingAppointmentsProps) {
  const [allAppointments, setAllAppointments] = useState<AppointmentSummary[]>(initialAppointments)
  const [isLoading, setIsLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  async function handleShowMore() {
    setIsLoading(true)
    try {
      const result = await fetchAllAppointments(userId)
      setAllAppointments(result.appointments)
      setShowAll(true)
    } catch (error) {
      console.error('Failed to fetch all appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const appointments = showAll ? allAppointments : initialAppointments
  const shouldShowButton = hasMore && !showAll

  function renderEmptyState() {
    return (
      <Card className='border-muted/40 bg-muted/30 shadow-none'>
        <CardContent className='p-4'>
          <h3 className='text-base font-semibold'>{HUB_SECTION_TITLES.upcomingAppointments}</h3>
          <p className='text-muted-foreground text-sm'>
            When you add upcoming appointments they will be listed here.
          </p>
        </CardContent>
      </Card>
    )
  }

  function renderDateBox(datetime: Date | string) {
    return (
      <div className='bg-primary text-primary-foreground flex size-16 shrink-0 items-center justify-center rounded-md text-xs font-bold'>
        {formatAppointmentDateLabel(datetime)}
      </div>
    )
  }

  function renderAppointmentItems() {
    return appointments.map((appointment) => (
      <Link key={appointment.id} href={appointment.href} className='block'>
        <div className='flex items-stretch gap-3 transition-colors'>
          {renderDateBox(appointment.datetime)}
          <Card className='bg-background/80 border-muted-foreground/15 h-16 flex-1 shadow-none transition-colors hover:bg-muted/5 py-0'>
            <CardContent className='flex h-full flex-col justify-center gap-0.5 px-4 '>
              <h4 className='text-muted-foreground text-sm leading-none'>
                {formatAppointmentTime(appointment.datetime)}
              </h4>
              <h4 className='truncate text-sm font-semibold leading-none'>{appointment.title}</h4>
            </CardContent>
          </Card>
        </div>
      </Link>
    ))
  }

  if (!appointments || appointments.length === 0) {
    return renderEmptyState()
  }

  return (
    <div className='space-y-3'>
      <h2 className='text-base font-semibold'>{HUB_SECTION_TITLES.upcomingAppointments}</h2>
      <div className='space-y-3'>{renderAppointmentItems()}</div>
      {shouldShowButton && (
        <Button variant='ghost' onClick={handleShowMore} disabled={isLoading} className='w-full'>
          {isLoading ? 'Loading...' : 'Show more'}
        </Button>
      )}
    </div>
  )
}
