import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrackEventTileDeleteConfirmDialog } from '../index'

describe('TrackEventTileDeleteConfirmDialog', () => {
  const eventTitle = 'Test Event'
  const onConfirm = jest.fn()
  const onOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dialog when open', () => {
    render(
      <TrackEventTileDeleteConfirmDialog
        isOpen={true}
        onOpenChange={onOpenChange}
        eventTitle={eventTitle}
        onConfirm={onConfirm}
      />
    )

    expect(screen.getByText(/delete event/i)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`"${eventTitle}"`, 'i'))).toBeInTheDocument()
  })

  it('does not render dialog when closed', () => {
    render(
      <TrackEventTileDeleteConfirmDialog
        isOpen={false}
        onOpenChange={onOpenChange}
        eventTitle={eventTitle}
        onConfirm={onConfirm}
      />
    )

    expect(screen.queryByText(/delete event/i)).not.toBeInTheDocument()
  })

  it('calls onConfirm when Delete button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TrackEventTileDeleteConfirmDialog
        isOpen={true}
        onOpenChange={onOpenChange}
        eventTitle={eventTitle}
        onConfirm={onConfirm}
      />
    )

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenChange with false when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TrackEventTileDeleteConfirmDialog
        isOpen={true}
        onOpenChange={onOpenChange}
        eventTitle={eventTitle}
        onConfirm={onConfirm}
      />
    )

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('displays event title in description', () => {
    render(
      <TrackEventTileDeleteConfirmDialog
        isOpen={true}
        onOpenChange={onOpenChange}
        eventTitle={eventTitle}
        onConfirm={onConfirm}
      />
    )

    expect(screen.getByText(new RegExp(`"${eventTitle}"`, 'i'))).toBeInTheDocument()
  })
})

