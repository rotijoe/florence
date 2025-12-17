import { render, screen } from '@testing-library/react'
import { EventType, type EventResponse } from '@packages/types'
import { TrackTimeline } from '../index'

function isBefore(a: HTMLElement, b: HTMLElement) {
  const position = a.compareDocumentPosition(b)
  return Boolean(position & Node.DOCUMENT_POSITION_FOLLOWING)
}

describe('TrackTimeline', () => {
  const userId = 'user-1'
  const trackSlug = 'sleep'

  it('renders a single connector line', () => {
    render(<TrackTimeline userId={userId} trackSlug={trackSlug} futureAppointments={[]} pastEvents={[]} />)

    expect(screen.getAllByTestId('timeline-connector')).toHaveLength(1)
  })

  it('renders a Past events divider only when there are future appointments', () => {
    const futureAppointments: EventResponse[] = [
      {
        id: 'future-1',
        trackId: 't1',
        date: '2025-01-02T10:00:00.000Z',
        type: EventType.APPOINTMENT,
        title: 'GP follow-up',
        notes: null,
        fileUrl: null,
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-01T09:00:00.000Z'
      }
    ]

    render(
      <TrackTimeline
        userId={userId}
        trackSlug={trackSlug}
        futureAppointments={futureAppointments}
        pastEvents={[]}
      />
    )

    expect(screen.getByText(/past events/i)).toBeInTheDocument()
  })

  it('does not render a Past events divider when there are no future appointments', () => {
    render(<TrackTimeline userId={userId} trackSlug={trackSlug} futureAppointments={[]} pastEvents={[]} />)

    expect(screen.queryByText(/past events/i)).not.toBeInTheDocument()
  })

  it('sorts future appointments ascending by date', () => {
    const futureAppointments: EventResponse[] = [
      {
        id: 'later',
        trackId: 't1',
        date: '2025-01-03T10:00:00.000Z',
        type: EventType.APPOINTMENT,
        title: 'Later appointment',
        notes: null,
        fileUrl: null,
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-01T09:00:00.000Z'
      },
      {
        id: 'sooner',
        trackId: 't1',
        date: '2025-01-02T10:00:00.000Z',
        type: EventType.APPOINTMENT,
        title: 'Sooner appointment',
        notes: null,
        fileUrl: null,
        createdAt: '2025-01-01T09:00:00.000Z',
        updatedAt: '2025-01-01T09:00:00.000Z'
      }
    ]

    render(
      <TrackTimeline
        userId={userId}
        trackSlug={trackSlug}
        futureAppointments={futureAppointments}
        pastEvents={[]}
      />
    )

    const sooner = screen.getByTestId('timeline-event-sooner')
    const later = screen.getByTestId('timeline-event-later')
    expect(isBefore(sooner, later)).toBe(true)
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

    render(
      <TrackTimeline userId={userId} trackSlug={trackSlug} futureAppointments={[]} pastEvents={pastEvents} />
    )

    expect(screen.getAllByText('21 October 2025')).toHaveLength(1)
    expect(screen.getByTestId('timeline-event-past-1')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-event-past-2')).toBeInTheDocument()
  })
})


