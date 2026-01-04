import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubQuickActionTrack } from '../index'

describe('HubQuickActionTrack', () => {
  it('renders the button with correct text', () => {
    render(<HubQuickActionTrack userId='user-1' />)

    const button = screen.getByRole('button', { name: /track/i })
    expect(button).toBeInTheDocument()
  })

  it('opens dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(<HubQuickActionTrack userId='user-1' />)

    const button = screen.getByRole('button', { name: /track/i })
    await user.click(button)

    // Dialog should be rendered (check for dialog content)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    render(<HubQuickActionTrack userId='user-1' />)

    const button = screen.getByRole('button', { name: /track/i })
    expect(button).toHaveClass('justify-between', 'rounded-full', 'px-5', 'sm:w-auto')
  })
})

