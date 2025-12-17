import { render, screen } from '@testing-library/react'
import TrackPage from '../page'
import { fetchTrack, fetchTrackEvents } from '../helpers'
import { EventType, type TrackResponse, type EventResponse } from '@packages/types'

jest.mock('@/app/[userId]/helpers', () => ({
  fetchHubNotifications: jest.fn(async () => [])
}))

// Mock the helpers
jest.mock('../helpers', () => {
  const actual = jest.requireActual('../helpers')
  return {
    ...actual,
    fetchTrack: jest.fn(),
    fetchTrackEvents: jest.fn()
  }
})

jest.mock('@/components/track_quick_add_bar', () => ({
  TrackQuickAddBar: ({ userId, trackSlug }: { userId: string; trackSlug: string }) => (
    <div data-testid='track-quick-add-bar' data-user-id={userId} data-track-slug={trackSlug} />
  )
}))

jest.mock('@/components/track_timeline', () => ({
  TrackTimeline: ({
    futureAppointments,
    pastEvents
  }: {
    futureAppointments: EventResponse[]
    pastEvents: EventResponse[]
    userId: string
    trackSlug: string
  }) => (
    <div
      data-testid='track-timeline'
      data-future-count={futureAppointments.length}
      data-past-count={pastEvents.length}
    />
  )
}))

jest.mock('@/components/track_reminders_panel', () => ({
  TrackRemindersPanel: () => <div data-testid='track-reminders-panel' />
}))

// Mock TrackHeader component
jest.mock('@/components/track_header', () => ({
  TrackHeader: ({ track }: { track: TrackResponse }) => (
    <div data-testid='track-header'>
      <h1>{track.name}</h1>
    </div>
  )
}))

const mockFetchTrack = fetchTrack as jest.MockedFunction<typeof fetchTrack>
const mockFetchTrackEvents = fetchTrackEvents as jest.MockedFunction<typeof fetchTrackEvents>

describe('TrackPage', () => {
  const mockTrack: TrackResponse = {
    id: 'track-1',
    slug: 'test-track',
    name: 'Test Track',
    createdAt: '2024-01-01T00:00:00.000Z'
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

    expect(screen.getByTestId('track-quick-add-bar')).toBeInTheDocument()
    expect(screen.getByTestId('track-reminders-panel')).toBeInTheDocument()
    expect(screen.getByTestId('track-timeline')).toBeInTheDocument()
    expect(screen.getByTestId('track-timeline')).toHaveAttribute('data-future-count', '0')
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
    expect(screen.getByTestId('track-timeline')).toHaveAttribute('data-future-count', '0')
    expect(screen.getByTestId('track-timeline')).toHaveAttribute('data-past-count', '0')
  })
})
