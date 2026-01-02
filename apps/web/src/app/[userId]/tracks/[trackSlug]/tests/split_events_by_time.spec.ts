import { EventType, type EventResponse } from '@packages/types'
import { splitEventsByTime } from '../helpers'

describe('splitEventsByTime', () => {
  it('returns any event with date > now in the futureEvents array, sorted ascending', () => {
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
      },
      {
        id: 'result-future',
        trackId: 't1',
        date: '2025-01-01T11:00:00.000Z',
        type: EventType.RESULT,
        title: 'Future result',
        notes: null,
        fileUrl: null,
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-01T09:00:00.000Z'
      }
    ]

    const { futureEvents, pastEvents } = splitEventsByTime(events, now)

    // Future events should include any event type with date > now, sorted ascending
    expect(futureEvents.map((e) => e.id)).toEqual(['appt-future', 'result-future', 'note-future'])
    // Past events include events at exactly now
    expect(pastEvents.map((e) => e.id)).toEqual(['appt-now'])
  })
})
