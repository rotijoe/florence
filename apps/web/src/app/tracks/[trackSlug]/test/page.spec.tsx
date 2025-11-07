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

  it('returns null as page content is handled by layout', async () => {
    const page = await TrackPage({ params: Promise.resolve({ trackSlug: 'sleep' }) as any })
    expect(page).toBeNull()
  })

  it('awaits params correctly', async () => {
    const paramsPromise = Promise.resolve({ trackSlug: 'sleep' }) as any
    await TrackPage({ params: paramsPromise })
    // Test passes if no errors are thrown
    expect(true).toBe(true)
  })
})
