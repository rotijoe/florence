import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HubQuickActions } from '../index'
import type { TrackOption } from '../types'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock
  })
}))

function renderComponent(tracks: TrackOption[]) {
  return render(<HubQuickActions tracks={tracks} userId='user-123' />)
}

describe('HubQuickActions - event combobox', () => {
  beforeEach(() => {
    pushMock.mockReset()
  })

  it('navigates to track event create when a track is selected', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      },
      {
        id: 'track-2',
        slug: 'track-two',
        title: 'Track Two',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const eventButton = screen.getByRole('button', { name: /event/i })

    await user.click(eventButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(pushMock).toHaveBeenCalledWith('/user-123/tracks/track-1/new')
  })

  it('disables the event button and shows tooltip guidance when there are no tracks', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const eventButton = screen.getByRole('button', { name: /event/i })

    expect(eventButton).toBeDisabled()

    await user.hover(eventButton)

    const tooltips = await screen.findAllByRole('tooltip')

    expect(tooltips[0]).toHaveTextContent('Add a track before creating events')
  })
})
