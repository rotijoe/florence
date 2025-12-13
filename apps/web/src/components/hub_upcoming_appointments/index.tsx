'use client'

import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HUB_SECTION_TITLES } from './constants'
import type { HubUpcomingAppointmentsProps } from './types'

export function HubUpcomingAppointments({ appointments }: HubUpcomingAppointmentsProps) {
  function renderEmptyState() {
    return (
      <Card className='border-muted/40 bg-muted/30 shadow-none'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>
            {HUB_SECTION_TITLES.upcomingAppointments}
          </CardTitle>
          <CardDescription className='text-sm'>
            When you add upcoming appointments they will be listed here.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  function renderAppointmentItems() {
    return appointments.map((appointment) => (
      <Link key={appointment.id} href={appointment.href}>
        <Card className='bg-background/80 border-muted-foreground/15 shadow-none transition-colors hover:bg-muted/50'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>{appointment.title}</CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              {appointment.datetimeLabel}
              {appointment.location ? ` · ${appointment.location}` : ''}
            </CardDescription>
          </CardHeader>
        </Card>
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
    </div>
  )
}
