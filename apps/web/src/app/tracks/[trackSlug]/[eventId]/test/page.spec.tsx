import { render, screen } from '@testing-library/react'
import EventSlotPage from '../page'
import { EventType, type EventResponse } from '@packages/types'
import { fetchEvent } from '@/lib/fetch_event'

jest.mock('@/lib/fetch_event', () => ({
  fetchEvent: jest.fn(),
}))

jest.mock('@/components/event_detail', () => ({
  EventDetail: ({ event }: { event: EventResponse }) => (
    <div data-testid="event-detail">{event.title}</div>
  ),
}))

describe('EventSlotPage', () => {
  const mockEvent: EventResponse = {
    id: 'event-1',
    trackId: 'track-1',
    date: '2025-10-21T00:00:00.000Z',
    title: 'Test Event',
    description: 'Test description',
    type: EventType.NOTE,
    fileUrl: null,
    createdAt: '2025-10-21T00:00:00.000Z',
    updatedAt: '2025-10-21T00:00:00.000Z',
  }

  beforeEach(() => {
    jest.mocked(fetchEvent).mockResolvedValue(mockEvent)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches and renders event', async () => {
    const page = await EventSlotPage({
      params: Promise.resolve({ trackSlug: 'sleep', eventId: 'event-1' }),
    })
    render(page)
    expect(screen.getByTestId('event-detail')).toBeInTheDocument()
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('calls fetchEvent with correct parameters', async () => {
    await EventSlotPage({
      params: Promise.resolve({ trackSlug: 'sleep', eventId: 'event-1' }),
    })
    expect(fetchEvent).toHaveBeenCalledWith('event-1', 'sleep')
  })
})
