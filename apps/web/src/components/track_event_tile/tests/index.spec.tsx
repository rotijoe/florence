import { render, screen } from '@testing-library/react'
import { EventType, type EventResponse } from '@packages/types'
import { TrackEventTile } from '../index'

jest.mock('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions', () => ({
  deleteEventAction: jest.fn(async () => ({ error: undefined }))
}))

describe('TrackEventTile Router', () => {
  const userId = 'user-1'
  const trackSlug = 'sleep'

  const baseEvent: EventResponse = {
    id: 'event-1',
    trackId: 'track-1',
    date: '2025-10-21T14:30:00.000Z',
    type: EventType.NOTE,
    title: 'Event title',
    notes: 'Event notes',
    fileUrl: null,
    createdAt: '2025-10-20T10:00:00.000Z',
    updatedAt: '2025-10-21T11:00:00.000Z'
  }

  it('routes to TrackEventTileStandard for standard events', () => {
    render(<TrackEventTile userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    expect(screen.getByTestId('track-event-tile-standard')).toBeInTheDocument()
    expect(screen.getByText('Event title')).toBeInTheDocument()
    expect(screen.getByText('Event notes')).toBeInTheDocument()
  })

  it('routes to TrackEventTileSymptom for symptom events', () => {
    const event: EventResponse = {
      ...baseEvent,
      type: EventType.SYMPTOM,
      symptomType: 'Headache',
      severity: 3
    }

    render(<TrackEventTile userId={userId} trackSlug={trackSlug} event={event} />)

    expect(screen.getByTestId('track-event-tile-symptom')).toBeInTheDocument()
    expect(screen.getByText('Headache')).toBeInTheDocument()
  })

  it('routes to TrackEventTileUpload for events with fileUrl', () => {
    const event: EventResponse = {
      ...baseEvent,
      fileUrl: 'https://example.com/file.pdf'
    }

    render(<TrackEventTile userId={userId} trackSlug={trackSlug} event={event} />)

    expect(screen.getByTestId('track-event-tile-upload')).toBeInTheDocument()
    expect(screen.getByText('Event title')).toBeInTheDocument()
  })

  it('prioritizes fileUrl over symptom type', () => {
    const event: EventResponse = {
      ...baseEvent,
      type: EventType.SYMPTOM,
      symptomType: 'Headache',
      severity: 3,
      fileUrl: 'https://example.com/file.pdf'
    }

    render(<TrackEventTile userId={userId} trackSlug={trackSlug} event={event} />)

    expect(screen.getByTestId('track-event-tile-upload')).toBeInTheDocument()
    expect(screen.queryByTestId('track-event-tile-symptom')).not.toBeInTheDocument()
  })
})
