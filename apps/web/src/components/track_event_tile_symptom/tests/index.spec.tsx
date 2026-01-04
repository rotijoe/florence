import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventType, type EventResponse } from '@packages/types'
import { TrackEventTileSymptom } from '../index'

jest.mock('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions', () => ({
  deleteEventAction: jest.fn(async () => ({ error: undefined }))
}))

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

    const container = screen.getByTestId('track-event-tile-symptom')
    const button = container.querySelector('button')!
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

    const container = screen.getByTestId('track-event-tile-symptom')
    const button = container.querySelector('button')!
    await user.click(button)

    expect(screen.getByText(longNotes)).toBeInTheDocument()
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

  it('renders menu when expanded', async () => {
    const user = userEvent.setup()
    render(<TrackEventTileSymptom userId={userId} trackSlug={trackSlug} event={baseEvent} />)

    const container = screen.getByTestId('track-event-tile-symptom')
    const button = container.querySelector('button')!
    expect(screen.queryByRole('button', { name: /actions for headache/i })).not.toBeInTheDocument()

    await user.click(button)

    expect(screen.getByRole('button', { name: /actions for headache/i })).toBeInTheDocument()
  })
})

