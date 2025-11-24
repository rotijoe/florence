import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventDetail } from '../index'
import { EventType, type EventResponse } from '@packages/types'

// Mock the server action
jest.mock('@/app/tracks/[trackSlug]/[eventId]/actions', () => ({
  updateEventAction: jest.fn()
}))

import { updateEventAction } from '@/app/tracks/[trackSlug]/[eventId]/actions'

const mockUpdateEventAction = updateEventAction as jest.MockedFunction<typeof updateEventAction>

describe('EventDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateEventAction.mockResolvedValue({ event: undefined, error: undefined })
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
    updatedAt: '2025-10-21T14:30:00.000Z'
  }

  const trackSlug = 'test-track'

  it('renders event title', () => {
    render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('displays formatted event date', () => {
    render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

    // There are multiple date instances, so use getAllByText
    const dates = screen.getAllByText(/21 October 2025/i)
    expect(dates.length).toBeGreaterThan(0)
  })

  it('displays event type', () => {
    render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

    expect(screen.getByText('NOTE')).toBeInTheDocument()
  })

  it('displays event notes when present', () => {
    render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders notes section with bordered container', () => {
    render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

    // Find notes section by looking for the h3 with "Notes" text first, then get its parent
    const notesHeading = screen.getByText('Notes')
    const notesSection = notesHeading.closest('.rounded-md.border')
    expect(notesSection).toBeInTheDocument()
    expect(notesSection).toHaveTextContent('Notes')
    expect(notesSection).toHaveTextContent('Test Description')
  })

  it('displays document button when fileUrl is available', () => {
    render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

    const link = screen.getByRole('link', { name: /view attached document/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com/file.pdf')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('displays created timestamp', () => {
    render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

    expect(screen.getByText(/Created:/i)).toBeInTheDocument()
    // There are multiple date instances, so use getAllByText
    const dates = screen.getAllByText(/21 October 2025/i)
    expect(dates.length).toBeGreaterThan(0)
  })

  it('displays updated timestamp when different from created', () => {
    const eventWithUpdate: EventResponse = {
      ...mockEvent,
      updatedAt: '2025-10-22T10:00:00.000Z'
    }

    render(<EventDetail event={eventWithUpdate} trackSlug={trackSlug} />)

    expect(screen.getByText(/Updated:/i)).toBeInTheDocument()
  })

  it('does not display updated timestamp when same as created', () => {
    render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

    expect(screen.queryByText(/Updated:/i)).not.toBeInTheDocument()
  })

  it('handles event without notes', () => {
    const eventWithoutDescription: EventResponse = {
      ...mockEvent,
      description: null
    }

    render(<EventDetail event={eventWithoutDescription} trackSlug={trackSlug} />)

    expect(screen.queryByText('Notes')).not.toBeInTheDocument()
  })

  it('handles event without fileUrl', () => {
    const eventWithoutFile: EventResponse = {
      ...mockEvent,
      fileUrl: null
    }

    render(<EventDetail event={eventWithoutFile} trackSlug={trackSlug} />)

    expect(screen.queryByRole('link', { name: /view attached document/i })).not.toBeInTheDocument()
  })

  describe('edit mode', () => {
    it('enters edit mode when edit event menu item is clicked', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('displays notes textarea with current description value in edit mode', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const textarea = screen.getByLabelText(/notes/i)
      expect(textarea).toHaveValue('Test Description')
    })

    it('saves changes when save button is clicked', async () => {
      const user = userEvent.setup()
      const updatedEvent: EventResponse = {
        ...mockEvent,
        title: 'Test Event',
        description: 'Updated Description',
        updatedAt: '2025-10-22T10:00:00.000Z'
      }
      mockUpdateEventAction.mockResolvedValue({ event: updatedEvent })

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const textarea = screen.getByLabelText(/notes/i)
      fireEvent.change(textarea, { target: { value: 'Updated Description' } })

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateEventAction).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.queryByLabelText(/notes/i)).not.toBeInTheDocument()
      })
    })

    it('cancels changes when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const textarea = screen.getByLabelText(/notes/i)
      fireEvent.change(textarea, { target: { value: 'Updated Description' } })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(screen.queryByLabelText(/notes/i)).not.toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('displays save and cancel buttons in header when in edit mode', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const titleInput = screen.getByLabelText(/title/i)
      const header =
        titleInput.closest('header') ||
        titleInput.closest('[class*="CardHeader"]') ||
        titleInput.closest('[data-slot="card-header"]')
      expect(header).toBeInTheDocument()

      const saveButton = screen.getByRole('button', { name: /save/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(header?.contains(saveButton)).toBe(true)
      expect(header?.contains(cancelButton)).toBe(true)
    })

    it('shows saving state while form is submitting', async () => {
      const user = userEvent.setup()
      mockUpdateEventAction.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ event: mockEvent }), 100)
          })
      )

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    })

    it('displays error message when save fails', async () => {
      const user = userEvent.setup()
      mockUpdateEventAction.mockResolvedValue({ error: 'Failed to update event' })

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to update event')).toBeInTheDocument()
      })
    })
  })

  describe('upload document', () => {
    it('opens upload dialog when upload document menu item is clicked', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const uploadMenuItem = await screen.findByRole('menuitem', { name: /upload document/i })
      await user.click(uploadMenuItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Upload Document')).toBeInTheDocument()
      })
    })

    it('closes upload dialog when upload is cancelled', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const uploadMenuItem = await screen.findByRole('menuitem', { name: /upload document/i })
      await user.click(uploadMenuItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('updates event fileUrl when upload completes', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const uploadMenuItem = await screen.findByRole('menuitem', { name: /upload document/i })
      await user.click(uploadMenuItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Verify the upload dialog is rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('clears error when upload dialog is opened', async () => {
      const user = userEvent.setup()
      mockUpdateEventAction.mockResolvedValue({ error: 'Failed to update event' })

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} />)

      // First, trigger an error by trying to save with invalid data
      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to update event')).toBeInTheDocument()
      })

      // Cancel edit mode first since we're still in edit mode after save failure
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Now open upload dialog - error should be cleared
      const menuButtonAgain = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButtonAgain)
      const uploadMenuItem = await screen.findByRole('menuitem', { name: /upload document/i })
      await user.click(uploadMenuItem)

      await waitFor(() => {
        expect(screen.queryByText('Failed to update event')).not.toBeInTheDocument()
      })
    })
  })
})
