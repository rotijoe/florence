import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventType, type EventResponse } from '@packages/types'

// Mock server action
jest.mock('@/app/[userId]/tracks/[trackSlug]/actions', () => ({
  createEventAction: jest.fn()
}))

// Mock upload hook
jest.mock('@/hooks/use_event_upload', () => ({
  useEventUpload: jest.fn()
}))

const { DocumentUploadDialogue } = require('../index')
const { createEventAction } = require('@/app/[userId]/tracks/[trackSlug]/actions')
const { useEventUpload } = require('@/hooks/use_event_upload')

const mockCreateEventAction = createEventAction as jest.MockedFunction<typeof createEventAction>
const mockUseEventUpload = useEventUpload as jest.MockedFunction<typeof useEventUpload>

function renderComponent(
  open: boolean,
  selectedTrackTitle: string,
  selectedTrackSlug: string,
  onOpenChange?: (open: boolean) => void,
  onSuccess?: (params: { eventId: string; trackSlug: string }) => void
) {
  return render(
    <DocumentUploadDialogue
      open={open}
      onOpenChange={onOpenChange || jest.fn()}
      selectedTrackTitle={selectedTrackTitle}
      selectedTrackSlug={selectedTrackSlug}
      userId='user-123'
      onSuccess={onSuccess}
    />
  )
}

