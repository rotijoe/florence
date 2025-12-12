import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentUploadDialogue } from '../index'

function renderComponent(
  open: boolean,
  selectedTrackTitle: string,
  selectedTrackSlug: string,
  onOpenChange?: (open: boolean) => void,
  onSuccess?: () => void
) {
  return render(
    <DocumentUploadDialogue
      open={open}
      onOpenChange={onOpenChange || jest.fn()}
      selectedTrackTitle={selectedTrackTitle}
      selectedTrackSlug={selectedTrackSlug}
      onSuccess={onSuccess}
    />
  )
}

describe('DocumentUploadDialogue', () => {
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

  it('calls onSuccess and closes dialog when upload button is clicked with valid data', async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()
    const onOpenChange = jest.fn()
    renderComponent(true, 'Test Track', 'test-track', onOpenChange, onSuccess)

    const fileInput = screen.getByLabelText(/file/i)
    const titleInput = screen.getByLabelText(/title/i)

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)
    await user.type(titleInput, 'My Document Title')

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadButton)

    expect(onSuccess).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('resets form fields when dialog opens', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DocumentUploadDialogue
        open={false}
        onOpenChange={jest.fn()}
        selectedTrackTitle='Test Track'
        selectedTrackSlug='test-track'
      />
    )

    rerender(
      <DocumentUploadDialogue
        open={true}
        onOpenChange={jest.fn()}
        selectedTrackTitle='Test Track'
        selectedTrackSlug='test-track'
      />
    )

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
    const notesTextarea = screen.getByLabelText(/notes/i) as HTMLTextAreaElement

    expect(titleInput.value).toBe('')
    expect(notesTextarea.value).toBe('')
  })
})
