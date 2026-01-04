import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventType, type EventResponse } from '@packages/types'
import { TrackEventTileStandard } from '../index'

jest.mock('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions', () => ({
  deleteEventAction: jest.fn(async () => ({ error: undefined }))
}))

describe('TrackEventTileStandard', () => {
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

  it('renders title, notes, and type badge', () => {
    render(<TrackEventTileStandard userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    expect(screen.getByText('Event title')).toBeInTheDocument()
    expect(screen.getByText('Event notes')).toBeInTheDocument()
    expect(screen.getAllByText('NOTE').length).toBeGreaterThan(0)
  })

  it('renders a calendar icon for appointment events', () => {
    const event: EventResponse = { ...baseEvent, type: EventType.APPOINTMENT }
    render(<TrackEventTileStandard userId={userId} trackSlug={trackSlug} event={event} />)

    expect(screen.getAllByTestId('event-type-icon-APPOINTMENT').length).toBeGreaterThan(0)
  })

  it('shows an action menu with Edit and Delete', async () => {
    const user = userEvent.setup()
    render(<TrackEventTileStandard userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /actions for event title/i }))
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
    expect(screen.getByText(/delete/i)).toBeInTheDocument()
  })

  it('opens a delete confirmation dialog and calls deleteEventAction on confirm', async () => {
    const user = userEvent.setup()
    const { deleteEventAction } = require('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions')

    render(<TrackEventTileStandard userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /actions for event title/i }))
    await user.click(screen.getByText(/delete/i))

    expect(screen.getByText(/delete event/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(deleteEventAction).toHaveBeenCalledWith(userId, trackSlug, baseEvent.id)
  })

  it('closes delete dialog when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<TrackEventTileStandard userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /actions for event title/i }))
    await user.click(screen.getByText(/delete/i))

    expect(screen.getByText(/delete event/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.queryByText(/delete event/i)).not.toBeInTheDocument()
  })

  it('renders notes without truncation', () => {
    const longNotes = 'This is a very long note that should not be truncated and should display in full'
    const event: EventResponse = { ...baseEvent, notes: longNotes }
    render(<TrackEventTileStandard userId={userId} trackSlug={trackSlug} event={event} />)

    expect(screen.getByText(longNotes)).toBeInTheDocument()
  })
})

