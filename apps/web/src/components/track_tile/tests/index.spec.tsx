import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TrackTile } from '../index'

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe('TrackTile', () => {
  it('renders title link, description, dates, and add event link', () => {
    render(
      <TrackTile
        userId='user-1'
        track={{
          id: 'track-1',
          title: 'Sleep',
          slug: 'sleep',
          description: 'Track sleep quality',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }}
        isNotificationsEnabled={false}
        onNotificationsEnabledChange={() => {}}
      />
    )

    const titleLink = screen.getByRole('link', { name: 'Sleep' })
    expect(titleLink).toHaveAttribute('href', '/user-1/tracks/sleep')

    expect(screen.getByText('Track sleep quality')).toBeInTheDocument()
    expect(screen.getByText('Start date')).toBeInTheDocument()
    expect(screen.getByText('Last updated')).toBeInTheDocument()

    const addEventLinks = screen.getAllByRole('link', { name: /add event/i })
    expect(addEventLinks[0]).toHaveAttribute(
      'href',
      '/user-1/tracks/sleep/new?returnTo=%2Fuser-1%2Ftracks'
    )
  })

  it('toggles notifications state (UI only)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <TrackTile
        userId='user-1'
        track={{
          id: 'track-1',
          title: 'Sleep',
          slug: 'sleep',
          description: undefined,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }}
        isNotificationsEnabled={false}
        onNotificationsEnabledChange={onChange}
      />
    )

    const toggles = screen.getAllByRole('switch', { name: /toggle notifications/i })
    expect(toggles[0]).toHaveAttribute('aria-checked', 'false')

    await user.click(toggles[0])
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('shows delete option as disabled menu item (UI only)', async () => {
    const user = userEvent.setup()

    render(
      <TrackTile
        userId='user-1'
        track={{
          id: 'track-1',
          title: 'Sleep',
          slug: 'sleep',
          description: undefined,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }}
        isNotificationsEnabled={false}
        onNotificationsEnabledChange={() => {}}
      />
    )

    const menuButton = screen.getByRole('button', { name: /track actions/i })
    await user.click(menuButton)

    const deleteMenuItem = screen.getByRole('menuitem', { name: /delete track.*ui only/i })
    expect(deleteMenuItem).toHaveAttribute('aria-disabled', 'true')
  })
})
