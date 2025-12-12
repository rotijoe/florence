import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventDetail } from '../index'
import { EventType, type EventResponse } from '@packages/types'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null)
  })
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}))

jest.mock('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions', () => ({
  updateEventAction: jest.fn(),
  deleteEventAction: jest.fn(),
  deleteEventAttachmentAction: jest.fn()
}))

jest.mock('@/app/[userId]/tracks/[trackSlug]/new/actions', () => ({
  createEventOnSaveAction: jest.fn()
}))

import {
  updateEventAction,
  deleteEventAction
} from '@/app/[userId]/tracks/[trackSlug]/[eventId]/actions'
import { createEventOnSaveAction } from '@/app/[userId]/tracks/[trackSlug]/new/actions'

const mockUpdateEventAction = updateEventAction as jest.MockedFunction<typeof updateEventAction>
const mockDeleteEventAction = deleteEventAction as jest.MockedFunction<typeof deleteEventAction>

describe('EventDetail', () => {
  const mockEvent: EventResponse = {
    id: '1',
    trackId: 'track-1',
    date: '2025-10-21T14:30:00.000Z',
    title: 'Test Event',
    notes: 'Test Description',
    type: EventType.NOTE,
    fileUrl: 'https://example.com/file.pdf',
    createdAt: '2025-10-21T14:30:00.000Z',
    updatedAt: '2025-10-21T14:30:00.000Z'
  }

  const trackSlug = 'test-track'
  const userId = 'user-1'

  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateEventAction.mockResolvedValue({ event: undefined, error: undefined })
    mockDeleteEventAction.mockResolvedValue({})
  })

  describe('basic rendering', () => {
    it('renders event title', () => {
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    it('displays formatted event date', () => {
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const dates = screen.getAllByText(/21 October 2025/i)
      expect(dates.length).toBeGreaterThan(0)
    })

    it('displays event type', () => {
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      expect(screen.getByText('NOTE')).toBeInTheDocument()
    })

    it('displays event notes when present', () => {
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const notesSection = screen.getByTestId('notes-section')
      expect(notesSection).toBeInTheDocument()
      expect(notesSection).toHaveTextContent('Notes')
      expect(notesSection).toHaveTextContent('Test Description')
    })

    it('handles event without notes', () => {
      const eventWithoutNotes: EventResponse = {
        ...mockEvent,
        notes: null
      }

      render(
        <EventDetail event={eventWithoutNotes} trackSlug={trackSlug} userId={userId} mode='edit' />
      )

      expect(screen.queryByTestId('notes-section')).not.toBeInTheDocument()
    })

    it('displays attachments section when fileUrl is available', () => {
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      expect(screen.getByText('Attachments')).toBeInTheDocument()
      expect(screen.getByText('file.pdf')).toBeInTheDocument()
    })

    it('handles event without fileUrl', () => {
      const eventWithoutFile: EventResponse = {
        ...mockEvent,
        fileUrl: null
      }

      render(
        <EventDetail event={eventWithoutFile} trackSlug={trackSlug} userId={userId} mode='edit' />
      )

      expect(screen.queryByText('Attachments')).not.toBeInTheDocument()
    })

    it('displays created timestamp', () => {
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      expect(screen.getByText(/Created:/i)).toBeInTheDocument()
    })

    it('displays updated timestamp when different from created', () => {
      const eventWithUpdate: EventResponse = {
        ...mockEvent,
        updatedAt: '2025-10-22T10:00:00.000Z'
      }

      render(
        <EventDetail event={eventWithUpdate} trackSlug={trackSlug} userId={userId} mode='edit' />
      )

      expect(screen.getByText(/Updated:/i)).toBeInTheDocument()
    })

    it('does not display updated timestamp when same as created', () => {
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      expect(screen.queryByText(/Updated:/i)).not.toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    it('enters edit mode when edit event menu item is clicked', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('displays notes textarea with current notes value in edit mode', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const textarea = screen.getByLabelText(/notes/i)
      expect(textarea).toHaveValue('Test Description')
    })

    it('displays save and cancel buttons in header when in edit mode', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const header = screen.getByTestId('event-header')
      const saveButton = screen.getByRole('button', { name: /save/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(header).toContainElement(saveButton)
      expect(header).toContainElement(cancelButton)
    })

    it('saves changes when save button is clicked', async () => {
      const user = userEvent.setup()
      const updatedEvent: EventResponse = {
        ...mockEvent,
        title: 'Test Event',
        notes: 'Updated Description',
        updatedAt: '2025-10-22T10:00:00.000Z'
      }
      mockUpdateEventAction.mockResolvedValue({ event: updatedEvent })

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const textarea = screen.getByLabelText(/notes/i)
      await user.clear(textarea)
      await user.type(textarea, 'Updated Description')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateEventAction).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.queryByLabelText(/notes/i)).not.toBeInTheDocument()
      })
    })

    it('cancels changes when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const textarea = screen.getByLabelText(/notes/i)
      await user.clear(textarea)
      await user.type(textarea, 'Updated Description')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(screen.queryByLabelText(/notes/i)).not.toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('shows saving state while form is submitting', async () => {
      const user = userEvent.setup()
      mockUpdateEventAction.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ event: mockEvent }), 100)
          })
      )

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
      })
    })

    it('displays error message when save fails', async () => {
      const user = userEvent.setup()
      mockUpdateEventAction.mockResolvedValue({ error: 'Failed to update event' })

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to update event')
      })
    })
  })

  describe('upload document', () => {
    it('opens upload dialog when upload document menu item is clicked', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

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
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

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
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const uploadMenuItem = await screen.findByRole('menuitem', { name: /upload document/i })
      await user.click(uploadMenuItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('clears error when upload dialog is opened', async () => {
      const user = userEvent.setup()
      mockUpdateEventAction.mockResolvedValue({ error: 'Failed to update event' })

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      // First, trigger an error by trying to save with invalid data
      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to update event')
      })

      // Cancel edit mode first to show the menu button again
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Now open upload dialog - error should be cleared
      const menuButtonAgain = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButtonAgain)
      const uploadMenuItem = await screen.findByRole('menuitem', { name: /upload document/i })
      await user.click(uploadMenuItem)

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
      })
    })
  })

  describe('delete event', () => {
    it('opens delete dialog when delete event menu item is clicked', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete event/i })
      await user.click(deleteMenuItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Delete Event')).toBeInTheDocument()
        expect(
          screen.getByText(/Are you sure you want to delete this event\?/i)
        ).toBeInTheDocument()
      })
    })

    it('closes delete dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete event/i })
      await user.click(deleteMenuItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('calls deleteEventAction when delete button is clicked', async () => {
      const user = userEvent.setup()
      mockDeleteEventAction.mockResolvedValue({})

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete event/i })
      await user.click(deleteMenuItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /^delete$/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockDeleteEventAction).toHaveBeenCalledWith(userId, trackSlug, mockEvent.id)
      })
    })

    it('displays error message when delete fails', async () => {
      const user = userEvent.setup()
      mockDeleteEventAction.mockResolvedValue({ error: 'Failed to delete event' })

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete event/i })
      await user.click(deleteMenuItem)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /^delete$/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to delete event')
      })
    })

    it('clears error when delete dialog is opened', async () => {
      const user = userEvent.setup()
      mockUpdateEventAction.mockResolvedValue({ error: 'Failed to update event' })

      render(<EventDetail event={mockEvent} trackSlug={trackSlug} userId={userId} mode='edit' />)

      // First, trigger an error by trying to save with invalid data
      const menuButton = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButton)

      const editMenuItem = await screen.findByRole('menuitem', { name: /edit event/i })
      await user.click(editMenuItem)

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to update event')
      })

      // Cancel edit mode first to show the menu button again
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Now open delete dialog - error should be cleared
      const menuButtonAgain = screen.getByRole('button', { name: /event actions/i })
      await user.click(menuButtonAgain)
      const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete event/i })
      await user.click(deleteMenuItem)

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
      })
    })
  })

  describe('create mode', () => {
    const mockCreateEventAction = createEventOnSaveAction as jest.MockedFunction<
      typeof createEventOnSaveAction
    >

    beforeEach(() => {
      mockCreateEventAction.mockResolvedValue({})
    })

    it('starts in edit mode when mode is create', () => {
      const placeholderEvent: EventResponse = {
        ...mockEvent,
        id: 'new',
        title: '',
        notes: null
      }

      render(
        <EventDetail event={placeholderEvent} trackSlug={trackSlug} userId={userId} mode='create' />
      )

      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('does not show actions menu in create mode', () => {
      const placeholderEvent: EventResponse = {
        ...mockEvent,
        id: 'new',
        title: '',
        notes: null
      }

      render(
        <EventDetail event={placeholderEvent} trackSlug={trackSlug} userId={userId} mode='create' />
      )

      expect(screen.queryByRole('button', { name: /event actions/i })).not.toBeInTheDocument()
    })

    it('does not show footer in create mode', () => {
      const placeholderEvent: EventResponse = {
        ...mockEvent,
        id: 'new',
        title: '',
        notes: null
      }

      render(
        <EventDetail event={placeholderEvent} trackSlug={trackSlug} userId={userId} mode='create' />
      )

      expect(screen.queryByText(/Created:/i)).not.toBeInTheDocument()
    })

    it('calls createEventOnSaveAction when save is clicked in create mode', async () => {
      const user = userEvent.setup()
      const placeholderEvent: EventResponse = {
        ...mockEvent,
        id: 'new',
        title: '',
        notes: null
      }

      render(
        <EventDetail event={placeholderEvent} trackSlug={trackSlug} userId={userId} mode='create' />
      )

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'New Event')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockCreateEventAction).toHaveBeenCalled()
      })
    })

    it('shows toast error when create fails', async () => {
      const user = userEvent.setup()
      const { toast } = require('sonner')
      mockCreateEventAction.mockResolvedValue({ error: 'Failed to create event' })

      const placeholderEvent: EventResponse = {
        ...mockEvent,
        id: 'new',
        title: '',
        notes: null
      }

      render(
        <EventDetail event={placeholderEvent} trackSlug={trackSlug} userId={userId} mode='create' />
      )

      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'New Event')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create event')
      })
    })
  })
})
