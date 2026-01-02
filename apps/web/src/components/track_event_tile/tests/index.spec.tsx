import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventType, type EventResponse } from '@packages/types'
import { TrackEventTile } from '../index'

jest.mock('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions', () => ({
  deleteEventAction: jest.fn(async () => ({ error: undefined }))
}))

describe('TrackEventTile', () => {
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

  it('renders title, notes, and type', () => {
    render(<TrackEventTile userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    expect(screen.getByText('Event title')).toBeInTheDocument()
    expect(screen.getByText('Event notes')).toBeInTheDocument()
    expect(screen.getAllByText('NOTE').length).toBeGreaterThan(0)
  })

  it('renders a calendar icon for appointment events', () => {
    const event: EventResponse = { ...baseEvent, type: EventType.APPOINTMENT }
    render(<TrackEventTile userId={userId} trackSlug={trackSlug} event={event} />)

    expect(screen.getAllByTestId('event-type-icon-APPOINTMENT').length).toBeGreaterThan(0)
  })

  it('renders a symptom variant', () => {
    const event: EventResponse = {
      ...baseEvent,
      type: EventType.SYMPTOM,
      symptomType: 'Headache',
      severity: 7
    }

    render(<TrackEventTile userId={userId} trackSlug={trackSlug} event={event} />)

    expect(screen.getByTestId('track-event-tile')).toHaveAttribute('data-variant', 'symptom')
  })

  it('shows an action menu with Edit and Delete', async () => {
    const user = userEvent.setup()
    render(<TrackEventTile userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /event actions/i }))
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
    expect(screen.getByText(/delete/i)).toBeInTheDocument()
  })

  it('opens a delete confirmation dialog and calls deleteEventAction on confirm', async () => {
    const user = userEvent.setup()
    const { deleteEventAction } = require('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions')

    render(<TrackEventTile userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /event actions/i }))
    await user.click(screen.getByText(/delete/i))

    expect(screen.getByText(/delete event/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(deleteEventAction).toHaveBeenCalledWith(userId, trackSlug, baseEvent.id)
  })
})


