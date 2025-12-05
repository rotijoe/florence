import { render, screen } from '@testing-library/react'
import TrackPage from '../page'
import { fetchTrack, fetchTrackEvents } from '../helpers'
import { EventType, type TrackResponse, type EventResponse } from '@packages/types'

// Mock the helpers
jest.mock('../helpers', () => ({
  fetchTrack: jest.fn(),
  fetchTrackEvents: jest.fn()
}))

// Mock TrackEventList component
jest.mock('@/components/track_event_list', () => ({
  TrackEventList: ({
    events,
    trackSlug
  }: {
    events: EventResponse[]
    trackSlug: string
    userId: string
  }) => (
    <div data-testid='track-event-list'>
      <div data-testid='track-slug'>{trackSlug}</div>
      {events.map((event) => (
        <div key={event.id} data-testid={`event-${event.id}`}>
          {event.title}
        </div>
      ))}
    </div>
  )
}))

// Mock TrackHeaderClient component
jest.mock('@/components/track_header/track_header_client', () => ({
  TrackHeaderClient: ({ track }: { track: TrackResponse }) => (
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

    expect(screen.getByTestId('track-event-list')).toBeInTheDocument()
    expect(screen.getByTestId('track-slug')).toHaveTextContent('test-track')
    expect(screen.getByTestId('event-event-1')).toBeInTheDocument()
    expect(screen.getByTestId('event-event-2')).toBeInTheDocument()
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

    expect(screen.getByTestId('track-event-list')).toBeInTheDocument()
    expect(screen.queryByTestId(/^event-/)).not.toBeInTheDocument()
  })
})
