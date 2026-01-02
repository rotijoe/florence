import { render, screen } from '@testing-library/react'
import { EventType, type EventResponse } from '@packages/types'
import { TrackTimeline } from '../index'

describe('TrackTimeline', () => {
  const userId = 'user-1'
  const trackSlug = 'sleep'

  it('renders empty state when no events', () => {
    render(<TrackTimeline userId={userId} trackSlug={trackSlug} pastEvents={[]} />)

    expect(screen.getByText('No events recorded yet for this track.')).toBeInTheDocument()
  })

  it('groups past events by date and renders the date label once per group', () => {
    const pastEvents: EventResponse[] = [
      {
        id: 'past-1',
        trackId: 't1',
        date: '2025-10-21T10:00:00.000Z',
        type: EventType.NOTE,
        title: 'Past event 1',
        notes: null,
        fileUrl: null,
        createdAt: '2025-10-21T10:00:00.000Z',
        updatedAt: '2025-10-21T10:00:00.000Z'
      },
      {
        id: 'past-2',
        trackId: 't1',
        date: '2025-10-21T12:00:00.000Z',
        type: EventType.RESULT,
        title: 'Past event 2',
        notes: null,
        fileUrl: null,
        createdAt: '2025-10-21T12:00:00.000Z',
        updatedAt: '2025-10-21T12:00:00.000Z'
      }
    ]

    render(<TrackTimeline userId={userId} trackSlug={trackSlug} pastEvents={pastEvents} />)

    expect(screen.getAllByText('21 October 2025')).toHaveLength(1)
    expect(screen.getByTestId('timeline-event-past-1')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-event-past-2')).toBeInTheDocument()
  })
})


