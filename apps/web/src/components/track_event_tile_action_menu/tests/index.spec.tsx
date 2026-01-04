import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrackEventTileActionMenu } from '../index'

jest.mock('@/lib/stop_link_navigation', () => ({
  stopLinkNavigation: jest.fn((e) => {
    e.preventDefault()
    e.stopPropagation()
  })
}))

describe('TrackEventTileActionMenu', () => {
  const href = '/user-1/tracks/sleep/event-1'
  const eventTitle = 'Test Event'
  const onDeleteClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders action menu button', () => {
    render(
      <TrackEventTileActionMenu
        href={href}
        eventTitle={eventTitle}
        onDeleteClick={onDeleteClick}
      />
    )

    expect(screen.getByRole('button', { name: /actions for test event/i })).toBeInTheDocument()
  })

  it('opens menu when clicked', async () => {
    const user = userEvent.setup()
    render(
      <TrackEventTileActionMenu
        href={href}
        eventTitle={eventTitle}
        onDeleteClick={onDeleteClick}
      />
    )

    await user.click(screen.getByRole('button', { name: /actions for test event/i }))

    expect(screen.getByText(/edit/i)).toBeInTheDocument()
    expect(screen.getByText(/delete/i)).toBeInTheDocument()
  })

  it('renders Edit link with correct href', async () => {
    const user = userEvent.setup()
    render(
      <TrackEventTileActionMenu
        href={href}
        eventTitle={eventTitle}
        onDeleteClick={onDeleteClick}
      />
    )

    await user.click(screen.getByRole('button', { name: /actions for test event/i }))

    const editLink = screen.getByText(/edit/i).closest('a')
    expect(editLink).toHaveAttribute('href', href)
  })

  it('calls onDeleteClick when Delete is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TrackEventTileActionMenu
        href={href}
        eventTitle={eventTitle}
        onDeleteClick={onDeleteClick}
      />
    )

    await user.click(screen.getByRole('button', { name: /actions for test event/i }))
    await user.click(screen.getByText(/delete/i))

    expect(onDeleteClick).toHaveBeenCalledTimes(1)
  })

  it('applies default variant styling', () => {
    render(
      <TrackEventTileActionMenu
        href={href}
        eventTitle={eventTitle}
        onDeleteClick={onDeleteClick}
      />
    )

    const button = screen.getByRole('button', { name: /actions for test event/i })
    expect(button).toHaveClass('shrink-0')
  })

  it('applies symptom variant styling when specified', () => {
    render(
      <TrackEventTileActionMenu
        href={href}
        eventTitle={eventTitle}
        onDeleteClick={onDeleteClick}
        variant='symptom'
        symptomStyles={{ bgColor: 'bg-red-500', textColor: 'text-white' }}
      />
    )

    const button = screen.getByRole('button', { name: /actions for test event/i })
    expect(button).toHaveClass('bg-red-500', 'text-white')
  })
})

