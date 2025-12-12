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

global.fetch = jest.fn()

function renderComponent(tracks: TrackOption[], onTrackCreated?: () => void) {
  return render(
    <HubQuickActions tracks={tracks} userId='user-123' onTrackCreated={onTrackCreated} />
  )
}

describe('HubQuickActions - event combobox', () => {
  beforeEach(() => {
    pushMock.mockReset()
    ;(global.fetch as jest.Mock).mockReset()
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

    expect(pushMock).toHaveBeenCalledWith(
      `/user-123/tracks/track-one/new?returnTo=${encodeURIComponent('/user-123')}`
    )
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

describe('HubQuickActions - track button', () => {
  beforeEach(() => {
    pushMock.mockReset()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('opens track create dialog when track button is clicked', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const trackButton = screen.getByRole('button', { name: /track/i })

    await user.click(trackButton)

    expect(screen.getByRole('heading', { name: /create new health track/i })).toBeInTheDocument()
  })

  it('closes track create dialog when cancel is clicked', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const trackButton = screen.getByRole('button', { name: /track/i })

    await user.click(trackButton)
    expect(screen.getByRole('heading', { name: /create new health track/i })).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(
      screen.queryByRole('heading', { name: /create new health track/i })
    ).not.toBeInTheDocument()
  })

  it('calls onTrackCreated callback when track is successfully created', async () => {
    const mockOnTrackCreated = jest.fn()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 'track-1',
          title: 'New Track',
          slug: 'new-track',
          description: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    })

    renderComponent([], mockOnTrackCreated)

    const user = userEvent.setup()
    const trackButton = screen.getByRole('button', { name: /track/i })

    await user.click(trackButton)

    const titleInput = screen.getByLabelText(/track name/i)
    await user.type(titleInput, 'New Track')

    const submitButton = screen.getByRole('button', { name: /^create$/i })
    await user.click(submitButton)

    await screen.findByRole('button', { name: /track/i })

    expect(mockOnTrackCreated).toHaveBeenCalled()
  })
})

describe('HubQuickActions - document button', () => {
  beforeEach(() => {
    pushMock.mockReset()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('disables the document button and shows tooltip guidance when there are no tracks', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const documentButton = screen.getByRole('button', { name: /document/i })

    expect(documentButton).toBeDisabled()

    await user.hover(documentButton)

    const tooltips = await screen.findAllByRole('tooltip')

    expect(tooltips[0]).toHaveTextContent('Add a track before uploading documents')
  })

  it('opens document upload dialog when a track is selected from dropdown', async () => {
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
    const documentButton = screen.getByRole('button', { name: /document/i })

    await user.click(documentButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(screen.getByRole('heading', { name: /upload document/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Track One')).toBeInTheDocument()
  })

  it('shows all required fields in document upload dialog', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const documentButton = screen.getByRole('button', { name: /document/i })

    await user.click(documentButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(screen.getByLabelText(/track/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/file/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
  })

  it('disables upload button until file and title are provided', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const documentButton = screen.getByRole('button', { name: /document/i })

    await user.click(documentButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    expect(uploadButton).toBeDisabled()
  })

  it('closes document upload dialog when cancel is clicked', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const documentButton = screen.getByRole('button', { name: /document/i })

    await user.click(documentButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(screen.getByRole('heading', { name: /upload document/i })).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(screen.queryByRole('heading', { name: /upload document/i })).not.toBeInTheDocument()
  })
})
