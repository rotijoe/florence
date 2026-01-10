import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TrackTile, TrackTiles } from '../index'

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

  it('shows "On" when notifications are enabled', () => {
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
        isNotificationsEnabled={true}
        onNotificationsEnabledChange={() => {}}
      />
    )

    const onTexts = screen.getAllByText('On')
    expect(onTexts.length).toBeGreaterThan(0)
    expect(onTexts[0]).toBeInTheDocument()
  })

  it('shows "Off" when notifications are disabled', () => {
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

    const offTexts = screen.getAllByText('Off')
    expect(offTexts.length).toBeGreaterThan(0)
    expect(offTexts[0]).toBeInTheDocument()
  })
})

describe('TrackTiles', () => {
  it('renders multiple track tiles', () => {
    const tracks = [
      {
        id: 'track-1',
        title: 'Sleep',
        slug: 'sleep',
        description: 'Track sleep',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      },
      {
        id: 'track-2',
        title: 'Exercise',
        slug: 'exercise',
        description: 'Track exercise',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      }
    ]

    render(<TrackTiles userId='user-1' tracks={tracks} />)

    expect(screen.getByRole('link', { name: 'Sleep' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Exercise' })).toBeInTheDocument()
  })

  it('handles notifications toggle for multiple tracks', async () => {
    const user = userEvent.setup()
    const tracks = [
      {
        id: 'track-1',
        title: 'Sleep',
        slug: 'sleep',
        description: 'Track sleep',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      }
    ]

    render(<TrackTiles userId='user-1' tracks={tracks} />)

    const toggles = screen.getAllByRole('switch', { name: /toggle notifications/i })
    expect(toggles[0]).toHaveAttribute('aria-checked', 'false')

    await user.click(toggles[0])
    expect(toggles[0]).toHaveAttribute('aria-checked', 'true')
  })

  it('handles empty tracks array', () => {
    render(<TrackTiles userId='user-1' tracks={[]} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
