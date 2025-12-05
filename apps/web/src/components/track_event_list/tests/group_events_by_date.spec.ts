import { EventType, type EventResponse } from '@packages/types'
import { groupEventsByDate } from '../helpers'

describe('groupEventsByDate', () => {
  const mockEvents: EventResponse[] = [
    {
      id: '1',
      trackId: 'track-1',
      date: '2025-05-09T09:00:00.000Z',
      title: 'Morning Meeting',
      notes: null,
      type: EventType.APPOINTMENT,
      fileUrl: null,
      createdAt: '2025-05-09T09:00:00.000Z',
      updatedAt: '2025-05-09T09:00:00.000Z'
    },
    {
      id: '2',
      trackId: 'track-1',
      date: '2025-05-09T15:00:00.000Z',
      title: 'Afternoon Session',
      notes: null,
      type: EventType.NOTE,
      fileUrl: null,
      createdAt: '2025-05-09T15:00:00.000Z',
      updatedAt: '2025-05-09T15:00:00.000Z'
    },
    {
      id: '3',
      trackId: 'track-1',
      date: '2025-05-08T18:00:00.000Z',
      title: 'Evening Review',
      notes: null,
      type: EventType.RESULT,
      fileUrl: null,
      createdAt: '2025-05-08T18:00:00.000Z',
      updatedAt: '2025-05-08T18:00:00.000Z'
    }
  ]

  it('groups events by their calendar date in original order', () => {
    const groups = groupEventsByDate(mockEvents)

    expect(groups).toHaveLength(2)
    expect(groups[0].date).toBe('2025-05-09')
    expect(groups[0].events).toHaveLength(2)
    expect(groups[0].events[0].id).toBe('1')
    expect(groups[1].date).toBe('2025-05-08')
  })

  it('handles empty array', () => {
    const groups = groupEventsByDate([])

    expect(groups).toHaveLength(0)
  })

  it('handles single event', () => {
    const groups = groupEventsByDate([mockEvents[0]])

    expect(groups).toHaveLength(1)
    expect(groups[0].date).toBe('2025-05-09')
    expect(groups[0].events).toHaveLength(1)
    expect(groups[0].events[0].id).toBe('1')
  })

  it('preserves event order within same date group', () => {
    const events: EventResponse[] = [
      mockEvents[0],
      mockEvents[1],
      {
        ...mockEvents[0],
        id: '4',
        date: '2025-05-09T20:00:00.000Z'
      }
    ]

    const groups = groupEventsByDate(events)

    expect(groups[0].events).toHaveLength(3)
    expect(groups[0].events[0].id).toBe('1')
    expect(groups[0].events[1].id).toBe('2')
    expect(groups[0].events[2].id).toBe('4')
  })
})
