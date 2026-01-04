import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventType, type EventResponse } from '@packages/types'
import { TrackEventTileUpload } from '../index'

jest.mock('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions', () => ({
  deleteEventAction: jest.fn(async () => ({ error: undefined }))
}))

describe('TrackEventTileUpload', () => {
  const userId = 'user-1'
  const trackSlug = 'sleep'

  const baseEvent: EventResponse = {
    id: 'event-1',
    trackId: 'track-1',
    date: '2025-10-21T14:30:00.000Z',
    type: EventType.RESULT,
    title: 'Lab Results',
    notes: 'Blood test results',
    fileUrl: 'https://example.com/results.pdf',
    createdAt: '2025-10-20T10:00:00.000Z',
    updatedAt: '2025-10-21T11:00:00.000Z'
  }

  it('renders title, notes, type badge, and file preview', () => {
    render(<TrackEventTileUpload userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    expect(screen.getByText('Lab Results')).toBeInTheDocument()
    expect(screen.getByText('Blood test results')).toBeInTheDocument()
    expect(screen.getAllByText('RESULT').length).toBeGreaterThan(0)
    expect(screen.getByText('results.pdf')).toBeInTheDocument()
  })

  it('shows an action menu with Edit and Delete', async () => {
    const user = userEvent.setup()
    render(<TrackEventTileUpload userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /actions for lab results/i }))
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
    expect(screen.getByText(/delete/i)).toBeInTheDocument()
  })

  it('opens a delete confirmation dialog and calls deleteEventAction on confirm', async () => {
    const user = userEvent.setup()
    const { deleteEventAction } = require('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions')

    render(<TrackEventTileUpload userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /actions for lab results/i }))
    await user.click(screen.getByText(/delete/i))

    expect(screen.getByText(/delete event/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(deleteEventAction).toHaveBeenCalledWith(userId, trackSlug, baseEvent.id)
  })

  it('renders notes without truncation', () => {
    const longNotes = 'This is a very long note that should not be truncated and should display in full'
    const event: EventResponse = { ...baseEvent, notes: longNotes }
    render(<TrackEventTileUpload userId={userId} trackSlug={trackSlug} event={event} />)

    expect(screen.getByText(longNotes)).toBeInTheDocument()
  })

  it('renders text file icon for .txt files', () => {
    const event: EventResponse = {
      ...baseEvent,
      fileUrl: 'https://example.com/notes.txt'
    }
    render(<TrackEventTileUpload userId={userId} trackSlug={trackSlug} event={event} />)

    expect(screen.getByText('notes.txt')).toBeInTheDocument()
  })

  it('closes delete dialog when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<TrackEventTileUpload userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /actions for lab results/i }))
    await user.click(screen.getByText(/delete/i))

    expect(screen.getByText(/delete event/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.queryByText(/delete event/i)).not.toBeInTheDocument()
  })

  it('handles Edit menu item click', async () => {
    const user = userEvent.setup()
    render(<TrackEventTileUpload userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /actions for lab results/i }))
    const editLink = screen.getByText(/edit/i).closest('a')

    expect(editLink).toHaveAttribute('href', `/${userId}/tracks/${trackSlug}/${baseEvent.id}`)
  })
})

