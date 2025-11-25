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
      notes: 'First event',
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
      notes: null,
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

  it('displays event notes when present', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    expect(screen.getByText('First event')).toBeInTheDocument();
  });

  it('displays formatted dates', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    expect(screen.getByText('21 October 2025')).toBeInTheDocument();
    expect(screen.getByText('20 October 2025')).toBeInTheDocument();
  });

  it('displays the event time in the card header', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
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

  it('makes events clickable with correct links', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    const event1Link = screen.getByText('Event 1').closest('a');
    expect(event1Link).toHaveAttribute('href', '/tracks/test-track/1');

    const event2Link = screen.getByText('Event 2').closest('a');
    expect(event2Link).toHaveAttribute('href', '/tracks/test-track/2');
  });

  it('groups events by date and only shows the date once per group', () => {
    const groupedEvents: EventResponse[] = [
      mockEvents[0],
      {
        ...mockEvents[0],
        id: '3',
        title: 'Second Event Same Day',
      },
      mockEvents[1],
    ];

    render(<TrackEventList events={groupedEvents} trackSlug={trackSlug} />);

    const dateLabels = screen.getAllByText('21 October 2025');
    expect(dateLabels).toHaveLength(1);
  });

  it('renders a timeline node for each event and a single connector line', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    const timelineNodes = screen.getAllByTestId('timeline-node');
    expect(timelineNodes).toHaveLength(mockEvents.length);

    // Single continuous connector line spanning the entire timeline
    const connectors = screen.queryAllByTestId('timeline-connector');
    expect(connectors).toHaveLength(1);
  });

  it('highlights active event', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} activeEventId="1" />);

    const activeCard = screen
      .getAllByTestId('track-event-card')
      .find((card) => card.getAttribute('data-active') === 'true');
    expect(activeCard).toBeDefined();
    expect(activeCard).toHaveTextContent('Event 1');

    const activeTimelineNode = screen
      .getAllByTestId('timeline-node')
      .find((node) => node.getAttribute('data-active') === 'true');
    expect(activeTimelineNode).toBeDefined();
  });

  it('does not highlight when no active event', () => {
    render(<TrackEventList events={mockEvents} trackSlug={trackSlug} />);

    const activeCards = screen
      .getAllByTestId('track-event-card')
      .filter((card) => card.getAttribute('data-active') === 'true');
    expect(activeCards).toHaveLength(0);
  });
});
