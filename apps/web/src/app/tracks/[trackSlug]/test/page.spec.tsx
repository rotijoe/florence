import { render, screen } from '@testing-library/react'
import TrackPage from '../page'
import { EventType } from '@packages/types'

jest.mock('../helpers', () => ({
  fetchTrack: jest.fn(),
  fetchTrackEvents: jest.fn()
}))

const { fetchTrack, fetchTrackEvents } = require('../helpers')

describe('TrackPage', () => {
  const mockTrack = {
    id: 'track-1',
    name: 'Sleep',
    slug: 'sleep',
    createdAt: '2025-10-21T00:00:00.000Z'
  }

  const mockEvents = [
    {
      id: 'event-1',
      trackId: 'track-1',
      date: '2025-10-21T00:00:00.000Z',
      title: 'Event 1',
      description: 'Test description',
      type: EventType.NOTE,
      fileUrl: null,
      createdAt: '2025-10-21T00:00:00.000Z',
      updatedAt: '2025-10-21T00:00:00.000Z'
    }
  ]

  beforeEach(() => {
    fetchTrack.mockResolvedValue(mockTrack)
    fetchTrackEvents.mockResolvedValue(mockEvents)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders track name as heading', async () => {
    const page = await TrackPage({ params: { trackSlug: 'sleep' } })
    render(page)

    expect(screen.getByRole('heading', { name: 'Sleep' })).toBeInTheDocument()
  })

  it('calls fetchTrack with correct slug', async () => {
    await TrackPage({ params: { trackSlug: 'sleep' } })

    expect(fetchTrack).toHaveBeenCalledWith('sleep')
  })

  it('calls fetchTrackEvents with correct slug', async () => {
    await TrackPage({ params: { trackSlug: 'sleep' } })

    expect(fetchTrackEvents).toHaveBeenCalledWith('sleep')
  })

  it('renders TrackEventList component', async () => {
    const page = await TrackPage({ params: { trackSlug: 'sleep' } })
    render(page)

    expect(screen.getByText('Event 1')).toBeInTheDocument()
  })
})