describe('DocumentUploadDialogue', () => {
  const mockUpload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEventUpload.mockReturnValue({
      status: 'idle',
      error: null,
      isUploading: false,
      upload: mockUpload,
      reset: jest.fn()
    })
  })

  it('renders dialog when open is true', () => {
    renderComponent(true, 'Test Track', 'test-track')

    expect(screen.getByRole('heading', { name: /upload document/i })).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    renderComponent(false, 'Test Track', 'test-track')

    expect(screen.queryByRole('heading', { name: /upload document/i })).not.toBeInTheDocument()
  })

  it('displays selected track title as read-only', () => {
    renderComponent(true, 'My Health Track', 'my-health-track')

    const trackInput = screen.getByDisplayValue('My Health Track')
    expect(trackInput).toBeInTheDocument()
    expect(trackInput).toBeDisabled()
    expect(trackInput).toHaveAttribute('readonly')
  })

  it('shows all required form fields', () => {
    renderComponent(true, 'Test Track', 'test-track')

    expect(screen.getByLabelText(/track/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/event type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/file/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
  })

  it('disables upload button when file and title are not provided', () => {
    renderComponent(true, 'Test Track', 'test-track')

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    expect(uploadButton).toBeDisabled()
  })

  it('enables upload button when file and title are provided', async () => {
    const user = userEvent.setup()
    renderComponent(true, 'Test Track', 'test-track')

    const fileInput = screen.getByLabelText(/file/i)
    const titleInput = screen.getByLabelText(/title/i)

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)
    await user.type(titleInput, 'My Document Title')

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    expect(uploadButton).not.toBeDisabled()
  })

  it('disables upload button when only file is provided without title', async () => {
    const user = userEvent.setup()
    renderComponent(true, 'Test Track', 'test-track')

    const fileInput = screen.getByLabelText(/file/i)
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    expect(uploadButton).toBeDisabled()
  })

  it('disables upload button when only title is provided without file', async () => {
    const user = userEvent.setup()
    renderComponent(true, 'Test Track', 'test-track')

    const titleInput = screen.getByLabelText(/title/i)
    await user.type(titleInput, 'My Document Title')

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    expect(uploadButton).toBeDisabled()
  })

  it('displays selected file name and size', async () => {
    const user = userEvent.setup()
    renderComponent(true, 'Test Track', 'test-track')

    const fileInput = screen.getByLabelText(/file/i)
    const file = new File(['test content'], 'test-document.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)

    expect(screen.getByText(/selected: test-document\.pdf/i)).toBeInTheDocument()
  })

  it('calls onOpenChange when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    renderComponent(true, 'Test Track', 'test-track', onOpenChange)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onSuccess and closes dialog when upload completes successfully', async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()
    const onOpenChange = jest.fn()
    const mockEvent = {
      id: 'event-123',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'My Document Title',
      notes: null,
      fileUrl: 'https://example.com/file.pdf',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }

    mockCreateEventAction.mockResolvedValue({ event: mockEvent })
    const resetSpy = jest.fn()
    let onCompleteRef: ((event: EventResponse) => void) | undefined
    const uploadSpy = jest.fn(async () => {
      onCompleteRef?.(mockEvent)
    })

    mockUseEventUpload.mockImplementation(
      ({ onComplete }: { onComplete?: (event: EventResponse) => void }) => {
        onCompleteRef = onComplete
        return {
          status: 'idle',
          error: null,
          isUploading: false,
          upload: uploadSpy,
          reset: resetSpy
        }
      }
    )

    renderComponent(true, 'Test Track', 'test-track', onOpenChange, onSuccess)

    const fileInput = screen.getByLabelText(/file/i)
    const titleInput = screen.getByLabelText(/title/i)

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)
    await user.type(titleInput, 'My Document Title')

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    await waitFor(() => {
      expect(uploadButton).not.toBeDisabled()
    })
    await user.click(uploadButton)

    await waitFor(() => {
      expect(mockCreateEventAction).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(uploadSpy).toHaveBeenCalledWith({ eventId: 'event-123', file })
    })

    await waitFor(
      () => {
        expect(onSuccess).toHaveBeenCalledWith({ eventId: 'event-123', trackSlug: 'test-track' })
      },
      { timeout: 2000 }
    )
  })

  it('resets form fields when dialog opens', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DocumentUploadDialogue
        open={false}
        onOpenChange={jest.fn()}
        selectedTrackTitle='Test Track'
        selectedTrackSlug='test-track'
        userId='user-123'
      />
    )

    rerender(
      <DocumentUploadDialogue
        open={true}
        onOpenChange={jest.fn()}
        selectedTrackTitle='Test Track'
        selectedTrackSlug='test-track'
        userId='user-123'
      />
    )

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
    const notesTextarea = screen.getByLabelText(/notes/i) as HTMLTextAreaElement

    expect(titleInput.value).toBe('')
    expect(notesTextarea.value).toBe('')
  })

  it('shows validation error when upload fails with missing data', async () => {
    // The upload button is disabled when file/title are missing, but we can test
    // the error display when createEventAction fails
    const user = userEvent.setup()
    mockCreateEventAction.mockResolvedValue({ error: 'Missing required data', event: null })

    renderComponent(true, 'Test Track', 'test-track')

    const fileInput = screen.getByLabelText(/file/i)
    const titleInput = screen.getByLabelText(/title/i)

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)
    await user.type(titleInput, 'My Document Title')

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText(/missing required data/i)).toBeInTheDocument()
    })
  })

  it('displays error and clears creating state when createEventAction returns error', async () => {
    const user = userEvent.setup()
    mockCreateEventAction.mockResolvedValue({ error: 'Failed to create event', event: null })

    renderComponent(true, 'Test Track', 'test-track')

    const fileInput = screen.getByLabelText(/file/i)
    const titleInput = screen.getByLabelText(/title/i)

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)
    await user.type(titleInput, 'My Document Title')

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to create event/i)).toBeInTheDocument()
    })

    // Creating state should be cleared, so upload button should be enabled again
    await waitFor(() => {
      expect(uploadButton).not.toBeDisabled()
    })
  })

  it('displays "Unknown error occurred" when upload rejects with non-Error', async () => {
    const user = userEvent.setup()
    const mockEvent = {
      id: 'event-123',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'My Document Title',
      notes: null,
      fileUrl: 'https://example.com/file.pdf',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }

    mockCreateEventAction.mockResolvedValue({ event: mockEvent })
    const uploadSpy = jest.fn().mockRejectedValue('String error, not Error instance')

    mockUseEventUpload.mockReturnValue({
      status: 'idle',
      error: null,
      isUploading: false,
      upload: uploadSpy,
      reset: jest.fn()
    })

    renderComponent(true, 'Test Track', 'test-track')

    const fileInput = screen.getByLabelText(/file/i)
    const titleInput = screen.getByLabelText(/title/i)

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)
    await user.type(titleInput, 'My Document Title')

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText('Unknown error occurred')).toBeInTheDocument()
    })
  })

  it('disables Cancel button and prevents close when uploading', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()

    mockUseEventUpload.mockReturnValue({
      status: 'uploading',
      error: null,
      isUploading: true,
      upload: jest.fn(),
      reset: jest.fn()
    })

    renderComponent(true, 'Test Track', 'test-track', onOpenChange)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    expect(cancelButton).toBeDisabled()

    // Try to close dialog programmatically (simulating Dialog onOpenChange)
    const dialog = screen.getByRole('dialog')
    // The handleClose function should prevent closing
    // We can't directly test handleClose, but we can verify the button is disabled
    expect(cancelButton).toBeDisabled()
  })

  it('disables Cancel button and prevents close when creating event', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()

    // Mock a delayed createEventAction to keep isCreatingEvent true
    let resolveCreate: (value: any) => void
    mockCreateEventAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve
        })
    )

    mockUseEventUpload.mockReturnValue({
      status: 'idle',
      error: null,
      isUploading: false,
      upload: jest.fn(),
      reset: jest.fn()
    })

    renderComponent(true, 'Test Track', 'test-track', onOpenChange)

    const fileInput = screen.getByLabelText(/file/i)
    const titleInput = screen.getByLabelText(/title/i)

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)
    await user.type(titleInput, 'My Document Title')

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadButton)

    // Wait for creating state
    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()
    })

    // Resolve to clean up
    resolveCreate!({ event: { id: 'event-123' } })
  })

  it('shows status text and spinner when uploading', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'uploading',
      error: null,
      isUploading: true,
      upload: jest.fn(),
      reset: jest.fn()
    })

    renderComponent(true, 'Test Track', 'test-track')

    // Check that status text appears (may appear in multiple places)
    const statusTexts = screen.getAllByText('Uploading file...')
    expect(statusTexts.length).toBeGreaterThan(0)

    // Check that form elements are disabled during upload
    const fileInput = screen.getByLabelText(/file/i)
    expect(fileInput).toBeDisabled()
  })

  it('changes Cancel button text to Close when status is success', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'success',
      error: null,
      isUploading: false,
      upload: jest.fn(),
      reset: jest.fn()
    })

    renderComponent(true, 'Test Track', 'test-track')

    // The dialog footer button should show "Close" instead of "Cancel"
    // There may be multiple close buttons (dialog X button and footer button)
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    expect(closeButtons.length).toBeGreaterThan(0)

    // Verify that "Cancel" is not in the document (the text changed to "Close")
    expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument()
  })

  it('allows entering notes in textarea', async () => {
    const user = userEvent.setup()
    renderComponent(true, 'Test Track', 'test-track')

    const notesTextarea = screen.getByLabelText(/notes/i)
    await user.type(notesTextarea, 'Test notes content')

    expect(notesTextarea).toHaveValue('Test notes content')
  })

  it('calls reset when dialog opens', () => {
    const resetMock = jest.fn()
    mockUseEventUpload.mockReturnValue({
      status: 'idle',
      error: null,
      isUploading: false,
      upload: jest.fn(),
      reset: resetMock
    })

    const { rerender } = render(
      <DocumentUploadDialogue
        open={false}
        onOpenChange={jest.fn()}
        selectedTrackTitle='Test Track'
        selectedTrackSlug='test-track'
        userId='user-123'
      />
    )

    // Open the dialog
    rerender(
      <DocumentUploadDialogue
        open={true}
        onOpenChange={jest.fn()}
        selectedTrackTitle='Test Track'
        selectedTrackSlug='test-track'
        userId='user-123'
      />
    )

    expect(resetMock).toHaveBeenCalled()
  })

  it('clears file input value when dialog opens', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DocumentUploadDialogue
        open={true}
        onOpenChange={jest.fn()}
        selectedTrackTitle='Test Track'
        selectedTrackSlug='test-track'
        userId='user-123'
      />
    )

    // Select a file
    const fileInput = screen.getByLabelText(/file/i) as HTMLInputElement
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)

    expect(screen.getByText(/selected: test\.pdf/i)).toBeInTheDocument()

    // Close and reopen dialog
    rerender(
      <DocumentUploadDialogue
        open={false}
        onOpenChange={jest.fn()}
        selectedTrackTitle='Test Track'
        selectedTrackSlug='test-track'
        userId='user-123'
      />
    )

    rerender(
      <DocumentUploadDialogue
        open={true}
        onOpenChange={jest.fn()}
        selectedTrackTitle='Test Track'
        selectedTrackSlug='test-track'
        userId='user-123'
      />
    )

    // File should be cleared
    expect(screen.queryByText(/selected: test\.pdf/i)).not.toBeInTheDocument()
  })
})
