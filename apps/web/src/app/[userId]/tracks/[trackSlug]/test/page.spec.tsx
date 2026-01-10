import { render, screen } from '@testing-library/react'
import TrackPage from '../page'
import { fetchTrack, fetchTrackEvents } from '../helpers'
import { EventType, type TrackResponse, type EventResponse } from '@packages/types'

// Mock the helpers
jest.mock('../helpers', () => {
  const actual = jest.requireActual('../helpers')
  return {
    ...actual,
    fetchTrack: jest.fn(),
    fetchTrackEvents: jest.fn()
  }
})

jest.mock('@/components/track_events_timeline', () => ({
  TrackEventsTimeline: ({
    events
  }: {
    events: EventResponse[]
    userId: string
    trackSlug: string
  }) => <div data-testid='track-timeline' data-past-count={events.length} />
}))

jest.mock('@/components/reminders_panel', () => ({
  RemindersPanel: () => <div data-testid='reminders-panel' />
}))

jest.mock('@/components/upcoming_events_panel', () => ({
  UpcomingEventsPanel: ({
    upcomingEvents
  }: {
    title: string
    upcomingEvents: Array<{ id: string; title: string; datetime: Date | string; href: string }>
  }) => <div data-testid='upcoming-events-panel' data-event-count={upcomingEvents.length} />
}))

jest.mock('@/lib/fetch_hub_notifications', () => ({
  fetchHubNotifications: jest.fn(async () => [])
}))

jest.mock('@/lib/fetch_tracks', () => ({
  fetchTracksWithCookies: jest.fn(async () => [])
}))

jest.mock('@/app/[userId]/helpers', () => ({
  mapTracksToHealthTrackSummary: jest.fn(() => [])
}))

jest.mock('@/components/hub_quick_actions/helpers', () => ({
  buildTrackOptions: jest.fn(() => [])
}))

// Mock TrackHeader component
jest.mock('@/components/track_header', () => ({
  TrackHeader: ({ track }: { track: TrackResponse }) => (
    <div data-testid='track-header'>
      <h1>{track.title}</h1>
    </div>
  )
}))

const mockFetchTrack = fetchTrack as jest.MockedFunction<typeof fetchTrack>
const mockFetchTrackEvents = fetchTrackEvents as jest.MockedFunction<typeof fetchTrackEvents>

describe('TrackPage', () => {
  const mockTrack: TrackResponse = {
    id: 'track-1',
    userId: 'user-1',
    title: 'Test Track',
    slug: 'test-track',
    description: 'Test description',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  const mockEvents: EventResponse[] = [
    {
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.RESULT,
      title: 'Event 1',
      notes: 'Description 1',
      fileUrl: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'event-2',
      trackId: 'track-1',
      date: '2024-01-02T00:00:00.000Z',
      type: EventType.RESULT,
      title: 'Event 2',
      notes: 'Description 2',
      fileUrl: null,
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders track name as heading', async () => {
    mockFetchTrack.mockResolvedValueOnce(mockTrack)
    mockFetchTrackEvents.mockResolvedValueOnce(mockEvents)

    const params = Promise.resolve({ userId: 'user-1', trackSlug: 'test-track' })
    const result = await TrackPage({ params })
    render(result)

    expect(screen.getByTestId('track-header')).toBeInTheDocument()
    expect(screen.getByText('Test Track')).toBeInTheDocument()
  })

  it('renders TrackEventList with events and trackSlug', async () => {
    mockFetchTrack.mockResolvedValueOnce(mockTrack)
    mockFetchTrackEvents.mockResolvedValueOnce(mockEvents)

    const params = Promise.resolve({ userId: 'user-1', trackSlug: 'test-track' })
    const result = await TrackPage({ params })
    render(result)

    expect(screen.getByTestId('reminders-panel')).toBeInTheDocument()
    expect(screen.getByTestId('track-timeline')).toBeInTheDocument()
    expect(screen.getByTestId('track-timeline')).toHaveAttribute('data-past-count', '2')
  })

  it('calls fetchTrack and fetchTrackEvents with correct slug', async () => {
    mockFetchTrack.mockResolvedValueOnce(mockTrack)
    mockFetchTrackEvents.mockResolvedValueOnce(mockEvents)

    const params = Promise.resolve({ userId: 'user-1', trackSlug: 'test-track' })
    await TrackPage({ params })

    expect(mockFetchTrack).toHaveBeenCalledWith('user-1', 'test-track')
    expect(mockFetchTrackEvents).toHaveBeenCalledWith('user-1', 'test-track')
  })

  it('renders empty event list when no events', async () => {
    mockFetchTrack.mockResolvedValueOnce(mockTrack)
    mockFetchTrackEvents.mockResolvedValueOnce([])

    const params = Promise.resolve({ userId: 'user-1', trackSlug: 'test-track' })
    const result = await TrackPage({ params })
    render(result)

    expect(screen.getByTestId('track-timeline')).toBeInTheDocument()
    expect(screen.getByTestId('track-timeline')).toHaveAttribute('data-past-count', '0')
  })
})
