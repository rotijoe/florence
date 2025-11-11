import { render, screen } from '@testing-library/react'
import { EventDetail } from '../index'
import { EventType, type EventResponse } from '@packages/types'

describe('EventDetail', () => {
  const mockEvent: EventResponse = {
    id: '1',
    trackId: 'track-1',
    date: '2025-10-21T14:30:00.000Z',
    title: 'Test Event',
    description: 'Test Description',
    type: EventType.NOTE,
    fileUrl: 'https://example.com/file.pdf',
    createdAt: '2025-10-21T14:30:00.000Z',
    updatedAt: '2025-10-21T14:30:00.000Z',
  }

  it('renders event title', () => {
    render(<EventDetail event={mockEvent} />)

    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('displays formatted event date', () => {
    render(<EventDetail event={mockEvent} />)

    // There are multiple date instances, so use getAllByText
    const dates = screen.getAllByText(/21 October 2025/i)
    expect(dates.length).toBeGreaterThan(0)
  })

  it('displays event type', () => {
    render(<EventDetail event={mockEvent} />)

    expect(screen.getByText('NOTE')).toBeInTheDocument()
  })

  it('displays event notes when present', () => {
    render(<EventDetail event={mockEvent} />)

    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<EventDetail event={mockEvent} />)

    expect(screen.getByRole('button', { name: /edit event/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete event/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument()
  })

  it('displays document button when fileUrl is available', () => {
    render(<EventDetail event={mockEvent} />)

    const link = screen.getByRole('link', { name: /view attached document/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com/file.pdf')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('displays created timestamp', () => {
    render(<EventDetail event={mockEvent} />)

    expect(screen.getByText(/Created:/i)).toBeInTheDocument()
    // There are multiple date instances, so use getAllByText
    const dates = screen.getAllByText(/21 October 2025/i)
    expect(dates.length).toBeGreaterThan(0)
  })

  it('displays updated timestamp when different from created', () => {
    const eventWithUpdate: EventResponse = {
      ...mockEvent,
      updatedAt: '2025-10-22T10:00:00.000Z',
    }

    render(<EventDetail event={eventWithUpdate} />)

    expect(screen.getByText(/Updated:/i)).toBeInTheDocument()
  })

  it('does not display updated timestamp when same as created', () => {
    render(<EventDetail event={mockEvent} />)

    expect(screen.queryByText(/Updated:/i)).not.toBeInTheDocument()
  })

  it('handles event without notes', () => {
    const eventWithoutDescription: EventResponse = {
      ...mockEvent,
      description: null,
    }

    render(<EventDetail event={eventWithoutDescription} />)

    expect(screen.queryByText('Notes')).not.toBeInTheDocument()
  })

  it('handles event without fileUrl', () => {
    const eventWithoutFile: EventResponse = {
      ...mockEvent,
      fileUrl: null,
    }

    render(<EventDetail event={eventWithoutFile} />)

    expect(screen.queryByRole('link', { name: /view attached document/i })).not.toBeInTheDocument()
  })
})
