import { render, screen } from '@testing-library/react'
import { EventType } from '@packages/types'
import { TrackQuickAddBar } from '../index'

describe('TrackQuickAddBar', () => {
  it('renders one quick-add link per event type', () => {
    render(<TrackQuickAddBar userId='user-1' trackSlug='sleep' />)

    const links = screen.getAllByRole('link', { name: /add/i })
    expect(links).toHaveLength(Object.values(EventType).length)
  })

  it('builds an appointment link with type query param', () => {
    render(<TrackQuickAddBar userId='user-1' trackSlug='sleep' />)

    const appointmentLink = screen.getByRole('link', { name: /add appointment/i })
    expect(appointmentLink).toHaveAttribute(
      'href',
      '/user-1/tracks/sleep/new?returnTo=%2Fuser-1%2Ftracks%2Fsleep&type=APPOINTMENT'
    )
  })

  it('renders a calendar icon for appointment type', () => {
    render(<TrackQuickAddBar userId='user-1' trackSlug='sleep' />)

    expect(screen.getByTestId('event-type-icon-APPOINTMENT')).toBeInTheDocument()
  })
})



