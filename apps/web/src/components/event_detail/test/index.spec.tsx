import { render, screen, fireEvent } from '@testing-library/react'
import { EventDetail } from '../index'
import { EventType, type EventResponse } from '@packages/types'

describe('EventDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
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

  it('renders notes section with bordered container', () => {
    const { container } = render(<EventDetail event={mockEvent} />)

    const notesSection = container.querySelector('.rounded-md.border')
    expect(notesSection).toBeInTheDocument()
    expect(notesSection).toHaveTextContent('Notes')
    expect(notesSection).toHaveTextContent('Test Description')
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

  describe('edit mode', () => {
    it('enters edit mode when edit event menu item is clicked', () => {
      render(<EventDetail event={mockEvent} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      fireEvent.click(menuButton)

      const editMenuItem = screen.getByRole('menuitem', { name: /edit event/i })
      fireEvent.click(editMenuItem)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('displays notes textarea with current description value in edit mode', () => {
      render(<EventDetail event={mockEvent} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      fireEvent.click(menuButton)

      const editMenuItem = screen.getByRole('menuitem', { name: /edit event/i })
      fireEvent.click(editMenuItem)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Test Description')
    })

    it('saves changes when save button is clicked', () => {
      render(<EventDetail event={mockEvent} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      fireEvent.click(menuButton)

      const editMenuItem = screen.getByRole('menuitem', { name: /edit event/i })
      fireEvent.click(editMenuItem)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Updated Description' } })

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByText('Updated Description')).toBeInTheDocument()
    })

    it('cancels changes when cancel button is clicked', () => {
      render(<EventDetail event={mockEvent} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      fireEvent.click(menuButton)

      const editMenuItem = screen.getByRole('menuitem', { name: /edit event/i })
      fireEvent.click(editMenuItem)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Updated Description' } })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('displays save and cancel buttons in header when in edit mode', () => {
      render(<EventDetail event={mockEvent} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      fireEvent.click(menuButton)

      const editMenuItem = screen.getByRole('menuitem', { name: /edit event/i })
      fireEvent.click(editMenuItem)

      const header =
        screen.getByText('Test Event').closest('header') ||
        screen.getByText('Test Event').closest('[class*="CardHeader"]')
      expect(header).toBeInTheDocument()

      const saveButton = screen.getByRole('button', { name: /save/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(header?.contains(saveButton)).toBe(true)
      expect(header?.contains(cancelButton)).toBe(true)
    })
  })
})
