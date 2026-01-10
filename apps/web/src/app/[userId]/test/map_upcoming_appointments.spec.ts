import {
  mapUpcomingAppointmentsToSummary,
  mapUpcomingAppointmentsToUpcomingEvents
} from '../helpers'
import type { UpcomingAppointmentResponse } from '@packages/types'

describe('mapUpcomingAppointmentsToSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should map appointments to summary', () => {
    const appointments: UpcomingAppointmentResponse[] = [
      {
        eventId: 'event-1',
        title: 'Doctor Appointment',
        date: '2024-01-15T10:00:00Z',
        trackSlug: 'health-track'
      }
    ]

    const result = mapUpcomingAppointmentsToSummary(appointments, 'user-1')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'event-1',
      title: 'Doctor Appointment',
      datetime: '2024-01-15T10:00:00Z',
      location: null,
      href: '/user-1/tracks/health-track/event-1'
    })
  })

  it('should map multiple appointments', () => {
    const appointments: UpcomingAppointmentResponse[] = [
      {
        eventId: 'event-1',
        title: 'Appointment 1',
        date: '2024-01-15T10:00:00Z',
        trackSlug: 'track-1'
      },
      {
        eventId: 'event-2',
        title: 'Appointment 2',
        date: '2024-01-16T10:00:00Z',
        trackSlug: 'track-2'
      }
    ]

    const result = mapUpcomingAppointmentsToSummary(appointments, 'user-1')

    expect(result).toHaveLength(2)
    expect(result[0].href).toBe('/user-1/tracks/track-1/event-1')
    expect(result[1].href).toBe('/user-1/tracks/track-2/event-2')
  })

  it('should handle empty array', () => {
    const appointments: UpcomingAppointmentResponse[] = []

    const result = mapUpcomingAppointmentsToSummary(appointments, 'user-1')

    expect(result).toEqual([])
  })
})

describe('mapUpcomingAppointmentsToUpcomingEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should map appointments to upcoming events', () => {
    const appointments: UpcomingAppointmentResponse[] = [
      {
        eventId: 'event-1',
        title: 'Doctor Appointment',
        date: '2024-01-15T10:00:00Z',
        trackSlug: 'health-track'
      }
    ]

    const result = mapUpcomingAppointmentsToUpcomingEvents(appointments, 'user-1')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'event-1',
      title: 'Doctor Appointment',
      datetime: '2024-01-15T10:00:00Z',
      href: '/user-1/tracks/health-track/event-1'
    })
  })

  it('should map multiple appointments', () => {
    const appointments: UpcomingAppointmentResponse[] = [
      {
        eventId: 'event-1',
        title: 'Appointment 1',
        date: '2024-01-15T10:00:00Z',
        trackSlug: 'track-1'
      },
      {
        eventId: 'event-2',
        title: 'Appointment 2',
        date: '2024-01-16T10:00:00Z',
        trackSlug: 'track-2'
      }
    ]

    const result = mapUpcomingAppointmentsToUpcomingEvents(appointments, 'user-1')

    expect(result).toHaveLength(2)
    expect(result[0].href).toBe('/user-1/tracks/track-1/event-1')
    expect(result[1].href).toBe('/user-1/tracks/track-2/event-2')
  })

  it('should handle empty array', () => {
    const appointments: UpcomingAppointmentResponse[] = []

    const result = mapUpcomingAppointmentsToUpcomingEvents(appointments, 'user-1')

    expect(result).toEqual([])
  })
})

