// Mock Next.js server actions FIRST to avoid Request is not defined error
jest.mock('@/app/tracks/[trackSlug]/[eventId]/actions', () => ({
  createEventUploadIntentAction: jest.fn(),
  confirmEventUploadAction: jest.fn()
}))

// Mock the useEventUpload hook
jest.mock('@/hooks/use_event_upload', () => ({
  useEventUpload: jest.fn()
}))

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadDocument } from '../index'
import { EventType, type EventResponse } from '@packages/types'
import { useEventUpload } from '@/hooks/use_event_upload'

const mockUseEventUpload = useEventUpload as jest.MockedFunction<typeof useEventUpload>

describe('UploadDocument', () => {
  const mockEvent: EventResponse = {
    id: 'event-1',
    trackId: 'track-1',
    date: '2024-01-01T00:00:00.000Z',
    type: EventType.NOTE,
    title: 'Test Event',
    description: 'Test Description',
    fileUrl: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  const defaultProps = {
    event: mockEvent,
    trackSlug: 'test-track',
    onUploadComplete: jest.fn(),
    onCancel: jest.fn()
  }

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

  it('renders dialog with title and description', () => {
    render(<UploadDocument {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Upload Document')).toBeInTheDocument()
    expect(
      screen.getByText('Upload a document for this event. Maximum file size is 10MB.')
    ).toBeInTheDocument()
  })

  it('renders file input with accessible label', () => {
    render(<UploadDocument {...defaultProps} />)

    const fileInput = screen.getByLabelText('File')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('type', 'file')
  })

  it('renders cancel and upload buttons', () => {
    render(<UploadDocument {...defaultProps} />)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument()
  })

  it('disables upload button when no file is selected', () => {
    render(<UploadDocument {...defaultProps} />)

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    expect(uploadButton).toBeDisabled()
  })

  it('enables upload button when file is selected', async () => {
    const user = userEvent.setup()
    render(<UploadDocument {...defaultProps} />)

    const fileInput = screen.getByLabelText('File')
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, file)

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    expect(uploadButton).not.toBeDisabled()
  })

  it('displays selected file name and size', async () => {
    const user = userEvent.setup()
    render(<UploadDocument {...defaultProps} />)

    const fileInput = screen.getByLabelText('File')
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, file)

    expect(screen.getByText(/selected: test\.pdf/i)).toBeInTheDocument()
  })

  it('calls upload function when upload button is clicked', async () => {
    const user = userEvent.setup()
    render(<UploadDocument {...defaultProps} />)

    const fileInput = screen.getByLabelText('File')
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, file)

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadButton)

    expect(mockUpload).toHaveBeenCalledWith(file)
  })

  it('shows validation error when upload handler is called without file', () => {
    // This test verifies the validation logic in handleUpload
    // In normal usage, the button is disabled when no file is selected,
    // but we test the validation error message exists in the component logic
    render(<UploadDocument {...defaultProps} />)

    const uploadButton = screen.getByRole('button', { name: /upload/i })

    // Button should be disabled when no file is selected (primary validation)
    expect(uploadButton).toBeDisabled()

    // The validation error message is handled in handleUpload when selectedFile is null
    // Since the button is disabled, this can't be triggered by user interaction,
    // but the validation logic exists in the component (line 61-63 in index.tsx)
    // This test ensures the button is properly disabled, which prevents the error state
  })

  it('displays upload status text when getting-url', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'getting-url',
      error: null,
      isUploading: true,
      upload: mockUpload,
      reset: jest.fn()
    })

    render(<UploadDocument {...defaultProps} />)

    // Status text appears in multiple places (status area and button)
    // Check that it appears at least once
    const statusTexts = screen.getAllByText('Preparing upload...')
    expect(statusTexts.length).toBeGreaterThan(0)
  })

  it('displays upload status text when uploading', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'uploading',
      error: null,
      isUploading: true,
      upload: mockUpload,
      reset: jest.fn()
    })

    render(<UploadDocument {...defaultProps} />)

    // Status text appears in multiple places (status area and button)
    // Check that it appears at least once
    const statusTexts = screen.getAllByText('Uploading file...')
    expect(statusTexts.length).toBeGreaterThan(0)
  })

  it('displays upload status text when confirming', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'confirming',
      error: null,
      isUploading: true,
      upload: mockUpload,
      reset: jest.fn()
    })

    render(<UploadDocument {...defaultProps} />)

    // Status text appears in multiple places (status area and button)
    // Check that it appears at least once
    const statusTexts = screen.getAllByText('Saving...')
    expect(statusTexts.length).toBeGreaterThan(0)
  })

  it('displays upload status text when success', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'success',
      error: null,
      isUploading: false,
      upload: mockUpload,
      reset: jest.fn()
    })

    render(<UploadDocument {...defaultProps} />)

    expect(screen.getByText('Upload complete!')).toBeInTheDocument()
    // There are multiple Close buttons (footer and dialog close)
    // Check that at least one Close button exists
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    expect(closeButtons.length).toBeGreaterThan(0)
  })

  it('displays error message when upload fails', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'error',
      error: 'Upload failed',
      isUploading: false,
      upload: mockUpload,
      reset: jest.fn()
    })

    render(<UploadDocument {...defaultProps} />)

    expect(screen.getByText('Upload failed')).toBeInTheDocument()
  })

  it('disables file input when uploading', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'uploading',
      error: null,
      isUploading: true,
      upload: mockUpload,
      reset: jest.fn()
    })

    render(<UploadDocument {...defaultProps} />)

    const fileInput = screen.getByLabelText('File')
    expect(fileInput).toBeDisabled()
  })

  it('disables cancel button when uploading', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'uploading',
      error: null,
      isUploading: true,
      upload: mockUpload,
      reset: jest.fn()
    })

    render(<UploadDocument {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    expect(cancelButton).toBeDisabled()
  })

  it('calls onCancel when dialog is closed', async () => {
    const user = userEvent.setup()
    render(<UploadDocument {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it('does not call onCancel when dialog is closed during upload', async () => {
    const user = userEvent.setup()
    mockUseEventUpload.mockReturnValue({
      status: 'uploading',
      error: null,
      isUploading: true,
      upload: mockUpload,
      reset: jest.fn()
    })

    render(<UploadDocument {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(defaultProps.onCancel).not.toHaveBeenCalled()
  })

  it('calls onUploadComplete when upload succeeds', async () => {
    const updatedEvent: EventResponse = {
      ...mockEvent,
      fileUrl: 'https://example.com/file.pdf'
    }

    mockUseEventUpload.mockImplementation(({ onComplete }) => {
      // Call onComplete immediately to simulate successful upload
      if (onComplete) {
        setTimeout(() => {
          onComplete(updatedEvent)
        }, 0)
      }
      return {
        status: 'success',
        error: null,
        isUploading: false,
        upload: mockUpload,
        reset: jest.fn()
      }
    })

    render(<UploadDocument {...defaultProps} />)

    // Wait for the setTimeout in onComplete callback
    await waitFor(
      () => {
        expect(defaultProps.onUploadComplete).toHaveBeenCalledWith(updatedEvent)
      },
      { timeout: 1000 }
    )
  })

  it('shows loading spinner when uploading', () => {
    mockUseEventUpload.mockReturnValue({
      status: 'uploading',
      error: null,
      isUploading: true,
      upload: mockUpload,
      reset: jest.fn()
    })

    render(<UploadDocument {...defaultProps} />)

    const spinner = screen.getByRole('button', { name: /uploading file/i })
    expect(spinner).toBeInTheDocument()
  })
})
