import { EventType, type EventResponse } from '@packages/types'
import { sortFutureEvents } from '../helpers'

describe('sortFutureEvents', () => {
  it('sorts events ascending by date without mutating the original array', () => {
    const events: EventResponse[] = [
      {
        id: 'b',
        trackId: 't1',
        date: '2025-01-03T10:00:00.000Z',
        type: EventType.APPOINTMENT,
        title: 'Later',
        notes: null,
        fileUrl: null,
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-01T09:00:00.000Z'
      },
      {
        id: 'a',
        trackId: 't1',
        date: '2025-01-02T10:00:00.000Z',
        type: EventType.APPOINTMENT,
        title: 'Sooner',
        notes: null,
        fileUrl: null,
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-01T09:00:00.000Z'
      }
    ]

    const copy = [...events]
    const sorted = sortFutureEvents(events)

    expect(sorted.map((e) => e.id)).toEqual(['a', 'b'])
    expect(events).toEqual(copy)
  })
})

