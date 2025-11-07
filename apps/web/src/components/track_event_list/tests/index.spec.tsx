import { render, screen } from '@testing-library/react';
import { TrackEventList } from '../index';
import { EventType, type EventResponse } from '@packages/types';

describe('TrackEventList', () => {
  const mockEvents: EventResponse[] = [
    {
      id: '1',
      trackId: 'track-1',
      date: '2025-10-21T14:30:00.000Z',
      title: 'Event 1',
      description: 'First event',
      type: EventType.NOTE,
      fileUrl: null,
      createdAt: '2025-10-21T14:30:00.000Z',
      updatedAt: '2025-10-21T14:30:00.000Z',
    },
    {
      id: '2',
      trackId: 'track-1',
      date: '2025-10-20T10:00:00.000Z',
      title: 'Event 2',
      description: null,
      type: EventType.RESULT,
      fileUrl: null,
      createdAt: '2025-10-20T10:00:00.000Z',
      updatedAt: '2025-10-20T10:00:00.000Z',
    },
  ];

  const trackSlug = 'test-track';

  it('renders all events', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
  });

  it('displays event description when present', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    expect(screen.getByText('First event')).toBeInTheDocument();
  });

  it('displays formatted dates', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    expect(screen.getByText(/21 October 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/20 October 2025/i)).toBeInTheDocument();
  });

  it('displays event type', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    expect(screen.getByText('NOTE')).toBeInTheDocument();
    expect(screen.getByText('RESULT')).toBeInTheDocument();
  });

  it('renders empty state when no events', () => {
    render(<TrackEventList events={[]} trackSlug={trackSlug} />);

    expect(screen.getByText(/no events/i)).toBeInTheDocument();
  });

  it('displays file link when fileUrl is available', () => {
    const eventsWithFile: EventResponse[] = [
      {
        ...mockEvents[0],
        fileUrl: 'https://example.com/file.pdf',
      },
    ];

    render(<TrackEventList events={eventsWithFile} trackSlug={trackSlug} />);

    const link = screen.getByText(/view attached file/i);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/file.pdf');
  });

  it('makes events clickable with correct links', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    const event1Link = screen.getByText('Event 1').closest('a');
    expect(event1Link).toHaveAttribute('href', '/tracks/test-track/1');

    const event2Link = screen.getByText('Event 2').closest('a');
    expect(event2Link).toHaveAttribute('href', '/tracks/test-track/2');
  });

  it('highlights active event', () => {
    const { container } = render(
      <TrackEventList events={mockEvents} trackSlug={trackSlug} activeEventId="1" />
    );

    const activeCard = container.querySelector('.border-primary');
    expect(activeCard).toBeInTheDocument();
    expect(activeCard).toHaveTextContent('Event 1');
  });

  it('does not highlight when no active event', () => {
    const { container } = render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    const activeCards = container.querySelectorAll('.border-primary');
    expect(activeCards).toHaveLength(0);
  });
});
