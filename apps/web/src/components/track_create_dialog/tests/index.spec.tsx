import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrackCreateDialog } from '../index'

const mockOnOpenChange = jest.fn()
const mockOnSuccess = jest.fn()

global.fetch = jest.fn()

// Helper to set input value for controlled components
function setInputValue(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

describe('TrackCreateDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 'track-1',
          title: 'New Track',
          slug: 'new-track',
          description: 'Test description',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    })
  })

  it('keeps focus on the track name input while typing', async () => {
    const user = userEvent.setup()
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    await user.click(titleInput)
    expect(titleInput).toHaveFocus()

    await user.type(titleInput, 'Sleep')
    expect(titleInput).toHaveFocus()
    expect(titleInput).toHaveValue('Sleep')
  })

  it('renders dialog when open', () => {
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    expect(screen.getByRole('heading', { name: 'Create new health track' })).toBeInTheDocument()
  })

  it('does not render dialog when closed', () => {
    render(
      <TrackCreateDialog userId='user-1' open={false} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    expect(screen.queryByText('Create new health track')).not.toBeInTheDocument()
  })

  it('renders track name input field', () => {
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    expect(screen.getByLabelText(/track name/i)).toBeInTheDocument()
  })

  it('renders description textarea', () => {
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('allows entering track name', () => {
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    setInputValue(titleInput, 'Sleep Tracker')

    expect(titleInput).toHaveValue('Sleep Tracker')
  })

  it('allows entering description', () => {
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const descriptionInput = screen.getByLabelText(/description/i)
    setInputValue(descriptionInput, 'Track my sleep patterns')

    expect(descriptionInput).toHaveValue('Track my sleep patterns')
  })

  it('submits form with correct payload', async () => {
    const user = userEvent.setup()
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    setInputValue(titleInput, 'Sleep Tracker')

    const descriptionInput = screen.getByLabelText(/description/i)
    setInputValue(descriptionInput, 'Track my sleep patterns')

    const submitButton = screen.getByRole('button', { name: /^create$/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/user-1/tracks'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            title: 'Sleep Tracker',
            description: 'Track my sleep patterns'
          })
        })
      )
    })
  })

  it('submits form with null description when empty', async () => {
    const user = userEvent.setup()
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    setInputValue(titleInput, 'Sleep Tracker')

    const submitButton = screen.getByRole('button', { name: /^create$/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/user-1/tracks'),
        expect.objectContaining({
          body: JSON.stringify({
            title: 'Sleep Tracker',
            description: null
          })
        })
      )
    })
  })

  it('calls onSuccess callback on successful submission', async () => {
    const user = userEvent.setup()
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    setInputValue(titleInput, 'Sleep Tracker')

    const submitButton = screen.getByRole('button', { name: /^create$/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('closes dialog on successful submission', async () => {
    const user = userEvent.setup()
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    setInputValue(titleInput, 'Sleep Tracker')

    const submitButton = screen.getByRole('button', { name: /^create$/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('displays error message on API failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Failed to create track'
      })
    })

    const user = userEvent.setup()
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    setInputValue(titleInput, 'Sleep Tracker')

    const submitButton = screen.getByRole('button', { name: /^create$/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/failed to create track/i)).toBeInTheDocument()
    })
  })

  it('displays fallback error message when error is not an Error instance', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue('Network error string')

    const user = userEvent.setup()
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    setInputValue(titleInput, 'Sleep Tracker')

    const submitButton = screen.getByRole('button', { name: /^create$/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Failed to create track')).toBeInTheDocument()
    })
  })

  it('shows creating text when submitting', async () => {
    let resolveSubmit: (value: unknown) => void
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve
        })
    )

    const user = userEvent.setup()
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    setInputValue(titleInput, 'Sleep Tracker')

    const submitButton = screen.getByRole('button', { name: /^create$/i })
    await act(async () => {
      await user.click(submitButton)
    })

    // Should show creating state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument()
    })

    // Resolve the promise to clean up
    await act(async () => {
      resolveSubmit!({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'track-1',
            title: 'Sleep Tracker',
            slug: 'sleep-tracker',
            description: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      })
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  })

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('clears form when dialog is reopened', () => {
    const { rerender } = render(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const titleInput = screen.getByLabelText(/track name/i)
    setInputValue(titleInput, 'Sleep Tracker')

    expect(titleInput).toHaveValue('Sleep Tracker')

    // Close and reopen dialog
    rerender(
      <TrackCreateDialog userId='user-1' open={false} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )
    rerender(
      <TrackCreateDialog userId='user-1' open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
    )

    const newTitleInput = screen.getByLabelText(/track name/i)
    expect(newTitleInput).toHaveValue('')
  })
})

