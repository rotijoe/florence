import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventType, type EventResponse } from '@packages/types'
import {
  TrackEventTile,
  TrackEventTileSymptom,
  TrackEventTileStandard,
  TrackEventTileUpload
} from '../index'

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

    await user.click(screen.getByRole('button', { name: /event actions/i }))
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
    expect(screen.getByText(/delete/i)).toBeInTheDocument()
  })

  it('opens a delete confirmation dialog and calls deleteEventAction on confirm', async () => {
    const user = userEvent.setup()
    const { deleteEventAction } = require('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions')

    render(<TrackEventTileStandard userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /event actions/i }))
    await user.click(screen.getByText(/delete/i))

    expect(screen.getByText(/delete event/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(deleteEventAction).toHaveBeenCalledWith(userId, trackSlug, baseEvent.id)
  })

  it('closes delete dialog when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<TrackEventTileStandard userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /event actions/i }))
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

describe('TrackEventTileSymptom', () => {
  const userId = 'user-1'
  const trackSlug = 'sleep'

  const baseEvent: EventResponse = {
    id: 'event-1',
    trackId: 'track-1',
    date: '2025-10-21T14:30:00.000Z',
    type: EventType.SYMPTOM,
    title: 'Symptom',
    symptomType: 'Headache',
    severity: 3,
    notes: 'Severe headache',
    fileUrl: null,
    createdAt: '2025-10-20T10:00:00.000Z',
    updatedAt: '2025-10-21T11:00:00.000Z'
  }

  it('renders symptomType text', () => {
    render(<TrackEventTileSymptom userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    expect(screen.getByText('Headache')).toBeInTheDocument()
  })

  it('expands and collapses notes on click', async () => {
    const user = userEvent.setup()
    render(<TrackEventTileSymptom userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    const button = screen.getByTestId('track-event-tile-symptom')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Severe headache')).not.toBeInTheDocument()

    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Severe headache')).toBeInTheDocument()

    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Severe headache')).not.toBeInTheDocument()
  })

  it('renders notes without truncation when expanded', async () => {
    const user = userEvent.setup()
    const longNotes = 'This is a very long note that should not be truncated and should display in full'
    const event: EventResponse = { ...baseEvent, notes: longNotes }
    render(<TrackEventTileSymptom userId={userId} trackSlug={trackSlug} event={event} />)

    const button = screen.getByTestId('track-event-tile-symptom')
    await user.click(button)

    expect(screen.getByText(longNotes)).toBeInTheDocument()
  })

  it('does not render menu or delete dialog', () => {
    render(<TrackEventTileSymptom userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    expect(screen.queryByRole('button', { name: /event actions/i })).not.toBeInTheDocument()
  })

  it('applies correct background color for severity 1', () => {
    const event: EventResponse = { ...baseEvent, severity: 1 }
    render(<TrackEventTileSymptom userId={userId} trackSlug={trackSlug} event={event} />)

    const button = screen.getByTestId('track-event-tile-symptom')
    expect(button).toHaveClass('bg-emerald-500')
  })

  it('applies correct background color for severity 5', () => {
    const event: EventResponse = { ...baseEvent, severity: 5 }
    render(<TrackEventTileSymptom userId={userId} trackSlug={trackSlug} event={event} />)

    const button = screen.getByTestId('track-event-tile-symptom')
    expect(button).toHaveClass('bg-rose-600')
  })

  it('applies correct background color for severity 2', () => {
    const event: EventResponse = { ...baseEvent, severity: 2 }
    render(<TrackEventTileSymptom userId={userId} trackSlug={trackSlug} event={event} />)

    const button = screen.getByTestId('track-event-tile-symptom')
    expect(button).toHaveClass('bg-yellow-500')
  })

  it('applies correct background color for severity 4', () => {
    const event: EventResponse = { ...baseEvent, severity: 4 }
    render(<TrackEventTileSymptom userId={userId} trackSlug={trackSlug} event={event} />)

    const button = screen.getByTestId('track-event-tile-symptom')
    expect(button).toHaveClass('bg-red-500')
  })
})

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

    await user.click(screen.getByRole('button', { name: /event actions/i }))
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
    expect(screen.getByText(/delete/i)).toBeInTheDocument()
  })

  it('opens a delete confirmation dialog and calls deleteEventAction on confirm', async () => {
    const user = userEvent.setup()
    const { deleteEventAction } = require('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions')

    render(<TrackEventTileUpload userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /event actions/i }))
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

    await user.click(screen.getByRole('button', { name: /event actions/i }))
    await user.click(screen.getByText(/delete/i))

    expect(screen.getByText(/delete event/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.queryByText(/delete event/i)).not.toBeInTheDocument()
  })

  it('handles Edit menu item click', async () => {
    const user = userEvent.setup()
    render(<TrackEventTileUpload userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    await user.click(screen.getByRole('button', { name: /event actions/i }))
    const editLink = screen.getByText(/edit/i).closest('a')

    expect(editLink).toHaveAttribute('href', `/${userId}/tracks/${trackSlug}/${baseEvent.id}`)
  })
})
