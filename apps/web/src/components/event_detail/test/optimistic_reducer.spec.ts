import { optimisticReducer } from '../helpers'
import { EventType, type EventResponse } from '@packages/types'

describe('optimisticReducer', () => {
  const baseEvent: EventResponse = {
    id: 'event-1',
    trackId: 'track-1',
    date: '2025-10-21T14:30:00.000Z',
    title: 'Original Title',
    notes: 'Original notes',
    type: EventType.NOTE,
    fileUrl: 'https://example.com/original.pdf',
    createdAt: '2025-10-21T14:30:00.000Z',
    updatedAt: '2025-10-21T14:30:00.000Z'
  }

  it('merges partial update with current event', () => {
    const optimisticValue: Partial<EventResponse> = {
      title: 'Updated Title',
      notes: 'Updated notes'
    }

    const result = optimisticReducer(baseEvent, optimisticValue)

    expect(result).toEqual({
      ...baseEvent,
      title: 'Updated Title',
      notes: 'Updated notes'
    })
  })

  it('preserves all original fields when partial update is provided', () => {
    const optimisticValue: Partial<EventResponse> = {
      notes: 'New notes'
    }

    const result = optimisticReducer(baseEvent, optimisticValue)

    expect(result.id).toBe(baseEvent.id)
    expect(result.trackId).toBe(baseEvent.trackId)
    expect(result.date).toBe(baseEvent.date)
    expect(result.title).toBe(baseEvent.title)
    expect(result.type).toBe(baseEvent.type)
    expect(result.fileUrl).toBe(baseEvent.fileUrl)
    expect(result.createdAt).toBe(baseEvent.createdAt)
    expect(result.updatedAt).toBe(baseEvent.updatedAt)
    expect(result.notes).toBe('New notes')
  })

  it('handles updating multiple fields at once', () => {
    const optimisticValue: Partial<EventResponse> = {
      title: 'New Title',
      notes: 'New Notes',
      type: EventType.APPOINTMENT,
      fileUrl: 'https://example.com/new.pdf'
    }

    const result = optimisticReducer(baseEvent, optimisticValue)

    expect(result.title).toBe('New Title')
    expect(result.notes).toBe('New Notes')
    expect(result.type).toBe(EventType.APPOINTMENT)
    expect(result.fileUrl).toBe('https://example.com/new.pdf')
  })

  it('handles empty partial update', () => {
    const optimisticValue: Partial<EventResponse> = {}

    const result = optimisticReducer(baseEvent, optimisticValue)

    expect(result).toEqual(baseEvent)
  })

  it('handles null values in optimistic update', () => {
    const optimisticValue: Partial<EventResponse> = {
      notes: null,
      fileUrl: null
    }

    const result = optimisticReducer(baseEvent, optimisticValue)

    expect(result.notes).toBeNull()
    expect(result.fileUrl).toBeNull()
    expect(result.title).toBe(baseEvent.title)
  })

  it('handles updating date field', () => {
    const optimisticValue: Partial<EventResponse> = {
      date: '2025-11-01T10:00:00.000Z'
    }

    const result = optimisticReducer(baseEvent, optimisticValue)

    expect(result.date).toBe('2025-11-01T10:00:00.000Z')
    expect(result.title).toBe(baseEvent.title)
  })
})
