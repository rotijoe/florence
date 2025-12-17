import { EventType, type EventResponse } from '@packages/types'
import { splitEventsByTime } from '../helpers'

describe('splitEventsByTime', () => {
  it('returns APPOINTMENT events in the futureAppointments array (time-aware)', () => {
    const now = new Date('2025-01-01T10:00:00.000Z')
    const events: EventResponse[] = [
      {
        id: 'appt-future',
        trackId: 't1',
        date: '2025-01-01T10:00:01.000Z',
        type: EventType.APPOINTMENT,
        title: 'Future appointment',
        notes: null,
        fileUrl: null,
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-01T09:00:00.000Z'
      },
      {
        id: 'appt-now',
        trackId: 't1',
        date: '2025-01-01T10:00:00.000Z',
        type: EventType.APPOINTMENT,
        title: 'Now appointment',
        notes: null,
        fileUrl: null,
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-01T09:00:00.000Z'
      },
      {
        id: 'note-future',
        trackId: 't1',
        date: '2025-01-02T10:00:00.000Z',
        type: EventType.NOTE,
        title: 'Future note',
        notes: null,
        fileUrl: null,
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-01T09:00:00.000Z'
      }
    ]

    const { futureAppointments, pastEvents } = splitEventsByTime(events, now)

    expect(futureAppointments.map((e) => e.id)).toEqual(['appt-future'])
    expect(pastEvents.map((e) => e.id)).toEqual(['appt-now', 'note-future'])
  })
})


