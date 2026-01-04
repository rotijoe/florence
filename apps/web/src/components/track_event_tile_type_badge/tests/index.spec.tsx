import { render, screen } from '@testing-library/react'
import { EventType, type EventResponse } from '@packages/types'
import { TrackEventTileTypeBadge } from '../index'

describe('TrackEventTileTypeBadge', () => {
  const baseEvent: EventResponse = {
    id: 'event-1',
    trackId: 'track-1',
    date: '2025-10-21T14:30:00.000Z',
    type: EventType.NOTE,
    title: 'Event title',
    notes: null,
    fileUrl: null,
    createdAt: '2025-10-20T10:00:00.000Z',
    updatedAt: '2025-10-21T11:00:00.000Z'
  }

  it('renders event type', () => {
    render(<TrackEventTileTypeBadge event={baseEvent} />)

    expect(screen.getByText('NOTE')).toBeInTheDocument()
  })

  it('renders calendar icon for appointment events', () => {
    const event: EventResponse = { ...baseEvent, type: EventType.APPOINTMENT }
    render(<TrackEventTileTypeBadge event={event} />)

    expect(screen.getByTestId('event-type-icon-APPOINTMENT')).toBeInTheDocument()
    expect(screen.getByText('APPOINTMENT')).toBeInTheDocument()
  })

  it('does not render calendar icon for non-appointment events', () => {
    render(<TrackEventTileTypeBadge event={baseEvent} />)

    expect(screen.queryByTestId('event-type-icon-APPOINTMENT')).not.toBeInTheDocument()
    expect(screen.getByText('NOTE')).toBeInTheDocument()
  })

  it('renders symptom type badge', () => {
    const event: EventResponse = { ...baseEvent, type: EventType.SYMPTOM }
    render(<TrackEventTileTypeBadge event={event} />)

    expect(screen.getByText('SYMPTOM')).toBeInTheDocument()
  })

  it('renders result type badge', () => {
    const event: EventResponse = { ...baseEvent, type: EventType.RESULT }
    render(<TrackEventTileTypeBadge event={event} />)

    expect(screen.getByText('RESULT')).toBeInTheDocument()
  })
})

