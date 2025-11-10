import { render, screen } from '@testing-library/react'
import TrackPage from '../page'
import { EventType } from '@packages/types'

jest.mock('../helpers', () => ({
  fetchTrack: jest.fn(),
  fetchTrackEvents: jest.fn(),
}))

jest.mock('@/components/track_event_list', () => ({
  TrackEventList: ({ events, trackSlug }: { events: any[]; trackSlug: string }) => (
    <div data-testid="track-event-list">
      {events.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  ),
}))

jest.mock('@/components/date_scroller', () => ({
  DateScroller: ({ referenceDate }: { referenceDate?: string }) => (
    <div data-testid="date-scroller">Date Scroller</div>
  ),
}))

const { fetchTrack, fetchTrackEvents } = require('../helpers')

describe('TrackPage', () => {
  const mockTrack = {
    id: 'track-1',
    name: 'Sleep',
    slug: 'sleep',
    createdAt: '2025-10-21T00:00:00.000Z',
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
      updatedAt: '2025-10-21T00:00:00.000Z',
    },
  ]

  beforeEach(() => {
    fetchTrack.mockResolvedValue(mockTrack)
    fetchTrackEvents.mockResolvedValue(mockEvents)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders track name as heading', async () => {
    const page = await TrackPage({ params: Promise.resolve({ trackSlug: 'sleep' }) as any })
    const { container } = render(page)
    expect(screen.getByText('Sleep')).toBeInTheDocument()
  })

  it('calls fetchTrack with correct slug', async () => {
    await TrackPage({ params: Promise.resolve({ trackSlug: 'sleep' }) as any })
    expect(fetchTrack).toHaveBeenCalledWith('sleep')
  })

  it('calls fetchTrackEvents with correct slug', async () => {
    await TrackPage({ params: Promise.resolve({ trackSlug: 'sleep' }) as any })
    expect(fetchTrackEvents).toHaveBeenCalledWith('sleep')
  })

  it('renders TrackEventList component', async () => {
    const page = await TrackPage({ params: Promise.resolve({ trackSlug: 'sleep' }) as any })
    const { container } = render(page)
    expect(screen.getByTestId('track-event-list')).toBeInTheDocument()
  })

  it('renders DateScroller component', async () => {
    const page = await TrackPage({ params: Promise.resolve({ trackSlug: 'sleep' }) as any })
    const { container } = render(page)
    expect(screen.getByTestId('date-scroller')).toBeInTheDocument()
  })
})
